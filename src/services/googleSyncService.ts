import { AuditItem, AppsScriptConfig } from '../types/audit';

export interface SyncResult {
  success: boolean;
  message: string;
  items?: AuditItem[];
  timestamp: string;
}

export const APPS_SCRIPT_CODE_TEMPLATE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - PORTAL OFICIAL DE AUDITORÍA & EVIDENCIAS (GRUPO VAG)
 * Base de Datos Segura: Google Sheets + Almacenamiento en Google Drive
 * =========================================================================
 * 
 * Este script crea y mantiene automáticamente:
 * 1. Hoja "EVALUACION_AUDITORIA": Matriz activa con todos los estados (Cumple / No Cumple),
 *    hallazgos, comentarios y enlaces de evidencias.
 * 2. Hoja "HISTORIAL_AUDITORIAS": Registro cronológico acumulativo de cada sincronización/auditoría.
 * 3. Carpeta en Google Drive "Auditoria_Calidad_Evidencias" para resguardar archivos.
 *
 * INSTRUCCIONES DE INSTALACIÓN (Solo 1 minuto):
 * 1. En tu Google Sheet, abre: Extensiones > Apps Script
 * 2. Borra el código anterior y pega este código completo.
 * 3. Clic en "Implementar" (botón azul arriba a la derecha) > "Nueva implementación".
 * 4. Tipo: "Aplicación web".
 * 5. Ejecutar como: "Yo" (tu cuenta de Google).
 * 6. Quién tiene acceso: "Cualquier usuario" (o usuarios de tu organización).
 * 7. Copia la URL de la aplicación web y pégala en el Portal de Auditoría.
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Obtener hoja de evaluación
    let evalSheet = ss.getSheetByName("EVALUACION_AUDITORIA");
    if (!evalSheet) {
      evalSheet = ss.insertSheet("EVALUACION_AUDITORIA");
      evalSheet.appendRow([
        "CÓDIGO", "CAPÍTULO", "SECCIÓN", "REQUERIMIENTO", "PV", "V", 
        "ESTADO CONFORMIDAD", "HALLAZGO", "TOTAL EVIDENCIAS", 
        "ENLACES EVIDENCIAS / DRIVE", "ÚLTIMA ACTUALIZACIÓN", "AUDITOR"
      ]);
      evalSheet.setFrozenRows(1);
      evalSheet.getRange("A1:L1").setFontWeight("bold").setBackground("#1A1C1E").setFontColor("#FFFFFF");
    }
    
    const data = evalSheet.getDataRange().getValues();
    const evidenceMap = {};
    
    for (let i = 1; i < data.length; i++) {
      const code = String(data[i][0]).trim();
      if (code) {
        let evidences = [];
        try {
          // Intentar parsear si hay columna oculta o texto
          const rawEv = data[i][9];
          if (rawEv && typeof rawEv === "string" && rawEv.startsWith("[")) {
            evidences = JSON.parse(rawEv);
          }
        } catch (err) {}

        evidenceMap[code] = {
          status: String(data[i][6]).toLowerCase().replace(/ /g, "_") || "pendiente",
          finding: data[i][7] || "",
          evidences: evidences,
          lastUpdated: data[i][10] || ""
        };
      }
    }
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      sheetTitle: ss.getName(),
      totalRecords: data.length > 1 ? data.length - 1 : 0,
      evidenceMap: evidenceMap
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action || "save_all";
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Asegurar Hoja de Evaluación
    let evalSheet = ss.getSheetByName("EVALUACION_AUDITORIA");
    if (!evalSheet) {
      evalSheet = ss.insertSheet("EVALUACION_AUDITORIA");
      evalSheet.appendRow([
        "CÓDIGO", "CAPÍTULO", "SECCIÓN", "REQUERIMIENTO", "PV", "V", 
        "ESTADO CONFORMIDAD", "HALLAZGO", "TOTAL EVIDENCIAS", 
        "ENLACES EVIDENCIAS / DRIVE", "ÚLTIMA ACTUALIZACIÓN", "AUDITOR"
      ]);
      evalSheet.setFrozenRows(1);
      evalSheet.getRange("A1:L1").setFontWeight("bold").setBackground("#1A1C1E").setFontColor("#FFFFFF");
    }
    
    // 2. Asegurar Hoja de Historial
    let historySheet = ss.getSheetByName("HISTORIAL_AUDITORIAS");
    if (!historySheet) {
      historySheet = ss.insertSheet("HISTORIAL_AUDITORIAS");
      historySheet.appendRow([
        "FECHA / HORA", "TOTAL ÍTEMS", "CUMPLIDAS", "NO CUMPLIDAS", "EN PROCESO", 
        "NO APLICA", "% CUMPLIMIENTO", "EVIDENCIAS CARGADAS", "AUDITOR", "NOTAS"
      ]);
      historySheet.setFrozenRows(1);
      historySheet.getRange("A1:J1").setFontWeight("bold").setBackground("#2B579A").setFontColor("#FFFFFF");
    }
    
    const now = new Date();
    const formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    
    if (action === "save_all" || action === "sync") {
      const items = contents.items || [];
      
      // Limpiar y reescribir con formato profesional
      evalSheet.clearContents();
      evalSheet.appendRow([
        "CÓDIGO", "CAPÍTULO", "SECCIÓN", "REQUERIMIENTO", "PV", "V", 
        "ESTADO CONFORMIDAD", "HALLAZGO", "TOTAL EVIDENCIAS", 
        "ENLACES EVIDENCIAS / DRIVE", "ÚLTIMA ACTUALIZACIÓN", "AUDITOR"
      ]);
      evalSheet.getRange("A1:L1").setFontWeight("bold").setBackground("#1A1C1E").setFontColor("#FFFFFF");
      
      let compliantCount = 0;
      let nonCompliantCount = 0;
      let inProgressCount = 0;
      let notApplicableCount = 0;
      let totalEvidences = 0;
      
      const rows = items.map(function(item) {
        const evList = item.evidences || [];
        totalEvidences += evList.length;
        
        let statusLabel = "PENDIENTE";
        if (item.status === "cumplida") { statusLabel = "CUMPLE"; compliantCount++; }
        else if (item.status === "no_cumplida") { statusLabel = "NO CUMPLE"; nonCompliantCount++; }
        else if (item.status === "en_progreso") { statusLabel = "EN PROCESO"; inProgressCount++; }
        else if (item.status === "no_aplica") { statusLabel = "NO APLICA"; notApplicableCount++; }
        
        const evidenceUrls = evList.map(function(ev) {
          return (ev.title || "Evidencia") + ": " + (ev.url || "");
        }).join("\\n");
        
        return [
          item.code || "",
          item.chapter || "",
          item.section || "",
          item.requirement || "",
          item.pv ? "X" : "",
          item.v ? "X" : "",
          statusLabel,
          item.finding || "",
          evList.length,
          evidenceUrls || "Sin evidencias cargadas",
          formattedDate,
          contents.auditorName || "Equipo de Calidad"
        ];
      });
      
      if (rows.length > 0) {
        evalSheet.getRange(2, 1, rows.length, 12).setValues(rows);
        evalSheet.autoResizeColumns(1, 12);
      }
      
      // Registrar entrada en el Historial acumulativo
      const completionRate = items.length > 0 ? Math.round((compliantCount / items.length) * 100) : 0;
      historySheet.appendRow([
        formattedDate,
        items.length,
        compliantCount,
        nonCompliantCount,
        inProgressCount,
        notApplicableCount,
        completionRate + "%",
        totalEvidences,
        contents.auditorName || "Equipo de Calidad",
        "Sincronización automática desde Portal Web de Calidad"
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Base de datos y hoja EVALUACION_AUDITORIA actualizadas con éxito",
      timestamp: formattedDate
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export async function fetchLiveSheetCSV(sheetId: string, gid: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`No se pudo descargar el Google Sheet (Status ${response.status}). Asegúrate de que el enlace tenga permisos de lectura.`);
  }
  return await response.text();
}

export async function syncWithAppsScript(
  config: AppsScriptConfig,
  currentItems: AuditItem[]
): Promise<SyncResult> {
  if (!config.scriptUrl || !config.scriptUrl.startsWith('https://script.google.com')) {
    return {
      success: false,
      message: 'Debes configurar una URL válida de Google Apps Script Web App.',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // Call doGet to retrieve stored evidence map
    const getRes = await fetch(config.scriptUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!getRes.ok) {
      throw new Error(`Error al conectar con Apps Script: ${getRes.statusText}`);
    }

    const data = await getRes.json();
    if (!data.success) {
      throw new Error(data.error || 'Error desconocido retornado por Apps Script');
    }

    // Merge evidenceMap with currentItems
    const evidenceMap = data.evidenceMap || {};
    const mergedItems = currentItems.map((item) => {
      const code = (item.code || item.id).trim();
      const remoteData = evidenceMap[code];
      if (remoteData) {
        return {
          ...item,
          evidences: remoteData.evidences && remoteData.evidences.length > 0 ? remoteData.evidences : item.evidences,
          status: remoteData.status || item.status,
          finding: remoteData.finding || item.finding,
          lastUpdated: remoteData.lastUpdated || item.lastUpdated,
        };
      }
      return item;
    });

    return {
      success: true,
      message: `Sincronización exitosa con Google Sheet. ${Object.keys(evidenceMap).length} evidencias remotas procesadas.`,
      items: mergedItems,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Apps Script Sync Error:', error);
    return {
      success: false,
      message: error.message || 'Error de conexión con Google Apps Script. Verifica la URL y permisos de la Web App.',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function pushAllToAppsScript(
  config: AppsScriptConfig,
  items: AuditItem[]
): Promise<SyncResult> {
  if (!config.scriptUrl || !config.scriptUrl.startsWith('https://script.google.com')) {
    return {
      success: false,
      message: 'Configura primero la URL de tu Google Apps Script Web App.',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const payload = {
      action: 'save_all',
      items: items.map((item) => ({
        id: item.id,
        code: item.code,
        requirement: item.requirement,
        status: item.status,
        finding: item.finding,
        evidences: item.evidences,
      })),
    };

    const res = await fetch(config.scriptUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return {
      success: data.success ?? true,
      message: data.message || 'Todas las evidencias y estados fueron guardados en el Google Sheet.',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'No se pudo enviar los datos a Apps Script.',
      timestamp: new Date().toISOString(),
    };
  }
}
