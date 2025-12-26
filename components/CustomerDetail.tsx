
import React from 'react';
import { Customer, Transaction, View } from '../types';
import { formatUSD, formatARS } from '../utils';

interface CustomerDetailProps {
  customer: Customer;
  transactions: Transaction[];
  onBack: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer, transactions, onBack }) => {
  const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
  const activeWarranties = customerTransactions.filter(t => t.warranty_enabled && new Date(t.warranty_end!) > new Date());

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white border rounded-full text-slate-400 hover:text-slate-600 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div>
            <h2 className="text-2xl font-bold text-slate-900">{customer.first_name} {customer.last_name}</h2>
            <p className="text-slate-500 text-sm">Información detallada del cliente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact info card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-2">Información de Contacto</h3>
            <div className="space-y-3">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono</span>
                    <span className="text-slate-900 font-medium">{customer.phone}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                    <span className="text-slate-900 font-medium">{customer.email || '-'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DNI</span>
                    <span className="text-slate-900 font-medium">{customer.dni || '-'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ciudad</span>
                    <span className="text-slate-900 font-medium">{customer.city || '-'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas</span>
                    <span className="text-slate-600 text-sm italic">{customer.notes || 'Sin notas.'}</span>
                </div>
            </div>
        </div>

        {/* stats card */}
        <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-md">
                    <span className="text-blue-100 text-xs font-bold uppercase">Compras Totales</span>
                    <div className="text-3xl font-bold">{customerTransactions.length}</div>
                </div>
                <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-md">
                    <span className="text-emerald-100 text-xs font-bold uppercase">Garantías Vigentes</span>
                    <div className="text-3xl font-bold">{activeWarranties.length}</div>
                </div>
            </div>

            {/* History mini-table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                    <h4 className="font-bold text-slate-800 text-sm">Historial de Compras</h4>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b text-[10px] uppercase text-slate-500 font-bold">
                            <th className="px-4 py-2">Fecha</th>
                            <th className="px-4 py-2">Equipo</th>
                            <th className="px-4 py-2 text-right">Monto USD</th>
                            <th className="px-4 py-2 text-center">Garantía</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {customerTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3">{new Date(t.date).toLocaleDateString('es-AR')}</td>
                                <td className="px-4 py-3 font-medium">{t.product_sold_name}</td>
                                <td className="px-4 py-3 text-right font-mono font-bold">{formatUSD(t.final_usd)}</td>
                                <td className="px-4 py-3 text-center">
                                    {t.warranty_enabled ? (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            new Date(t.warranty_end!) > new Date() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {new Date(t.warranty_end!) > new Date() ? 'Vigente' : 'Vencida'}
                                        </span>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                        {customerTransactions.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Sin operaciones previas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
