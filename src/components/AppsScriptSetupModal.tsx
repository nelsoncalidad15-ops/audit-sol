import React, { useState } from 'react';
import { AppsScriptConfig, AuditItem } from '../types/audit';
import { APPS_SCRIPT_CODE_TEMPLATE, syncWithAppsScript, pushAllToAppsScript } from '../services/googleSyncService';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Cloud, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Globe
} from 'lucide-react';

interface AppsScriptSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppsScriptConfig;
  onSaveConfig: (newConfig: AppsScriptConfig) => void;
  auditItems: AuditItem[];
  onItemsSynced: (newItems: AuditItem[]) => void;
}

export const AppsScriptSetupModal: React.FC<AppsScriptSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  auditItems,
  onItemsSynced,
}) => {
  if (!isOpen) return null;

  const [scriptUrl, setScriptUrl] = useState(config.scriptUrl || '');
  const [sheetId, setSheetId] = useState(config.sheetId || '12w_E2kt3Rqs9MTreR-Y4zNmZeUFy3yT3B95BKWNcZvc');
  const [gid, setGid] = useState(config.gid || '295935298');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'appscript' | 'netlify' | 'sheet'>('appscript');
  
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveAndTest = async () => {
    const newConfig: AppsScriptConfig = {
      ...config,
      scriptUrl: scriptUrl.trim(),
      sheetId: sheetId.trim(),
      gid: gid.trim(),
      autoSync: true,
    };
    onSaveConfig(newConfig);

    if (!scriptUrl.trim()) {
      setStatusMessage({
        text: 'Configuración guardada localmente.',
        type: 'info',
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ text: 'Probando conexión con Google Apps Script...', type: 'info' });

    try {
      const res = await syncWithAppsScript(newConfig, auditItems);
      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
        if (res.items) {
          onItemsSynced(res.items);
        }
      } else {
        setStatusMessage({ text: res.message, type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Error al conectar', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePushAllToCloud = async () => {
    if (!scriptUrl.trim()) {
      setStatusMessage({ text: 'Ingresa primero la URL de tu Google Apps Script Web App.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ text: 'Guardando todas las evidencias en el Google Sheet...', type: 'info' });

    try {
      const res = await pushAllToAppsScript({ ...config, scriptUrl }, auditItems);
      if (res.success) {
        setStatusMessage({ text: res.message, type: 'success' });
      } else {
        setStatusMessage({ text: res.message, type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Error al enviar datos', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Integración con Google Apps Script & Netlify
              </h2>
              <p className="text-xs text-slate-300">
                Conecta tu Google Sheet para guardar y sincronizar todas las evidencias en la nube
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('appscript')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'appscript'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>1. Google Apps Script API</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('netlify')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'netlify'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>2. Despliegue en Netlify</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sheet'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>3. Google Sheet Vinculado</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border border-rose-200'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'appscript' && (
            <div className="space-y-4 text-xs">
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
                <h3 className="font-bold text-indigo-950 text-sm mb-1">
                  ¿Cómo funciona la conexión segura con Apps Script?
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Google Apps Script actúa como un backend seguro que lee y guarda todas las evidencias directamente en una pestaña automática llamada <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono font-bold text-indigo-900">EVIDENCIAS_PORTAL</code> dentro de tu Google Sheet.
                </p>
              </div>

              {/* Step by step guide */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Pasos de configuración (2 minutos):
                </h4>

                <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                  <li>
                    Abre tu Google Sheet:{' '}
                    <a
                      href={sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Abrir Sheet en nueva pestaña</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    En el menú superior de Google Sheet, haz clic en{' '}
                    <strong className="text-slate-900">Extensiones › Apps Script</strong>.
                  </li>
                  <li>
                    Copia el siguiente código y pégalo en el editor de Apps Script:
                    <div className="mt-2 relative">
                      <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto border border-slate-800">
                        <pre>{APPS_SCRIPT_CODE_TEMPLATE}</pre>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyScript}
                        className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? '¡Copiado!' : 'Copiar Código .gs'}</span>
                      </button>
                    </div>
                  </li>
                  <li>
                    Haz clic en el botón azul <strong className="text-slate-900">Implementar › Nueva implementación</strong>.
                  </li>
                  <li>
                    Selecciona tipo <strong className="text-slate-900">Aplicación web</strong>, con acceso para <strong className="text-slate-900">Cualquier usuario</strong> y haz clic en <strong className="text-slate-900">Implementar</strong>.
                  </li>
                  <li>
                    Copia la <strong className="text-slate-900">URL de la aplicación web</strong> que te entrega Google y pégala aquí abajo:
                  </li>
                </ol>
              </div>

              {/* URL Input */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    URL de la Aplicación Web de Google Apps Script:
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    value={scriptUrl}
                    onChange={(e) => setScriptUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveAndTest}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>Guardar y Probar Conexión</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePushAllToCloud}
                    disabled={isProcessing || !scriptUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Subir Todas las Evidencias a Google Sheet</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'netlify' && (
            <div className="space-y-4 text-xs">
              <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4">
                <h3 className="font-bold text-teal-950 text-sm mb-1">
                  Despliegue fácil y gratuito en Netlify
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  Esta aplicación está completamente optimizada para compilar en un SPA estático súper rápido en Netlify o Cloudflare Pages.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Instrucciones para Netlify:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-700 leading-relaxed">
                  <li>
                    Descarga el proyecto o conéctalo con tu repositorio en GitHub / GitLab.
                  </li>
                  <li>
                    En tu panel de <strong className="text-slate-900">Netlify</strong>, crea un nuevo sitio desde Git.
                  </li>
                  <li>
                    Configura los parámetros de build:
                    <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] mt-1 space-y-1">
                      <div><span className="text-indigo-400">Build command:</span> npm run build</div>
                      <div><span className="text-indigo-400">Publish directory:</span> dist</div>
                    </div>
                  </li>
                  <li>
                    Haz clic en <strong className="text-slate-900">Deploy site</strong>. ¡Tu portal estará online con HTTPS y dominio personalizado!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'sheet' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    ID del Google Sheet:
                  </label>
                  <input
                    type="text"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    GID de la pestaña de Auditoría:
                  </label>
                  <input
                    type="text"
                    value={gid}
                    onChange={(e) => setGid(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div className="pt-2">
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Ver Google Sheet en vivo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
