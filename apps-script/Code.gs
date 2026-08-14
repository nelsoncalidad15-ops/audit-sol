/**
 * Backend de Auditoría de Calidad.
 * Pegar este archivo completo en Extensiones > Apps Script de tu Google Sheet.
 */

const EVALUATION_SHEET = 'EVALUACION_AUDITORIA';
const HISTORY_SHEET = 'HISTORIAL_AUDITORIAS';
const EVIDENCE_SHEET = 'EVIDENCIAS';

function doGet() {
  try {
    const sheet = getEvaluationSheet_();
    const values = sheet.getDataRange().getValues();
    const evidenceMap = {};

    for (let row = 1; row < values.length; row++) {
      const code = String(values[row][0] || '').trim();
      if (!code) continue;

      let evidences = [];
      try {
        const storedEvidences = values[row][9];
        if (typeof storedEvidences === 'string' && storedEvidences.startsWith('[')) {
          evidences = JSON.parse(storedEvidences);
        }
      } catch (error) {
        // A malformed evidence value must not block the rest of the audit data.
      }

      evidenceMap[code] = {
        status: normalizeStatus_(values[row][6]),
        finding: values[row][7] || '',
        evidences: evidences,
        lastUpdated: values[row][10] || ''
      };
    }

    return json_({
      success: true,
      timestamp: new Date().toISOString(),
      evidenceMap: evidenceMap
    });
  } catch (error) {
    return json_({ success: false, error: String(error) });
  }
}

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents || '{}');
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
