/**
 * Backend de Auditoría de Calidad.
 * Pegar este archivo completo en Extensiones > Apps Script de tu Google Sheet.
 */

const EVALUATION_SHEET = 'EVALUACION_AUDITORIA';
const HISTORY_SHEET = 'HISTORIAL_AUDITORIAS';
const EVIDENCE_SHEET = 'EVIDENCIAS';
const DRIVE_ROOT_FOLDER = 'Auditoría Calidad Autosol';
const DRIVE_ROOT_FOLDER_ID = '';

function doGet() {
  return json_({ success: false, error: 'Método no autorizado.' });
}

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents || '{}');
    if (!isAuthorized_(request.token)) return json_({ success: false, error: 'No autorizado.' });
    if (request.action === 'upload_evidence') {
      return uploadEvidence_(request);
    }
    const items = request.items || [];
    const now = new Date();
    const dateText = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const evaluation = getEvaluationSheet_();
    const history = getHistorySheet_();
    const evidenceSheet = getEvidenceSheet_();

    evaluation.clearContents();
    evaluation.getRange(1, 1, 1, 12).setValues([[
      'CÓDIGO', 'CAPÍTULO', 'SECCIÓN', 'REQUERIMIENTO', 'PV', 'V',
      'ESTADO', 'HALLAZGO', 'TOTAL EVIDENCIAS', 'EVIDENCIAS (JSON)',
      'ÚLTIMA ACTUALIZACIÓN', 'AUDITOR'
    ]]);
    formatHeader_(evaluation.getRange(1, 1, 1, 12));

    evidenceSheet.clearContents();
    evidenceSheet.getRange(1, 1, 1, 9).setValues([[
      'CÓDIGO', 'TIPO', 'NOMBRE', 'ENLACE', 'DESCRIPCIÓN',
      'FECHA DE ALTA', 'ÚLTIMA SINCRONIZACIÓN', 'ESTADO', 'CAPÍTULO'
    ]]);
    formatHeader_(evidenceSheet.getRange(1, 1, 1, 9));

    const totals = { cumplida: 0, no_cumplida: 0, en_progreso: 0, no_aplica: 0, evidences: 0 };
    const evidenceRows = [];
    const rows = items.map(function(item) {
      const evidences = item.evidences || [];
      const status = normalizeStatus_(item.status);
      if (Object.prototype.hasOwnProperty.call(totals, status)) totals[status]++;
      totals.evidences += evidences.length;
      evidences.forEach(function(evidence) {
        evidenceRows.push([
          item.code || item.id || '',
          evidence.type || 'other',
          evidence.title || 'Evidencia',
          evidence.url || '',
          evidence.description || '',
          evidence.addedAt || '',
          dateText,
          status,
          item.chapter || ''
        ]);
      });

      return [
        item.code || item.id || '',
        item.chapter || '',
        item.section || '',
        item.requirement || '',
        item.pv ? 'X' : '',
        item.v ? 'X' : '',
        status,
        item.finding || '',
        evidences.length,
        JSON.stringify(evidences),
        dateText,
        request.auditorName || 'Equipo de Calidad'
      ];
    });

    if (rows.length) {
      evaluation.getRange(2, 1, rows.length, 12).setValues(rows);
      evaluation.autoResizeColumns(1, 12);
      evaluation.setFrozenRows(1);
    }

    if (evidenceRows.length) {
      evidenceSheet.getRange(2, 1, evidenceRows.length, 9).setValues(evidenceRows);
      evidenceSheet.autoResizeColumns(1, 9);
      evidenceSheet.setFrozenRows(1);
    }

    history.appendRow([
      dateText,
      items.length,
      totals.cumplida,
      totals.no_cumplida,
      totals.en_progreso,
      totals.no_aplica,
      items.length ? Math.round((totals.cumplida / items.length) * 100) + '%' : '0%',
      totals.evidences,
      request.auditorName || 'Equipo de Calidad',
      'Sincronización automática desde la aplicación'
    ]);

    return json_({ success: true, message: 'Auditoría sincronizada', timestamp: now.toISOString() });
  } catch (error) {
    return json_({ success: false, error: String(error) });
  }
}

function getEvaluationSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(EVALUATION_SHEET);
  if (!sheet) sheet = spreadsheet.insertSheet(EVALUATION_SHEET);
  return sheet;
}

function getHistorySheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(HISTORY_SHEET);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(HISTORY_SHEET);
    sheet.appendRow([
      'FECHA / HORA', 'TOTAL ÍTEMS', 'CUMPLIDAS', 'NO CUMPLIDAS',
      'EN PROCESO', 'NO APLICA', '% CUMPLIMIENTO', 'EVIDENCIAS', 'AUDITOR', 'NOTAS'
    ]);
    formatHeader_(sheet.getRange(1, 1, 1, 10));
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getEvidenceSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(EVIDENCE_SHEET);
  if (!sheet) sheet = spreadsheet.insertSheet(EVIDENCE_SHEET);
  return sheet;
}

function uploadEvidence_(request) {
  const file = request.file || {};
  const evidence = request.evidence || {};
  const item = request.item || {};
  if (!file.base64 || !file.name || !item.code) {
    return json_({ success: false, error: 'Faltan los datos del archivo o del criterio.' });
  }

  const root = getAuditRootFolder_(request.driveFolderId);
  const criterionFolder = getOrCreateFolder_(sanitizeFolderName_(item.code + ' - ' + (item.chapter || 'Evidencias')), root);
  const blob = Utilities.newBlob(Utilities.base64Decode(file.base64), file.mimeType || 'application/octet-stream', file.name);
  const driveFile = criterionFolder.createFile(blob);

  return json_({
    success: true,
    evidence: {
      id: evidence.id,
      type: evidence.type || 'other',
      title: evidence.title || file.name,
      url: driveFile.getUrl(),
      description: evidence.description || '',
      addedAt: evidence.addedAt || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      verified: true,
      fileSize: Math.round(driveFile.getSize() / 1024) + ' KB'
    }
  });
}

function getOrCreateFolder_(name, parent) {
  const folders = parent ? parent.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : (parent ? parent.createFolder(name) : DriveApp.createFolder(name));
}

function getAuditRootFolder_(configuredFolder) {
  const storedFolder = PropertiesService.getScriptProperties().getProperty('DRIVE_ROOT_FOLDER_ID');
  const rawFolder = String(configuredFolder || storedFolder || DRIVE_ROOT_FOLDER_ID || '').trim();
  const matches = rawFolder.match(/folders\/([^/?]+)/);
  const folderId = matches ? matches[1] : rawFolder;
  return folderId
    ? DriveApp.getFolderById(folderId)
    : getOrCreateFolder_(DRIVE_ROOT_FOLDER);
}

function sanitizeFolderName_(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '-').substring(0, 120);
}

function formatHeader_(range) {
  range.setFontWeight('bold').setBackground('#1A1C1E').setFontColor('#FFFFFF');
}

function normalizeStatus_(value) {
  const status = String(value || 'pendiente').toLowerCase().replace(/ /g, '_');
  return ['cumplida', 'no_cumplida', 'en_progreso', 'no_aplica', 'pendiente'].indexOf(status) >= 0
    ? status
    : 'pendiente';
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function isAuthorized_(token) {
  const expectedToken = PropertiesService.getScriptProperties().getProperty('AUDIT_API_TOKEN');
  return Boolean(expectedToken && token && expectedToken === token);
}
