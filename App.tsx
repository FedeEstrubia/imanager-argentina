import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { View, Product, Settings as SettingsType, Transaction, Customer } from './types';
import { SessionContextProvider, useSession } from './src/components/SessionContextProvider'; // Corrected import path
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
import { supabase } from './src/integrations/supabase/client'; // Corrected import path
import { toast } from 'react-hot-toast';

// Main application component, now wrapped in SessionContextProvider
const AppContent: React.FC = () => {
  const { session, user, products, settings, transactions, customers, loading, fetchUserData } = useSession();
  const [currentView, setView] = useState<View>('inventory');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Redirect to login if not authenticated
  if (!session && !loading) {
    return <Navigate to="/login" replace />;
  }

  // Show loading state while data is being fetched
  if (loading || !user || !settings) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-slate-600">Cargando datos...</p>
      </div>
    );
  }

  const userId = user.id;

  const handleUpdateSettings = async (rate: number, warrantyDays: number) => {
    const newSettingsData = { 
        usd_rate: rate, 
        default_warranty_days: warrantyDays,
        updated_at: new Date().toISOString(),
        user_id: userId,
    };
    const { data, error } = await supabase
      .from('settings')
      .update(newSettingsData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      toast.error('Error al guardar la configuración.');
    } else {
      toast.success('Configuración guardada exitosamente.');
      fetchUserData(); // Re-fetch all user data to update state
    }
  };

  const handleSaveProduct = async (p: Partial<Product>) => {
    if (!userId) return;

    let error;
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ ...p, user_id: userId })
        .eq('id', editingProduct.id)
        .eq('user_id', userId); // Ensure user can only update their own products
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert({ ...p, user_id: userId, created_at: new Date().toISOString() });
      error = insertError;
    }

    if (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto.');
    } else {
      toast.success('Producto guardado exitosamente.');
      setEditingProduct(null);
      setView('inventory');
      fetchUserData(); // Re-fetch all user data to update state
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!userId) return;
    if (confirm('¿Eliminar producto? Esta acción es irreversible.')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user can only delete their own products

      if (error) {
        console.error('Error deleting product:', error);
        toast.error('Error al eliminar el producto.');
      } else {
        toast.success('Producto eliminado exitosamente.');
        fetchUserData(); // Re-fetch all user data to update state
      }
    }
  };

  const handleSaveCustomer = async (c: Partial<Customer>) => {
    if (!userId) return;

    let error;
    if (editingCustomer) {
      const { error: updateError } = await supabase
        .from('customers')
        .update({ ...c, user_id: userId })
        .eq('id', editingCustomer.id)
        .eq('user_id', userId); // Ensure user can only update their own customers
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('customers')
        .insert({ ...c, user_id: userId, created_at: new Date().toISOString() });
      error = insertError;
    }

    if (error) {
      console.error('Error saving customer:', error);
      toast.error('Error al guardar el cliente.');
    } else {
      toast.success('Cliente guardado exitosamente.');
      setEditingCustomer(null);
      setView('customers');
      fetchUserData(); // Re-fetch all user data to update state
    }
  };

  const handleQuickAddCustomer = async (c: Partial<Customer>): Promise<Customer | null> => {
    if (!userId) return null;
    const newCustData = { ...c, user_id: userId, created_at: new Date().toISOString(), notes: 'Agregado rápido en venta.' };
    const { data, error } = await supabase
      .from('customers')
      .insert(newCustData)
      .select()
      .single();

    if (error) {
      console.error('Error quick adding customer:', error);
      toast.error('Error al agregar cliente rápido.');
      return null;
    } else {
      toast.success('Cliente agregado rápidamente.');
      fetchUserData(); // Re-fetch all user data to update state
      return data as Customer;
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!userId) return;
    if (confirm("¿Eliminar cliente? Esta acción es irreversible y eliminará sus transacciones asociadas.")) {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', userId); // Ensure user can only delete their own customers

      if (error) {
        console.error('Error deleting customer:', error);
        toast.error('Error al eliminar el cliente.');
      } else {
        toast.success('Cliente eliminado exitosamente.');
        fetchUserData(); // Re-fetch all user data to update state
      }
    }
  };

  const handleConfirmTradeIn = async (txData: Omit<Transaction, 'id' | 'date' | 'user_id'>, addToInventory: boolean) => {
    if (!userId) return;

    const newTransaction: Omit<Transaction, 'id'> = {
      ...txData,
      user_id: userId,
      date: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const { data: transactionResult, error: transactionError } = await supabase
      .from('transactions')
      .insert(newTransaction)
      .select()
      .single();

    if (transactionError) {
      console.error('Error saving transaction:', transactionError);
      toast.error('Error al guardar la transacción.');
      return;
    }

    // Update product stock
    const updates = [];
    if (txData.product_sold_id) {
      const soldProduct = products.find(p => p.id === txData.product_sold_id);
      if (soldProduct) {
        updates.push(
          supabase
            .from('products')
            .update({ stock: Math.max(0, soldProduct.stock - 1) })
            .eq('id', soldProduct.id)
            .eq('user_id', userId)
        );
      }
    }
    if (addToInventory && txData.product_tradein_id) {
      const tradeInProduct = products.find(p => p.id === txData.product_tradein_id);
      if (tradeInProduct) {
        updates.push(
          supabase
            .from('products')
            .update({ stock: tradeInProduct.stock + 1 })
            .eq('id', tradeInProduct.id)
            .eq('user_id', userId)
        );
      }
    }

    const updateResults = await Promise.all(updates);
    const updateErrors = updateResults.filter(res => res.error).map(res => res.error);

    if (updateErrors.length > 0) {
      console.error('Errors updating product stock:', updateErrors);
      toast.error('Transacción guardada, pero hubo errores al actualizar el stock.');
    } else {
      toast.success('Operación confirmada exitosamente.');
    }

    fetchUserData(); // Re-fetch all user data to update state
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
                    // For simplicity, reusing a standard alert-prompt for creation if needed or add a full form
                    const firstName = prompt("Nombre del cliente:");
                    if(firstName) {
                      const lastName = prompt("Apellido del cliente:") || '';
                      const phone = prompt("Teléfono del cliente:") || '';
                      handleSaveCustomer({ first_name: firstName, last_name: lastName, phone: phone });
                    }
                }}
                onEdit={(c) => {
                    setEditingCustomer(c);
                    // For simplicity, reusing a standard alert-prompt for creation if needed or add a full form
                    const firstName = prompt("Nuevo nombre:", c.first_name);
                    if(firstName) {
                      const lastName = prompt("Nuevo apellido:", c.last_name) || '';
                      const phone = prompt("Nuevo teléfono:", c.phone) || '';
                      handleSaveCustomer({ ...c, first_name: firstName, last_name: lastName, phone: phone });
                    }
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
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionContextProvider>
    </Router>
  );
};

export default App;