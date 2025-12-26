
import { Product, Settings, Transaction, Customer } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'imanager_products',
  SETTINGS: 'imanager_settings',
  TRANSACTIONS: 'imanager_transactions',
  CUSTOMERS: 'imanager_customers'
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'IPH15P-128-NAT',
    model: 'iPhone 15 Pro',
    storage: '128GB',
    color: 'Natural Titanium',
    condition: 'Nuevo',
    battery: 100,
    stock: 5,
    price_sell_usd: 1100,
    price_tradein_usd: 850,
    notes: 'Sellado en caja'
  },
  {
    id: '2',
    sku: 'IPH14-256-BLU',
    model: 'iPhone 14',
    storage: '256GB',
    color: 'Blue',
    condition: 'Como Nuevo',
    battery: 92,
    stock: 2,
    price_sell_usd: 750,
    price_tradein_usd: 550,
    notes: 'Impecable, sin detalles'
  }
];

const DEFAULT_SETTINGS: Settings = {
  usd_rate: 1250,
  updated_at: new Date().toISOString(),
  default_warranty_days: 30
};

export const db = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  getSettings: (): Settings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = data ? JSON.parse(data) : DEFAULT_SETTINGS;
    // Ensure default_warranty_days exists for legacy installs
    if (parsed.default_warranty_days === undefined) parsed.default_warranty_days = 30;
    return parsed;
  },
  saveSettings: (settings: Settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },
  getCustomers: (): Customer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : [];
  },
  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }
};
