# Integración Mixto + Sonora (sin modificar Sonora)

## Qué se cambió

- Se modificó únicamente Mixto.
- El análisis de géneros de Mixto envía **solo el título** de cada canción a `GET /api/detect?q=<título>`.
- Mixto toma `primaryGenre` y los subgéneros devueltos por la API original de Sonora.
- La clasificación se guarda en la caché local y se utiliza en la biblioteca de Mixto.
- Sonora no se ha editado ni copiado dentro del código de Mixto. Su motor, sus fuentes y su lógica siguen siendo los originales.

## Configuración necesaria

La API de Sonora debe estar ejecutándose en un servidor accesible desde el teléfono Android. No basta con instalar el proyecto web de Sonora en el teléfono: su endpoint `/api/detect` debe estar publicado y accesible por HTTPS.

1. Publica el proyecto original de Sonora sin modificarlo.
2. Comprueba que `https://TU-SERVIDOR/api/health` responda con estado `ok`.
3. Abre Mixto → Ajustes → Reconocimiento musical · Sonora.
4. Introduce la URL base, por ejemplo `https://sonora.tudominio.com` (sin `/api/detect` al final) y guarda.
5. En Mixto → Biblioteca, pulsa **Identificar géneros**.

## Nota sobre el título

Se envía únicamente el título, tal como se solicitó. Si varias canciones tienen el mismo título, Sonora podría devolver una coincidencia distinta; en ese caso, se puede decidir posteriormente si se permite enviar el artista como dato auxiliar, pero esta versión no lo hace.

## Seguridad y disponibilidad

No se incluye ninguna clave API ni URL de servidor preconfigurada. La URL se guarda en los ajustes locales de Mixto. El servidor de Sonora debe contar con las variables de entorno y credenciales que ya requiere su proyecto original.
