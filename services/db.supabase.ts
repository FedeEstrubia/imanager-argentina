import { supabase } from '../src/integrations/supabase/client';
import { Product, Settings, Transaction, Customer } from '../types';

export const db = {
  // ─────────────────────────────
  // 🛒 PRODUCTS
  // ─────────────────────────────
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener productos:', error.message);
      return [];
    }

    return data || [];
  },

  saveProducts: async (products: Product[]): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });

    if (error) {
      console.error('Error al guardar productos:', error.message);
    }
  },

  // ─────────────────────────────
  // 👥 CUSTOMERS
  // ─────────────────────────────
  getCustomers: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener clientes:', error.message);
      return [];
    }

    return data || [];
  },

  saveCustomers: async (customers: Customer[]): Promise<void> => {
    const { error } = await supabase
      .from('customers')
      .upsert(customers, { onConflict: 'id' });

    if (error) {
      console.error('Error al guardar clientes:', error.message);
    }
  },

  // ─────────────────────────────
  // ⚙️ SETTINGS
  // ─────────────────────────────
  getSettings: async (): Promise<Settings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error al obtener settings:', error.message);
    }

    if (!data || data.length === 0) {
      console.warn('No se encontraron settings, usando valores por defecto');
      return {
        usd_rate: 1000,
        updated_at: '',
        default_warranty_days: 30
      };
    }

    return data[0] as Settings;
  },

  saveSettings: async (settings: Settings): Promise<void> => {
    const { error } = await supabase
      .from('settings')
      .insert([settings]);

    if (error) {
      console.error('Error al guardar configuración:', error.message);
    }
  },

  // ─────────────────────────────
  // 🔄 TRANSACTIONS
  // ─────────────────────────────
  getTransactions: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error al obtener transacciones:', error.message);
      return [];
    }

    return data || [];
  },

  saveTransactions: async (txs: Transaction[]): Promise<void> => {
    const { error } = await supabase
      .from('transactions')
      .upsert(txs, { onConflict: 'id' });

    if (error) {
      console.error('Error al guardar transacciones:', error.message);
    }
  }
};
