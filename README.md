# Social Scheduler — todo dentro de GitHub

Sistema de programación y publicación automática en Facebook, Instagram y TikTok,
sin necesidad de servidor propio ni de Node instalado en tu computador.

## Cómo funciona

1. Programas una publicación abriendo un **Issue** (usa el botón "+ Nueva publicación" del dashboard).
2. Un GitHub Action guarda esos datos en `docs/data/schedule.json`.
3. Otro GitHub Action corre cada 5 minutos, revisa qué debe publicarse ya, y llama a la API
   de la red social correspondiente usando tokens guardados como **Secrets** (nunca visibles públicamente).
4. El dashboard (GitHub Pages) muestra el estado de cada publicación: pendiente, publicada o con error.

## Puesta en marcha (todo desde el navegador)

### 1. Sube este proyecto a un repositorio nuevo
- Crea un repositorio en https://github.com/new (puede ser público o privado).
- Ve a la pestaña **Add file → Upload files** y arrastra todo el contenido de esta carpeta.

### 2. Activa GitHub Pages
- Ve a **Settings → Pages**.
- En "Build and deployment", selecciona **Deploy from a branch**, rama `main`, carpeta `/docs`.
- Guarda. Tu dashboard quedará en `https://TU_USUARIO.github.io/TU_REPO/`.

### 3. Configura el dashboard
- Edita `docs/app.js` y reemplaza `GITHUB_OWNER` y `GITHUB_REPO` con tus datos reales.

### 4. Da permisos de escritura a las Actions
- Ve a **Settings → Actions → General → Workflow permissions**.
- Selecciona **Read and write permissions** (necesario para que los workflows puedan
  guardar el estado de las publicaciones).

### 5. Agrega tus credenciales como Secrets
Ve a **Settings → Secrets and variables → Actions → New repository secret** y agrega
los que necesites según qué ya tengas configurado en Meta/TikTok:

| Secret | Para qué |
|---|---|
| `FB_PAGE_ID` | ID de tu página de Facebook |
| `FB_PAGE_ACCESS_TOKEN` | Token de acceso de la página (larga duración) |
| `IG_BUSINESS_ACCOUNT_ID` | ID de tu cuenta de Instagram Business/Creator |
| `IG_ACCESS_TOKEN` | Token de acceso (el mismo sistema de Meta) |
| `TIKTOK_ACCESS_TOKEN` | Token de acceso de la Content Posting API de TikTok |

**No necesitas tenerlos todos desde el día uno.** Puedes empezar solo con Facebook,
por ejemplo, y agregar el resto cuando tengas las otras apps aprobadas.

### 6. Prueba el flujo
- Ve a la pestaña **Issues** de tu repo → **New issue** → elige la plantilla de publicación.
- Llena los campos y créalo.
- En unos segundos, un Action lo agregará a `schedule.json` (revísalo en la pestaña **Actions**).
- Cuando llegue la hora programada, el segundo Action lo publicará automáticamente.
- Puedes forzar una ejecución manual desde **Actions → Publish Scheduled Posts → Run workflow**,
  útil para probar sin esperar.

## Limitaciones importantes que debes saber

- **Meta (Facebook/Instagram)**: mientras tu app esté en modo de desarrollo, solo podrá
  publicar en páginas/cuentas donde tú mismo seas administrador de prueba. Para operar
  con cuentas de terceros necesitas pasar el proceso de revisión de la App Review de Meta.
- **TikTok**: el código publica en modo `SELF_ONLY` (borrador privado) por defecto. Publicar
  público requiere que tu app pase el proceso de auditoría de TikTok for Developers.
- **Precisión del cron**: GitHub Actions no garantiza que el cron corra exactamente cada
  5 minutos bajo alta carga de la plataforma; puede haber demoras de algunos minutos.
- **Medios**: las URLs de imagen/video deben ser públicamente accesibles en internet
  (puedes subirlas a Imgur, Cloudinary, o incluso a este mismo repo y usar la URL "raw").

## Estructura del proyecto

```
docs/                     → dashboard (GitHub Pages)
  index.html, style.css, app.js
  data/schedule.json      → "base de datos" de publicaciones
.github/
  ISSUE_TEMPLATE/schedule-post.yml   → formulario para programar posts
  workflows/
    sync-schedule.yml     → issue nuevo → entra a schedule.json
    publish-scheduled.yml → cron cada 5 min → publica lo que toque
scripts/
  publish.js              → lógica central de publicación
  platforms/              → un archivo por red social
```
