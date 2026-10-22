PROYECTO COMBINADO: MIXTO + SONORA EN UN SOLO APK

Estructura:
- Mixto-Sonora/: aplicación Android nativa principal.
- Sonora-main/: código fuente original de Sonora. No se modifica.

Cómo compilar desde GitHub:
1. Sube TODO el contenido de este paquete a un único repositorio GitHub, manteniendo ambas carpetas en la raíz.
2. Asegúrate de que el workflow .github/workflows/build.yml está en la raíz del repositorio. (La carpeta del proyecto Android es Mixto-Sonora; por eso el workflow de este paquete debe estar en la raíz.)
3. En Actions ejecuta “Build Mixto + Sonora (una sola app Android)”.
4. Descarga el artefacto Mixto-Sonora-APK; dentro está app-debug.apk.

Sonora se compila como interfaz web y se incluye dentro del APK de Mixto. En Mixto aparece una pestaña Sonora. El código original de Sonora permanece en Sonora-main sin editarse.

Clasificación automática de biblioteca:
- Si configuras una URL HTTPS de la API original de Sonora en Ajustes, Mixto envía únicamente el título a esa API y guarda el género que devuelve.
- Si no configuras un servidor, Mixto usa un respaldo integrado de catálogo Apple/iTunes basado solo en el título. Ese respaldo no ofrece todo el análisis ampliado de la API (por ejemplo, la consulta de Gemini del servidor); el resultado se marca como orientativo.

NOTA SOBRE EL WORKFLOW: para que GitHub Actions lo detecte, el archivo de workflow debe quedar en la raíz del repositorio en .github/workflows/build.yml. Este paquete se ha preparado para subirse con el contenido de la carpeta Mixto-Sonora a la raíz junto con Sonora-main y .github.
