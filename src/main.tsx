import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthGate } from './components/AuthGate.tsx';
import { AuditSelector } from './components/AuditSelector.tsx';
import type { AuditRunContext } from './data/auditConfig.ts';
import './index.css';

const AuditWorkspace = () => {
  const [auditRun, setAuditRun] = useState<AuditRunContext | null>(null);
  const initialAuditKey = window.location.pathname === '/pcgc'
    ? 'pcgc'
    : window.location.pathname === '/iso-9001'
    ? 'iso9001'
    : null;

  const handleSelect = (run: AuditRunContext) => {
    window.history.replaceState(null, '', run.auditKey === 'pcgc' ? '/pcgc' : '/iso-9001');
    setAuditRun(run);
  };

  const handleChangeAudit = () => {
    window.history.replaceState(null, '', '/');
    setAuditRun(null);
  };

  return auditRun
    ? <App auditRun={auditRun} onChangeAudit={handleChangeAudit} />
    : <AuditSelector onSelect={handleSelect} initialAuditKey={initialAuditKey} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate><AuditWorkspace /></AuthGate>
  </StrictMode>,
);
