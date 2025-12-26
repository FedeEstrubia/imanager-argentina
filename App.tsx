"use client";

import React, { useState, useEffect } from 'react';
import { View, Product, Settings as SettingsType, Transaction, Customer } from './types';
import { db } from './services/db'; // This will be updated to use Supabase
import Layout from './components/Layout';
import Inventory from './components/Inventory';
import ProductForm from './components/ProductForm';
import TradeIn from './components/TradeIn';
import History from './components/History';
import Settings from './components/Settings';
import Customers from './components/Customers';
import Warranties from './components/Warranties';
import CustomerDetail from './components/CustomerDetail';
import Login from './src/pages/Login'; // Corrected import path
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider';
import { supabase } from './src/integrations/supabase/client';

const AuthenticatedApp: React.FC = () => {
  const { userId } = useSession();
  const [currentView, setView] = useState<View>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SettingsType>({ user_id: '', usd_rate: 1000, updated_at: '', default_warranty_days: 30 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching settings:', settingsError);
      } else if (settingsData) {
        setSettings(settingsData);
      } else {
        // If no settings, create default ones (this should be handled by the trigger, but as a fallback)
        const defaultSettings = { user_id: userId, usd_rate: 1000, default_warranty_days: 30, updated_at: new Date().toISOString() };
        const { data: newSettings, error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select()
          .single();
        if (insertError) console.error('Error inserting default settings:', insertError);
        else setSettings(newSettings);
      }

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);
      if (productsError) console.error('Error fetching products:', productsError);
      else setProducts(productsData || []);

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId);
      if (customersError) console.error('Error fetching customers:', customersError);
      else setCustomers(customersData || []);

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);
      if (transactionsError) console.error('Error fetching transactions:', transactionsError);
      else setTransactions(transactionsData || []);
    };

    fetchData();
  }, [userId]);

  const handleUpdateSettings = async (rate: number, warrantyDays: number) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('settings')
      .update({ usd_rate: rate, default_warranty_days: warrantyDays, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) console.error('Error updating settings:', error);
    else if (data) setSettings(data);
  };

  const handleSaveProduct = async (p: Partial<Product>) => {
    if (!userId) return;
    let newProducts;
    if (editingProduct) {
      const { data, error } = await supabase
        .from('products')
        .update(p)
        .eq('id', editingProduct.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) console.error('Error updating product:', error);
      else if (data) newProducts = products.map(item => item.id === data.id ? data : item);
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert({ ...p, user_id: userId } as Omit<Product, 'id' | 'created_at'>)
        .select()
        .single();
      if (error) console.error('Error inserting product:', error);
      else if (data) newProducts = [...products, data];
    }
    if (newProducts) setProducts(newProducts);
    setEditingProduct(null);
    setView('inventory');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!userId) return;
    if (confirm('¿Eliminar producto? Esta acción es irreversible.')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) console.error('Error deleting product:', error);
      else setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveCustomer = async (c: Partial<Customer>) => {
    if (!userId) return;
    let newCustomers;
    if (editingCustomer) {
      const { data, error } = await supabase
        .from('customers')
        .update(c)
        .eq('id', editingCustomer.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) console.error('Error updating customer:', error);
      else if (data) newCustomers = customers.map(item => item.id === data.id ? data : item);
    } else {
      const { data, error } = await supabase
        .from('customers')
        .insert({ ...c, user_id: userId } as Omit<Customer, 'id' | 'created_at'>)
        .select()
        .single();
      if (error) console.error('Error inserting customer:', error);
      else if (data) newCustomers = [...customers, data];
    }
    if (newCustomers) setCustomers(newCustomers);
    setEditingCustomer(null);
    setView('customers');
  };

  const handleQuickAddCustomer = async (c: Partial<Customer>): Promise<Customer> => {
    if (!userId) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...c, user_id: userId, notes: 'Agregado rápido en venta.' } as Omit<Customer, 'id' | 'created_at'>)
      .select()
      .single();
    if (error) {
      console.error('Error quick adding customer:', error);
      throw error;
    }
    if (data) {
      setCustomers(prev => [...prev, data]);
      return data;
    }
    throw new Error('Failed to quick add customer');
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!userId) return;
    if (confirm('¿Eliminar cliente? Esta acción eliminará también todas sus transacciones asociadas.')) {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) console.error('Error deleting customer:', error);
      else setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleConfirmTradeIn = async (txData: Omit<Transaction, 'id' | 'date' | 'user_id'>, addToInventory: boolean) => {
    if (!userId) return;

    // Insert transaction
    const { data: newTransaction, error: txError } = await supabase
      .from('transactions')
      .insert({ ...txData, user_id: userId } as Omit<Transaction, 'id' | 'created_at'>)
      .select()
      .single();

    if (txError) {
      console.error('Error inserting transaction:', txError);
      return;
    }

    // Update product stocks
    let updatedProducts = [...products];
    const productSold = updatedProducts.find(p => p.id === txData.product_sold_id);
    if (productSold) {
      const { data: updatedSoldProduct, error: soldUpdateError } = await supabase
        .from('products')
        .update({ stock: Math.max(0, productSold.stock - 1) })
        .eq('id', productSold.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (soldUpdateError) console.error('Error updating sold product stock:', soldUpdateError);
      else if (updatedSoldProduct) updatedProducts = updatedProducts.map(p => p.id === updatedSoldProduct.id ? updatedSoldProduct : p);
    }

    if (addToInventory && txData.product_tradein_id) {
      const productTradeIn = updatedProducts.find(p => p.id === txData.product_tradein_id);
      if (productTradeIn) {
        const { data: updatedTradeInProduct, error: tradeInUpdateError } = await supabase
          .from('products')
          .update({ stock: productTradeIn.stock + 1 })
          .eq('id', productTradeIn.id)
          .eq('user_id', userId)
          .select()
          .single();
        if (tradeInUpdateError) console.error('Error updating trade-in product stock:', tradeInUpdateError);
        else if (updatedTradeInProduct) updatedProducts = updatedProducts.map(p => p.id === updatedTradeInProduct.id ? updatedTradeInProduct : p);
      }
    }

    setProducts(updatedProducts);
    setTransactions(prev => [...prev, newTransaction]);
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
            onDelete={handleDeleteProduct}
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
                    // For simplicity, we'll navigate to a form for adding/editing customers
                    // For now, let's use a simple prompt as per original logic, but ideally a form.
                    const firstName = prompt("Nombre del cliente:");
                    if (firstName) {
                        const lastName = prompt("Apellido del cliente:");
                        const phone = prompt("Teléfono del cliente:");
                        if (phone) handleSaveCustomer({ first_name: firstName, last_name: lastName || '', phone: phone });
                    }
                }}
                onEdit={(c) => {
                    setEditingCustomer(c);
                    // For simplicity, using prompt for now, but ideally a form.
                    const firstName = prompt("Nuevo nombre:", c.first_name);
                    if (firstName) handleSaveCustomer({ ...c, first_name: firstName });
                }}
                onDelete={handleDeleteCustomer}
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

const App: React.FC = () => {
  return (
    <Router>
      <SessionContextProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AuthenticatedApp />} />
        </Routes>
      </SessionContextProvider>
    </Router>
  );
};

export default App;