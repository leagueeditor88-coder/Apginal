# 🎵 SonoraGenre - Detector de Género Musical Automático

Aplicación web y móvil para determinar con precisión el género musical de cualquier canción a partir de su título o artista (ej: `"j Balvin - azul determinar genero"`), consultando bases de datos externas en tiempo real (Apple iTunes API, MusicBrainz Open Archive y Gemini AI Musicology) sin encasillar la música hispana bajo términos genéricos o vagos como "Latino" o "Tropical".

---

## 🚀 Cómo subir a GitHub y compilar tu APK (Automático)

Ya hemos configurado un **Flujo de Trabajo Automatizado (GitHub Actions)** en `.github/workflows/build-apk.yml` que compilará el archivo `.apk` de Android directamente en la nube de GitHub, sin que necesites tener Android Studio ni SDK instalados en tu computadora.

### Paso 1: Subir el proyecto a GitHub

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# 1. Iniciar el repositorio git
git init

# 2. Agregar todos los archivos
git add .

# 3. Crear el primer commit
git commit -m "feat: sonora-genre app con soporte android apk"

# 4. Conectar con tu repositorio de GitHub (reemplaza con tu URL de GitHub)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 5. Subir a la rama principal
git branch -M main
git push -u origin main
```

---

### Paso 2: Descargar tu APK compilado en GitHub

1. Entra a tu repositorio en GitHub desde tu navegador (`https://github.com/TU_USUARIO/TU_REPOSITORIO`).
2. Haz clic en la pestaña superior **"Actions"** (Acciones).
3. Verás una tarea en ejecución llamada **"Compilar APK Android"**.
4. Espera entre 2 y 4 minutos mientras GitHub compila tu APK.
5. Al finalizar (marcado con un check verde ✅), haz clic en la ejecución.
6. En la parte inferior, en la sección **"Artifacts"**, encontrarás el archivo descargable **`SonoraGenre-debug-apk.zip`**.
7. Descomprímelo y tendrás el archivo **`app-debug.apk`** listo para instalar en cualquier teléfono Android.

---

## 💻 Compilación Local del APK con Capacitor (Opcional)

Si tienes **Android Studio** y Java instalados en tu computadora y prefieres compilarlo localmente:

```bash
# 1. Instalar dependencias (Capacitor ya está en package.json; requiere Node 22+ y JDK 21)
npm install

# 2. Crear la plataforma Android (solo la primera vez)
npx cap add android

# 3. Compilar la aplicación web y sincronizar con Android
npm run cap:build

# 4. Abrir el proyecto nativo en Android Studio
npm run cap:open
```

Una vez que se abra **Android Studio**:
1. Ve al menú superior: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Android Studio generará tu archivo `.apk` en:
   `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 🛠️ Tecnologías y Fuentes de Datos Externas

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS.
- **Bases de datos externas**:
  - **Apple iTunes & Apple Music API**: Metadatos oficiales de disqueras, carátulas HD y muestras oficiales de audio de 30s.
  - **MusicBrainz**: Enciclopedia musical abierta con tags comunitarios e ISRC.
  - **Gemini 2.5 Flash Musicologist**: Análisis acústico de compás, BPM, instrumentación y linaje cultural.
- **Motor Anti-Etiquetas Perezosas**: Identificación granular de Bachata, Salsa Brava, Cumbia, Corridos Tumbados, Reggaetón, Rock en Español, etc., desglosando las etiquetas genéricas "Latino" o "Tropical".
- **Empaquetador Nativo**: Capacitor Mobile para Android.
