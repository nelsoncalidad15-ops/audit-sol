import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => (
  <header className="h-14 bg-[#1A1C1E] text-white flex items-center px-4 sm:px-6 border-b border-white/10 shrink-0 z-30 select-none">
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <h1 className="text-sm sm:text-base font-bold tracking-tight text-white">
        Auditoría de Calidad
      </h1>
    </div>
  </header>
);
