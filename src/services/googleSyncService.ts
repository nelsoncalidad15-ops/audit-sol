import type { AuditItem, EvidenceLink } from '../types/audit';
import type { AuditKey, AuditRunContext } from '../data/auditConfig';
import type { AuditRunState } from './storageService';

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
}

async function callSecureAuditApi(payload: Record<string, unknown>) {
  const response = await fetch('/.netlify/functions/audit', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const raw = await response.text();
  let result: Record<string, any> = {};
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    // A missing Netlify function can return an HTML 404 page instead of JSON.
  }
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'El servicio de carga no está disponible. Esperá unos segundos y reintentá.');
  }
  return result;
}

export async function uploadEvidenceToAppsScript(
  item: AuditItem,
  evidence: Pick<EvidenceLink, 'id' | 'type' | 'title' | 'description' | 'addedAt'>,
  file: File,
  auditKey: AuditKey = 'iso9001',
  auditRun?: AuditRunContext,
): Promise<EvidenceLink> {
  const maxUploadBytes = 4 * 1024 * 1024;
  if (file.size > maxUploadBytes) {
    throw new Error('El archivo supera 4 MB. Elegí una versión más liviana para guardarlo desde la matriz.');
  }

  const fileData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.readAsDataURL(file);
  });

  const result = await callSecureAuditApi({
    action: 'upload_evidence',
    auditKey,
    auditRun,
    item: { code: item.code, chapter: item.chapter },
    evidence,
    file: { name: file.name, mimeType: file.type || 'application/octet-stream', base64: fileData },
  });
  if (!result.evidence) throw new Error(result.error || 'No se pudo guardar el archivo.');
  return result.evidence as EvidenceLink;
}

export async function pushAllToAppsScript(items: AuditItem[], auditKey: AuditKey = 'iso9001', auditRun?: AuditRunContext, auditState?: AuditRunState): Promise<SyncResult> {
  try {
    const data = await callSecureAuditApi({
      action: 'save_all',
      auditKey,
      auditRun,
      auditState,
      items: items.map(({ id, code, chapter, section, requirement, pv, v, status, finding, evidences }) => ({
        id, code, chapter, section, requirement, pv, v, status, finding, evidences,
      })),
    });
    return {
      success: data.success ?? true,
      message: data.message || 'Cambios guardados.',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'No se pudieron guardar los cambios.',
      timestamp: new Date().toISOString(),
    };
  }
}
