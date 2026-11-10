# Portal de Auditoría de Calidad

Web React publicada en Cloudflare Workers, con acceso por contraseña y datos en Google Drive y Sheets.

## Publicar desde GitHub

1. En Cloudflare, abre **Workers & Pages → audit-sol → Settings → Builds** y selecciona `nelsoncalidad15-ops/audit-sol`.
2. Configura la rama `main`, el comando de compilación `npm run build` y el comando de implementación `npx wrangler deploy`. El archivo `wrangler.toml` define `dist` como carpeta de archivos estáticos y `server/worker.mjs` como servidor.
3. Después del primer despliegue del Worker con código, en **Settings → Variables and Secrets de runtime**, agrega como secretos de producción:
   - `APPS_SCRIPT_URL`: URL `/exec` de la implementación actual de Apps Script.
   - `AUDIT_API_TOKEN`: mismo token configurado en las propiedades del Script.
   - `PORTAL_PASSWORD`: contraseña del equipo.
4. Vuelve a desplegar después de configurar los secretos. No los agregues al repositorio ni uses el prefijo `VITE_`.
5. Comprueba el ingreso, `/iso-9001`, `/pcgc`, la carga de datos y el guardado de una evidencia en la URL de Cloudflare.
6. Una vez comprobado, detén la publicación automática de Netlify y retira allí el dominio personalizado, si existe. Configura ese dominio en Cloudflare antes de compartirlo.

Cada actualización enviada a `main` genera una nueva publicación. No es necesario cambiar Apps Script al migrar desde Netlify: reutiliza su implementación y sus valores actuales. Configura secretos de preview solo si esas versiones deben acceder a los datos reales.

## Configuración inicial de Google

Si todavía no está configurado, copia `apps-script/Code.gs` al proyecto vinculado al Google Sheet. Define `AUDIT_API_TOKEN` y `DRIVE_ROOT_FOLDER_ID` en las propiedades del Script y publica una aplicación web ejecutada como tu cuenta. Comparte la carpeta de Drive únicamente con las personas autorizadas.

## Funcionamiento

Las funciones de `functions/api/` verifican la contraseña y una cookie de sesión firmada con duración de 12 horas. El servidor reenvía al Script las operaciones autorizadas, agregando el token secreto. La contraseña y el token no forman parte del JavaScript del navegador.

`wrangler.toml` configura Workers y la compatibilidad Node necesaria para la firma criptográfica. Las rutas `/api/*` ejecutan el servidor; el resto se entrega como archivos estáticos con resolución SPA.

## Verificación local

- `npm run build`: compila la interfaz.
- `node --test tests/cloudflare.test.mjs`: comprueba acceso y autorización de la API.
- Para probar con Cloudflare localmente: `npx wrangler dev`, con los secretos en `.dev.vars` (ignorado por Git).

El servidor Vite por sí solo no ejecuta las funciones de Cloudflare.

## Documentos para la auditoría

- Cada punto muestra sus documentos con acceso directo y descarga para archivos de Drive.
- **Agregar evidencia** permite subir un archivo (hasta 4 MB), pegar un enlace o vincular un documento ya cargado en otro punto de la misma auditoría.
- Usá un nombre reconocible (por ejemplo, `PR-07 · Procedimiento de compras`), clase y revisión para encontrarlo después.
- El checklist y el Modo Auditor buscan por código, nombre del documento y revisión. En el celular, el checklist comienza en tarjetas.
- **Qué pide este punto** contiene solamente la explicación del requisito. Los documentos se gestionan por separado.
- Quitar un vínculo lo retira únicamente del punto: conserva el archivo en Drive y los demás vínculos. Cada punto mantiene su propia verificación.
