
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setView: (view: View) => void;
  usdRate: number;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, usdRate }) => {
  const menuItems: { id: View; label: string; icon: string }[] = [
    { id: 'inventory', label: 'Inventario', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'tradein', label: 'Trade-in', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'customers', label: 'Clientes (CRM)', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'warranties', label: 'Garantías', icon: 'M9 12l2 2 4-4m5.618-4.016A3.333 3.333 0 0121 4.833v1.25c0 .46-.37.833-.833.833h-1.25a3.333 3.333 0 01-3.234-2.516l-.11-.44a3.333 3.333 0 00-6.446 0l-.11.44A3.333 3.333 0 015.833 6.917h-1.25A.833.833 0 013.75 6.083V4.833a3.333 3.333 0 013.333-3.333h10.834zM3.75 10.5v8.25c0 .46.37.833.833.833h14.834c.46 0 .833-.37.833-.833V10.5a3.333 3.333 0 01-3.333-3.333h-1.25c-.46 0-.833.37-.833.833v1.25a3.333 3.333 0 01-3.234 2.516l-.11.44a3.333 3.333 0 00-6.446 0l-.11-.44A3.333 3.333 0 015.833 7.167h-1.25A3.333 3.333 0 013.75 10.5z' },
    { id: 'history', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'settings', label: 'Configuración', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">iManager <span className="text-blue-400">AR</span></h1>
          <p className="text-xs text-slate-400 mt-1">Gestión de iPhone & Precios</p>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                currentView === item.id || (currentView === 'product_form' && item.id === 'inventory') || (currentView === 'customer_detail' && item.id === 'customers')
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 bg-slate-800 m-4 rounded-xl">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Cotización USD</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-mono text-emerald-400">$ {usdRate.toLocaleString('es-AR')}</span>
            <span className="text-[10px] text-slate-500">ARS</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-slate-900">iManager AR</h1>
          <div className="flex space-x-2">
             {menuItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setView(item.id)}
                  className={`p-2 rounded-md ${currentView === item.id ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </button>
             ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
