package com.example.automix

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.provider.MediaStore
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

/**
 * Envía el título de cada canción a la API original de Sonora y guarda el género devuelto.
 * No modifica ni replica la lógica de reconocimiento de Sonora; no analiza el audio local.
 */
class GenreIdentificationWorker(appContext: Context, params: WorkerParameters) : CoroutineWorker(appContext, params) {
    companion object {
        const val UNIQUE_WORK_NAME = "automix_genre_scan"
        private const val PREFS = "automix"
        private const val CACHE_KEY = "genre_cache"
        private const val EVIDENCE_KEY = "genre_evidence"
        private const val SONORA_URL_PREF = "sonora_api_url"
        private const val AI_SOURCE = "Sonora"
        private const val CLASSIFIER_VERSION = "sonora-embedded-v1"
    }

    private data class Item(val uri: Uri, val title: String, val artist: String, val album: String)

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val prefs = applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val sonoraBaseUrl = prefs.getString(SONORA_URL_PREF, "").orEmpty().trim().trimEnd('/')
        try {
            val items = readLibrary()
            val cache = try { JSONObject(prefs.getString(CACHE_KEY, "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            val evidence = try { JSONObject(prefs.getString(EVIDENCE_KEY, "{}") ?: "{}") } catch (_: Exception) { JSONObject() }
            var identified = items.count { item ->
                val ev = evidence.optJSONObject(item.uri.toString())
                cache.optString(item.uri.toString()).isNotBlank() && ev?.optString("source") == AI_SOURCE && ev.optString("classifierVersion") == CLASSIFIER_VERSION
            }
            var processed = 0
            setProgress(workDataOf("status" to if (sonoraBaseUrl.isNotBlank()) "Preparando conexión con Sonora…" else "Preparando Sonora integrado…", "processed" to 0, "total" to items.size, "identified" to identified, "pending" to (items.size - identified).coerceAtLeast(0)))

            for (item in items) {
                if (isStopped) return@withContext Result.failure(workDataOf("status" to "Pausado"))
                val key = item.uri.toString()
                val prior = evidence.optJSONObject(key)
                val alreadyCurrent = cache.optString(key).isNotBlank() && prior?.optString("source") == AI_SOURCE && prior.optString("classifierVersion") == CLASSIFIER_VERSION
                if (!alreadyCurrent) {
                    cache.remove(key)
                    evidence.remove(key)
                    try {
                        val result = if (sonoraBaseUrl.isNotBlank()) querySonora(sonoraBaseUrl, item.title)
                            else queryEmbeddedSonoraFallback(item.title)
                        val genre = result.optString("genre", "").trim()
                        val sources = result.optJSONArray("sources") ?: JSONArray()
                        if (genre.isNotBlank() && !genre.equals("Desconocido", true) && !genre.equals("Otro", true)) {
                            cache.put(key, genre)
                            evidence.put(key, JSONObject()
                                .put("source", AI_SOURCE)
                                .put("classifierVersion", CLASSIFIER_VERSION)
                                .put("genre", genre)
                                .put("status", result.optString("status", "Resultado devuelto por Sonora"))
                                .put("reason", result.optString("reason", ""))
                                .put("estimated", false)
                                .put("sources", sources)
                                .put("timestamp", System.currentTimeMillis()))
                            identified++
                        } else {
                            evidence.put(key, JSONObject().put("source", AI_SOURCE).put("classifierVersion", CLASSIFIER_VERSION)
                                .put("status", "Sin clasificación: Sonora no pudo identificar el género")
                                .put("reason", result.optString("reason", ""))
                                .put("sources", sources))
                        }
                    } catch (e: Exception) {
                        val msg = e.message ?: e.javaClass.simpleName
                        evidence.put(key, JSONObject().put("source", AI_SOURCE).put("classifierVersion", CLASSIFIER_VERSION)
                            .put("status", "Error de consulta").put("error", msg.take(300)))
                        if (msg.contains("HTTP 401") || msg.contains("HTTP 403")) {
                            prefs.edit().putString(CACHE_KEY, cache.toString()).putString(EVIDENCE_KEY, evidence.toString()).apply()
                            return@withContext Result.failure(workDataOf("status" to "Sonora rechazó la solicitud (HTTP 401/403)", "processed" to processed, "total" to items.size, "identified" to identified, "pending" to (items.size - identified).coerceAtLeast(0)))
                        }
                        if (msg.contains("HTTP 429")) {
                            prefs.edit().putString(CACHE_KEY, cache.toString()).putString(EVIDENCE_KEY, evidence.toString()).apply()
                            return@withContext Result.failure(workDataOf("status" to "Límite de consultas de Sonora alcanzado (HTTP 429). Espera y reintenta.", "processed" to processed, "total" to items.size, "identified" to identified, "pending" to (items.size - identified).coerceAtLeast(0)))
                        }
                    }
                    prefs.edit().putString(CACHE_KEY, cache.toString()).putString(EVIDENCE_KEY, evidence.toString()).apply()
                    delay(700) // limita la velocidad de peticiones y reduce errores por cuota.
                }
                processed++
                setProgress(workDataOf("status" to if (sonoraBaseUrl.isNotBlank()) "Sonora: identificando géneros…" else "Sonora integrado: consultando catálogo…", "processed" to processed, "total" to items.size, "identified" to identified, "pending" to (items.size - identified).coerceAtLeast(0)))
            }
            prefs.edit().putString(CACHE_KEY, cache.toString()).putString(EVIDENCE_KEY, evidence.toString()).apply()
            Result.success(workDataOf("status" to if (sonoraBaseUrl.isNotBlank()) "Análisis con Sonora completado" else "Análisis con Sonora integrado completado (catálogo de respaldo)", "processed" to processed, "total" to items.size, "identified" to identified, "pending" to (items.size - identified).coerceAtLeast(0)))
        } catch (_: SecurityException) {
            Result.failure(workDataOf("status" to "Falta permiso para leer la biblioteca"))
        } catch (e: Exception) {
            Result.failure(workDataOf("status" to "Error al consultar Sonora: ${(e.message ?: e.javaClass.simpleName).take(200)}"))
        }
    }

    /** Respaldo sin servidor: reproduce la vía de catálogo que usa el cliente web de Sonora.
     * Solo envía el título a Apple/iTunes; el artista se toma de la respuesta del catálogo. */
    private fun queryEmbeddedSonoraFallback(title: String): JSONObject {
        val encodedTitle = URLEncoder.encode(title, "UTF-8")
        val url = URL("https://itunes.apple.com/search?term=$encodedTitle&entity=song&limit=5")
        val connection = (url.openConnection() as HttpURLConnection)
        connection.requestMethod = "GET"
        connection.connectTimeout = 12000
        connection.readTimeout = 20000
        connection.setRequestProperty("Accept", "application/json")
        try {
            val code = connection.responseCode
            val responseText = (if (code in 200..299) connection.inputStream else connection.errorStream)
                ?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (code !in 200..299) throw IllegalStateException("Catálogo musical HTTP $code")
            val response = JSONObject(responseText)
            val results = response.optJSONArray("results") ?: JSONArray()
            if (results.length() == 0) throw IllegalStateException("El catálogo no encontró la canción: $title")
            val track = results.optJSONObject(0) ?: throw IllegalStateException("Respuesta de catálogo no válida")
            val rawGenre = track.optString("primaryGenreName", "").trim()
            if (rawGenre.isBlank()) throw IllegalStateException("El catálogo no devolvió género para: $title")
            val artist = track.optString("artistName", "").trim()
            val trackTitle = track.optString("trackName", title).trim()
            val genre = refineCatalogGenre(rawGenre, "$artist $trackTitle")
            return JSONObject()
                .put("genre", genre)
                .put("reason", "Respaldo integrado de Sonora: catálogo Apple/iTunes; consulta enviada solo con el título.")
                .put("estimated", true)
                .put("status", "Catálogo integrado (resultado orientativo; servidor Sonora no configurado)")
                .put("sources", JSONArray().put("Apple iTunes Music Catalog"))
        } finally {
            connection.disconnect()
        }
    }

    /** Afinado conservador de etiquetas genéricas, siguiendo las familias principales del cliente Sonora. */
    private fun refineCatalogGenre(rawGenre: String, context: String): String {
        val value = "$rawGenre $context".lowercase()
        return when {
            listOf("bachata", "romeo santos", "aventura", "prince royce", "antony santos", "frank reyes").any { value.contains(it) } -> "Bachata Sensual & Tradicional"
            listOf("salsa", "hector lavoe", "héctor lavoe", "marc anthony", "willie colon", "willie colón", "ruben blades", "rubén blades", "celia cruz", "grupo niche", "gilberto santa rosa", "timba").any { value.contains(it) } -> "Salsa (Brava / Romántica)"
            listOf("cumbia", "ángeles azules", "angeles azules", "damas gratis", "celso piña", "sonidera", "villera", "ráfaga", "rafaga").any { value.contains(it) } -> "Cumbia (Sonidera / Villera / Tradicional)"
            listOf("reggaeton", "reguetón", "dembow", "bad bunny", "karol g", "rauw alejandro", "daddy yankee", "don omar").any { value.contains(it) } -> "Reggaetón"
            listOf("corridos tumbados", "peso pluma", "natanael cano", "fuerza regida", "regional mexicano", "banda sinaloense").any { value.contains(it) } -> "Regional Mexicano"
            listOf("vallenato", "silvestre dangond", "diomedes díaz", "diomedes diaz").any { value.contains(it) } -> "Vallenato"
            else -> rawGenre
        }
    }

    /** Envía únicamente el título a la API original de Sonora; su código no se modifica. */
    private fun querySonora(baseUrl: String, title: String): JSONObject {
        val encodedTitle = URLEncoder.encode(title, "UTF-8")
        val url = URL("$baseUrl/api/detect?q=$encodedTitle")
        val connection = (url.openConnection() as HttpURLConnection)
        connection.requestMethod = "GET"
        connection.connectTimeout = 15000
        connection.readTimeout = 45000
        connection.setRequestProperty("Accept", "application/json")
        try {
            val code = connection.responseCode
            val responseText = (if (code in 200..299) connection.inputStream else connection.errorStream)
                ?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (code !in 200..299) throw IllegalStateException("HTTP $code: ${responseText.take(300)}")
            val response = JSONObject(responseText)
            val genre = response.optString("primaryGenre", "").trim()
            if (genre.isBlank()) throw IllegalStateException("Sonora no devolvió primaryGenre para el título consultado")
            val result = JSONObject()
                .put("genre", genre)
                .put("reason", "Consulta a Sonora usando el título: $title")
                .put("estimated", false)
            val subgenres = response.optJSONArray("subgenres") ?: JSONArray()
            result.put("subgenres", subgenres)
            val sources = JSONArray()
            val sourceItems = response.optJSONArray("sources") ?: JSONArray()
            for (i in 0 until sourceItems.length()) {
                val item = sourceItems.optJSONObject(i) ?: continue
                sources.put(item.optString("name", item.optString("badge", "Fuente Sonora")))
            }
            result.put("sources", sources)
            return result
        } finally {
            connection.disconnect()
        }
    }
}
