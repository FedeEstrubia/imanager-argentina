
import React, { useState } from 'react';
import { Transaction, Customer, Product } from '../types';

interface WarrantiesProps {
  transactions: Transaction[];
  customers: Customer[];
  products: Product[];
}

const Warranties: React.FC<WarrantiesProps> = ({ transactions, customers, products }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const today = new Date();

  const warrantyList = transactions
    .filter(t => t.warranty_enabled)
    .map(t => {
      const customer = customers.find(c => c.id === t.customer_id);
      const isExpired = t.warranty_end ? new Date(t.warranty_end) < today : true;
      return { ...t, customer, isExpired };
    });

  const filtered = warrantyList.filter(w => {
    if (filter === 'active') return !w.isExpired;
    if (filter === 'expired') return w.isExpired;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Control de Garantías</h2>
          <p className="text-slate-500 text-sm">Seguimiento de plazos de soporte por equipo vendido.</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >Todas</button>
            <button 
                onClick={() => setFilter('active')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >Vigentes</button>
            <button 
                onClick={() => setFilter('expired')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'expired' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >Vencidas</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Equipo Vendido</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fecha Venta</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vencimiento</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{w.customer?.first_name} {w.customer?.last_name}</span>
                        <span className="text-xs text-slate-400">{w.customer?.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-blue-600">{w.product_sold_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{new Date(w.date).toLocaleDateString('es-AR')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-mono font-bold ${w.isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                        {w.warranty_end ? new Date(w.warranty_end).toLocaleDateString('es-AR') : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        w.isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                        {w.isExpired ? 'Vencida' : 'Vigente'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron registros de garantía.
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

export default Warranties;
