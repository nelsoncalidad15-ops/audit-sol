# Portal de Auditoría de Calidad

Aplicación privada para consultar la matriz de auditoría, cargar evidencias y guardar el historial en Google Drive y Google Sheets.

## Puesta en marcha segura

1. En el Google Sheet, abre **Extensiones → Apps Script** y reemplaza el contenido por [`apps-script/Code.gs`](apps-script/Code.gs).
2. En **Project Settings → Script properties**, crea estas dos propiedades:
   - `AUDIT_API_TOKEN`: un valor largo, aleatorio y privado.
   - `DRIVE_ROOT_FOLDER_ID`: el ID de la carpeta privada de Drive donde guardar las evidencias.
3. Implementa una nueva versión como **Aplicación web**, ejecutada como tu cuenta. Copia la URL `/exec` de esa implementación.
4. En Netlify, conecta este repositorio y agrega como variables de entorno:
   - `APPS_SCRIPT_URL`: la URL `/exec` del paso anterior.
   - `AUDIT_API_TOKEN`: exactamente el mismo valor del paso 2.
5. En Netlify habilita **Identity**, deja el registro en modo **Invite only** e invita únicamente a las cuentas autorizadas.
6. Comparte la carpeta raíz de Drive solamente con esas mismas cuentas. Así podrán abrir los archivos que carguen o consulten.

Netlify usa `npm run build` y publica `dist` automáticamente mediante [`netlify.toml`](netlify.toml).

## Seguridad

La web no contiene la URL de Apps Script, el token, ni el ID de Drive. Los usuarios primero deben iniciar sesión; recién entonces una función privada de Netlify reenvía cada guardado al Script con el token secreto. El Script rechaza cualquier petición sin ese token y no entrega datos por `GET`.

Después de actualizar `Code.gs`, publica una nueva implementación de Apps Script. La URL anterior no debe considerarse protegida.
