import type { AuditItem, EvidenceLink } from '../types/audit';

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
}

async function callSecureAuditApi(payload: Record<string, unknown>) {
  const token = window.netlifyIdentity?.currentUser()?.token?.access_token;
  if (!token) throw new Error('Tu sesión ya no es válida. Ingresá nuevamente.');

  const response = await fetch('/.netlify/functions/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.error || 'No se pudo guardar la auditoría.');
  return result;
}

export async function uploadEvidenceToAppsScript(
  item: AuditItem,
  evidence: Pick<EvidenceLink, 'id' | 'type' | 'title' | 'description' | 'addedAt'>,
  file: File,
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
    item: { code: item.code, chapter: item.chapter },
    evidence,
    file: { name: file.name, mimeType: file.type || 'application/octet-stream', base64: fileData },
  });
  if (!result.evidence) throw new Error(result.error || 'No se pudo guardar el archivo.');
  return result.evidence as EvidenceLink;
}

export async function pushAllToAppsScript(items: AuditItem[]): Promise<SyncResult> {
  try {
    const data = await callSecureAuditApi({
      action: 'save_all',
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
