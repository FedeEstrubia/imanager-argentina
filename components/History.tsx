
import React from 'react';
import { Transaction } from '../types';
import { formatUSD, formatARS, exportToCSV } from '../utils';

interface HistoryProps {
  transactions: Transaction[];
}

const History: React.FC<HistoryProps> = ({ transactions }) => {
  const handleExport = () => {
    const exportData = transactions.map(t => ({
      Fecha: new Date(t.date).toLocaleString('es-AR'),
      Vendido: t.product_sold_name,
      Entregado: t.product_tradein_name || '-',
      Precio_Venta_USD: t.sell_usd,
      Toma_Entregado_USD: t.tradein_usd,
      Ajuste_USD: t.adjustment_usd,
      Total_USD: t.final_usd,
      Cotizacion_Snapshot: t.usd_rate_snapshot,
      Total_ARS: t.final_usd * t.usd_rate_snapshot,
      Notas: t.notes
    }));
    exportToCSV(`historial_transacciones_${new Date().toISOString().split('T')[0]}.csv`, exportData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historial de Operaciones</h2>
          <p className="text-slate-500 text-sm">Registro completo de ventas y trade-ins.</p>
        </div>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar Historial
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operación</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Total USD</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Total ARS</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-900">
                        {new Date(t.date).toLocaleDateString('es-AR')}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {new Date(t.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-900 font-medium">Vendió:</span>
                        <span className="text-blue-600 font-bold">{t.product_sold_name}</span>
                      </div>
                      {t.product_tradein_name && (
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                          <span className="italic font-medium">Recibió:</span>
                          <span className="text-slate-600">{t.product_tradein_name}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-mono font-bold ${t.final_usd >= 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                      {t.final_usd < 0 ? 'Fav. Cli: ' : ''}{formatUSD(Math.abs(t.final_usd))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-500 font-mono">
                        {formatARS(Math.abs(t.final_usd * t.usd_rate_snapshot))}
                      </span>
                      <span className="text-[9px] text-slate-400">@ ${t.usd_rate_snapshot.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <span className="text-xs text-slate-500 truncate block" title={t.notes}>
                      {t.notes || '-'}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No hay transacciones registradas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
