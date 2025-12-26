import { Product, Settings, Transaction, Customer } from '../types';
import { supabase } from '../src/integrations/supabase/client';

// Note: The local storage functions are now deprecated and will be removed.
// All data operations will go through Supabase.
// The default data is now handled by Supabase seeds and new user settings trigger.

export const db = {
  // These functions are now placeholders or will be removed as data is fetched directly in App.tsx
  // For now, they return empty arrays or default settings to avoid breaking existing components
  getProducts: (): Product[] => {
    console.warn("db.getProducts() is deprecated. Fetch products directly from Supabase.");
    return [];
  },
  saveProducts: (products: Product[]) => {
    console.warn("db.saveProducts() is deprecated. Save products directly to Supabase.");
  },
  getSettings: (): Settings => {
    console.warn("db.getSettings() is deprecated. Fetch settings directly from Supabase.");
    return { user_id: '', usd_rate: 1000, updated_at: '', default_warranty_days: 30 };
  },
  saveSettings: (settings: Settings) => {
    console.warn("db.saveSettings() is deprecated. Save settings directly to Supabase.");
  },
  getTransactions: (): Transaction[] => {
    console.warn("db.getTransactions() is deprecated. Fetch transactions directly from Supabase.");
    return [];
  },
  saveTransactions: (transactions: Transaction[]) => {
    console.warn("db.saveTransactions() is deprecated. Save transactions directly to Supabase.");
  },
  getCustomers: (): Customer[] => {
    console.warn("db.getCustomers() is deprecated. Fetch customers directly from Supabase.");
    return [];
  },
  saveCustomers: (customers: Customer[]) => {
    console.warn("db.saveCustomers() is deprecated. Save customers directly to Supabase.");
  }
};