
import React, { useState, useMemo } from 'react';
import { Product, Transaction, Customer } from '../types';
import { formatUSD, formatARS, calculateARS } from '../utils';

interface TradeInProps {
  products: Product[];
  customers: Customer[];
  usdRate: number;
  defaultWarrantyDays: number;
  onConfirm: (transaction: Omit<Transaction, 'id' | 'date'>, addToInventory: boolean) => void;
  onQuickAddCustomer: (c: Partial<Customer>) => Customer;
}

const TradeIn: React.FC<TradeInProps> = ({ products, customers, usdRate, defaultWarrantyDays, onConfirm, onQuickAddCustomer }) => {
  const [soldProductId, setSoldProductId] = useState('');
  const [tradeInProductId, setTradeInProductId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [adjustment, setAdjustment] = useState(0);
  const [notes, setNotes] = useState('');
  const [addToInventory, setAddToInventory] = useState(true);
  const [balanceAction, setBalanceAction] = useState<'zero' | 'credit'>('zero');
  
  // Warranty states
  const [warrantyEnabled, setWarrantyEnabled] = useState(true);
  const [warrantyDays, setWarrantyDays] = useState(defaultWarrantyDays);
  
  // Quick Customer State
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [quickCust, setQuickCust] = useState({ first_name: '', last_name: '', phone: '' });

  const soldProduct = products.find(p => p.id === soldProductId);
  const tradeInProduct = products.find(p => p.id === tradeInProductId);
  const availableProducts = products.filter(p => p.stock > 0);

  const calculation = useMemo(() => {
    const sellPrice = soldProduct?.price_sell_usd || 0;
    const tradePrice = tradeInProduct?.price_tradein_usd || 0;
    const diff = sellPrice - tradePrice + adjustment;
    return {
      sellPrice,
      tradePrice,
      adjustment,
      diff,
      isNegative: diff < 0
    };
  }, [soldProduct, tradeInProduct, adjustment]);

  const warrantyEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + warrantyDays);
    return d;
  }, [warrantyDays]);

  const handleConfirm = () => {
    if (!soldProduct || !customerId) {
        alert("Por favor selecciona un cliente y un equipo de venta.");
        return;
    }
    
    onConfirm({
      product_sold_id: soldProduct.id,
      product_sold_name: `${soldProduct.model} ${soldProduct.storage}`,
      product_tradein_id: tradeInProduct?.id || null,
      product_tradein_name: tradeInProduct ? `${tradeInProduct.model} ${tradeInProduct.storage}` : null,
      sell_usd: calculation.sellPrice,
      tradein_usd: calculation.tradePrice,
      adjustment_usd: calculation.adjustment,
      final_usd: calculation.diff,
      usd_rate_snapshot: usdRate,
      notes,
      customer_balance_action: calculation.isNegative ? balanceAction : 'none',
      customer_id: customerId,
      warranty_enabled: warrantyEnabled,
      warranty_days: warrantyEnabled ? warrantyDays : undefined,
      warranty_start: warrantyEnabled ? new Date().toISOString() : undefined,
      warranty_end: warrantyEnabled ? warrantyEnd.toISOString() : undefined
    }, addToInventory);
  };

  const handleCreateQuickCustomer = () => {
    if (!quickCust.first_name || !quickCust.phone) return;
    const newCust = onQuickAddCustomer(quickCust);
    setCustomerId(newCust.id);
    setIsQuickCustomerOpen(false);
    setQuickCust({ first_name: '', last_name: '', phone: '' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Nueva Operación</h2>
          <p className="text-slate-500 text-sm">Ventas, Canjes y Garantías.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Selection */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">0. Cliente</label>
                {!isQuickCustomerOpen && (
                    <button 
                        onClick={() => setIsQuickCustomerOpen(true)}
                        className="text-blue-600 text-xs font-bold hover:underline"
                    >
                        + Nuevo Cliente Rápido
                    </button>
                )}
            </div>

            {isQuickCustomerOpen ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input 
                        className="px-3 py-2 border rounded text-sm" 
                        placeholder="Nombre" 
                        value={quickCust.first_name} 
                        onChange={e => setQuickCust({...quickCust, first_name: e.target.value})}
                    />
                    <input 
                        className="px-3 py-2 border rounded text-sm" 
                        placeholder="Apellido" 
                        value={quickCust.last_name} 
                        onChange={e => setQuickCust({...quickCust, last_name: e.target.value})}
                    />
                    <input 
                        className="px-3 py-2 border rounded text-sm" 
                        placeholder="Teléfono" 
                        value={quickCust.phone} 
                        onChange={e => setQuickCust({...quickCust, phone: e.target.value})}
                    />
                    <div className="md:col-span-3 flex justify-end gap-2">
                        <button onClick={() => setIsQuickCustomerOpen(false)} className="text-slate-500 text-xs">Cancelar</button>
                        <button onClick={handleCreateQuickCustomer} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Crear y Seleccionar</button>
                    </div>
                </div>
            ) : (
                <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                >
                    <option value="">Seleccionar cliente...</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.first_name} {c.last_name} ({c.phone}) {c.dni ? `- DNI: ${c.dni}` : ''}
                        </option>
                    ))}
                </select>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. iPhone que se lleva (Venta)</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium"
                value={soldProductId}
                onChange={e => setSoldProductId(e.target.value)}
              >
                <option value="">Seleccionar equipo de inventario...</option>
                {availableProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.model} {p.storage} ({p.color}) - {formatUSD(p.price_sell_usd)} [Stock: {p.stock}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. iPhone que entrega (Toma)</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                value={tradeInProductId}
                onChange={e => setTradeInProductId(e.target.value)}
              >
                <option value="">Seleccionar equipo (o ninguno)...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.model} {p.storage} ({p.color}) - Toma: {formatUSD(p.price_tradein_usd)}
                  </option>
                ))}
              </select>
              {tradeInProduct && (
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="add-stock"
                    checked={addToInventory}
                    onChange={e => setAddToInventory(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="add-stock" className="ml-2 text-sm text-slate-600">
                    Ingresar el entregado al inventario (suma 1 al stock)
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Ajuste manual (USD)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all font-mono font-bold ${
                      adjustment > 0 ? 'bg-red-50 border-red-200 text-red-700' : 
                      adjustment < 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                      'bg-slate-50 border-slate-200'
                    }`}
                    placeholder="Ej: -20 por batería"
                    value={adjustment}
                    onChange={e => setAdjustment(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Notas de la operación</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                  placeholder="Detalles de pago o canje..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Warranty Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A3.333 3.333 0 0121 4.833v1.25c0 .46-.37.833-.833.833h-1.25a3.333 3.333 0 01-3.234-2.516l-.11-.44a3.333 3.333 0 00-6.446 0l-.11.44A3.333 3.333 0 015.833 6.917h-1.25A.833.833 0 013.75 6.083V4.833a3.333 3.333 0 013.333-3.333h10.834zM3.75 10.5v8.25c0 .46.37.833.833.833h14.834c.46 0 .833-.37.833-.833V10.5a3.333 3.333 0 01-3.333-3.333h-1.25c-.46 0-.833.37-.833.833v1.25a3.333 3.333 0 01-3.234 2.516l-.11.44a3.333 3.333 0 00-6.446 0l-.11-.44A3.333 3.333 0 015.833 7.167h-1.25A3.333 3.333 0 013.75 10.5z" />
                    </svg>
                    Garantía del Equipo Vendido
                </h3>
                <label className="inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={warrantyEnabled} 
                        onChange={e => setWarrantyEnabled(e.target.checked)} 
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
            
            {warrantyEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duración (Días)</label>
                        <input 
                            type="number" 
                            className="w-full px-3 py-2 border rounded font-mono font-bold"
                            value={warrantyDays}
                            onChange={e => setWarrantyDays(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vencimiento Calculado</label>
                        <div className="text-sm font-bold text-slate-900 px-3 py-2 bg-white border rounded">
                            {warrantyEnd.toLocaleDateString('es-AR')}
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-8 h-full">
            <h3 className="text-lg font-bold border-b border-slate-800 pb-4">Resumen Final</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <span>Venta:</span>
                <span className="font-mono text-white">{formatUSD(calculation.sellPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <span>Toma:</span>
                <span className="font-mono text-white">- {formatUSD(calculation.tradePrice)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-sm">
                <span>Ajuste:</span>
                <span className={`font-mono ${calculation.adjustment >= 0 ? 'text-white' : 'text-emerald-400'}`}>
                  {calculation.adjustment >= 0 ? '+' : ''}{formatUSD(calculation.adjustment)}
                </span>
              </div>
              
              <div className="pt-6 border-t border-slate-800">
                <div className="flex justify-between items-end">
                  <span className="text-slate-400 text-xs uppercase font-bold tracking-widest">Diferencia Total</span>
                  <span className="text-3xl font-bold font-mono">
                    {formatUSD(Math.abs(calculation.diff))}
                  </span>
                </div>
                <div className="flex justify-end text-sm text-slate-500 font-mono mt-1">
                  {formatARS(Math.abs(calculateARS(calculation.diff, usdRate)))}
                </div>
              </div>

              {calculation.isNegative && (
                <div className="mt-6 p-4 bg-emerald-900/40 border border-emerald-500/30 rounded-xl space-y-3">
                  <p className="text-emerald-400 text-xs font-bold uppercase">Saldo a favor del cliente</p>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center text-xs text-slate-300">
                      <input 
                        type="radio" 
                        name="balanceAction" 
                        className="mr-2" 
                        checked={balanceAction === 'zero'} 
                        onChange={() => setBalanceAction('zero')}
                      />
                      Dejar en $0 (No se devuelve)
                    </label>
                    <label className="flex items-center text-xs text-slate-300">
                      <input 
                        type="radio" 
                        name="balanceAction" 
                        className="mr-2" 
                        checked={balanceAction === 'credit'} 
                        onChange={() => setBalanceAction('credit')}
                      />
                      Mantener crédito para el cliente
                    </label>
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={!soldProductId || !customerId}
              onClick={handleConfirm}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg text-lg flex items-center justify-center ${
                (!soldProductId || !customerId)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Confirmar Operación
            </button>
            {(!soldProductId || !customerId) && (
              <p className="text-center text-xs text-slate-500">Completa cliente y equipo de venta para confirmar</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeIn;
