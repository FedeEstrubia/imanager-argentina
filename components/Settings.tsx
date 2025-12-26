
import React, { useState } from 'react';
import { Settings as SettingsType } from '../types';

interface SettingsProps {
  settings: SettingsType;
  onSave: (rate: number, warrantyDays: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [rate, setRate] = useState(settings.usd_rate);
  const [warrantyDays, setWarrantyDays] = useState(settings.default_warranty_days || 30);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Configuración</h2>
        <p className="text-slate-500 text-sm">Gestiona la cotización del dólar y parámetros del sistema.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Precios y Cotización</h3>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cotización USD → ARS</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">$</span>
              <input
                type="number"
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={rate}
                onChange={e => setRate(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Garantía por Defecto</h3>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Días de garantía estándar</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                className="w-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={warrantyDays}
                onChange={e => setWarrantyDays(Number(e.target.value))}
              />
              <span className="text-slate-500 font-medium">días</span>
            </div>
            <p className="mt-2 text-xs text-slate-400 italic">Se aplicará automáticamente a todas las nuevas ventas.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <button
            onClick={() => onSave(rate, warrantyDays)}
            className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-md"
          >
            Guardar Configuración General
          </button>
          
          <p className="text-xs text-slate-500 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Última actualización: {settings.updated_at ? new Date(settings.updated_at).toLocaleString('es-AR') : 'Nunca'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
