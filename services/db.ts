import { Product, Settings, Transaction, Customer } from '../types';
import { supabase } from '../src/integrations/supabase/clients'; // ajustá el path si hace falta

const DEFAULT_SETTINGS: Settings = {
  usd_rate: 1250,
  updated_at: new Date().toISOString(),
  default_warranty_days: 30
};

export const db = {
  // PRODUCTS
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Product[];
  },

  saveProducts: async (products: Product[]) => {
    // upsert masivo
    const { error } = await supabase.from('products').upsert(products);
    if (error) throw error;
  },

  // SETTINGS
  getSettings: async (): Promise<Settings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const parsed = (data ?? DEFAULT_SETTINGS) as Settings;
    if ((parsed as any).default_warranty_days === undefined) (parsed as any).default_warranty_days = 30;
    return parsed;
  },

  saveSettings: async (settings: Settings) => {
    // guardamos 1 fila (si no hay, la crea)
    const payload = {
      ...settings,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('settings').upsert(payload);
    if (error) throw error;
  },

  // TRANSACTIONS
  getTransactions: async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Transaction[];
  },

  saveTransactions: async (transactions: Transaction[]) => {
    const { error } = await supabase.from('transactions').upsert(transactions);
    if (error) throw error;
  },

  // CUSTOMERS
  getCustomers: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Customer[];
  },

  saveCustomers: async (customers: Customer[]) => {
    const { error } = await supabase.from('customers').upsert(customers);
    if (error) throw error;
  },

  // MIGRACIÓN 1-CLICK: localStorage -> Supabase (corrés una vez desde tu PC)
  migrateFromLocalStorageOnce: async () => {
    const LS_KEYS = {
      PRODUCTS: 'imanager_products',
      SETTINGS: 'imanager_settings',
      TRANSACTIONS: 'imanager_transactions',
      CUSTOMERS: 'imanager_customers'
    };

    const products = JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) ?? '[]');
    const settings = JSON.parse(localStorage.getItem(LS_KEYS.SETTINGS) ?? 'null');
    const transactions = JSON.parse(localStorage.getItem(LS_KEYS.TRANSACTIONS) ?? '[]');
    const customers = JSON.parse(localStorage.getItem(LS_KEYS.CUSTOMERS) ?? '[]');

    if (products.length) {
      const { error } = await supabase.from('products').upsert(products);
      if (error) throw error;
    }
    if (customers.length) {
      const { error } = await supabase.from('customers').upsert(customers);
      if (error) throw error;
    }
    if (transactions.length) {
      const { error } = await supabase.from('transactions').upsert(transactions);
      if (error) throw error;
    }
    if (settings) {
      const { error } = await supabase.from('settings').upsert({
        ...settings,
        default_warranty_days: settings.default_warranty_days ?? 30,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    }

    localStorage.setItem('imanager_migrated_to_supabase', 'true');
  }
};
