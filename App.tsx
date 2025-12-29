
import React, { useState, useEffect } from 'react';
import { View, Product, Settings as SettingsType, Transaction, Customer } from './types';
import { db } from './services/db.supabase';
import Layout from './components/Layout';
import Inventory from './components/Inventory';
import ProductForm from './components/ProductForm';
import TradeIn from './components/TradeIn';
import History from './components/History';
import Settings from './components/Settings';
import Customers from './components/Customers';
import Warranties from './components/Warranties';
import CustomerDetail from './components/CustomerDetail';

const App: React.FC = () => {
  const [currentView, setView] = useState<View>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SettingsType>({ usd_rate: 1000, updated_at: '', default_warranty_days: 30 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setProducts(db.getProducts());
    setSettings(db.getSettings());
    setTransactions(db.getTransactions());
    setCustomers(db.getCustomers());
  }, []);

  const handleUpdateSettings = (rate: number, warrantyDays: number) => {
    const newSettings = { 
        usd_rate: rate, 
        default_warranty_days: warrantyDays,
        updated_at: new Date().toISOString() 
    };
    setSettings(newSettings);
    db.saveSettings(newSettings);
  };

  const handleSaveProduct = (p: Partial<Product>) => {
    let newProducts;
    if (editingProduct) {
      newProducts = products.map(item => item.id === editingProduct.id ? { ...item, ...p } as Product : item);
    } else {
      const newProduct = { ...p, id: Date.now().toString() } as Product;
      newProducts = [...products, newProduct];
    }
    setProducts(newProducts);
    db.saveProducts(newProducts);
    setEditingProduct(null);
    setView('inventory');
  };

  const handleSaveCustomer = (c: Partial<Customer>) => {
    let newCustomers;
    if (editingCustomer) {
      newCustomers = customers.map(item => item.id === editingCustomer.id ? { ...item, ...c } as Customer : item);
    } else {
      const newCust = { ...c, id: Date.now().toString(), created_at: new Date().toISOString() } as Customer;
      newCustomers = [...customers, newCust];
    }
    setCustomers(newCustomers);
    db.saveCustomers(newCustomers);
    setEditingCustomer(null);
    setView('customers');
  };

  const handleQuickAddCustomer = (c: Partial<Customer>): Customer => {
      const newCust = { ...c, id: Date.now().toString(), created_at: new Date().toISOString(), notes: 'Agregado rápido en venta.' } as Customer;
      const newList = [...customers, newCust];
      setCustomers(newList);
      db.saveCustomers(newList);
      return newCust;
  };

  const handleConfirmTradeIn = (txData: Omit<Transaction, 'id' | 'date'>, addToInventory: boolean) => {
    const newTransaction: Transaction = {
      ...txData,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };

    let newProducts = products.map(p => {
      if (p.id === txData.product_sold_id) {
        return { ...p, stock: Math.max(0, p.stock - 1) };
      }
      if (addToInventory && p.id === txData.product_tradein_id) {
        return { ...p, stock: p.stock + 1 };
      }
      return p;
    });

    setProducts(newProducts);
    db.saveProducts(newProducts);

    const newTransactions = [...transactions, newTransaction];
    setTransactions(newTransactions);
    db.saveTransactions(newTransactions);

    setView('history');
  };

  const renderView = () => {
    switch (currentView) {
      case 'inventory':
        return (
          <Inventory
            products={products}
            usdRate={settings.usd_rate}
            onAdd={() => {
              setEditingProduct(null);
              setView('product_form');
            }}
            onEdit={(p) => {
              setEditingProduct(p);
              setView('product_form');
            }}
            onDelete={(id) => {
                if (confirm('¿Eliminar producto?')) {
                    const newList = products.filter(p => p.id !== id);
                    setProducts(newList);
                    db.saveProducts(newList);
                }
            }}
          />
        );
      case 'product_form':
        return (
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setEditingProduct(null);
              setView('inventory');
            }}
          />
        );
      case 'tradein':
        return (
          <TradeIn
            products={products}
            customers={customers}
            usdRate={settings.usd_rate}
            defaultWarrantyDays={settings.default_warranty_days}
            onConfirm={handleConfirmTradeIn}
            onQuickAddCustomer={handleQuickAddCustomer}
          />
        );
      case 'history':
        return <History transactions={transactions} />;
      case 'settings':
        return <Settings settings={settings} onSave={handleUpdateSettings} />;
      case 'customers':
        return (
            <Customers 
                customers={customers} 
                onAdd={() => {
                    setEditingCustomer(null);
                    // For simplicity, reusing a standard alert-prompt for creation if needed or add a full form
                    // But here we'll simulate jumping to a detail/edit view
                    const name = prompt("Nombre del cliente:");
                    if(name) handleSaveCustomer({ first_name: name, phone: prompt("Teléfono:") || "" });
                }}
                onEdit={(c) => {
                    const name = prompt("Nuevo nombre:", c.first_name);
                    if(name) handleSaveCustomer({ ...c, first_name: name });
                }}
                onDelete={(id) => {
                    if(confirm("¿Eliminar cliente?")) {
                        const newList = customers.filter(c => c.id !== id);
                        setCustomers(newList);
                        db.saveCustomers(newList);
                    }
                }}
                onViewDetail={(c) => {
                    setSelectedCustomer(c);
                    setView('customer_detail');
                }}
            />
        );
      case 'customer_detail':
        return selectedCustomer ? (
            <CustomerDetail 
                customer={selectedCustomer} 
                transactions={transactions} 
                onBack={() => setView('customers')}
            />
        ) : null;
      case 'warranties':
        return <Warranties transactions={transactions} customers={customers} products={products} />;
      default:
        return <div>Seleccione una vista</div>;
    }
  };

  return (
    <Layout currentView={currentView} setView={setView} usdRate={settings.usd_rate}>
      {renderView()}
    </Layout>
  );
};

export default App;
