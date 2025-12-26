
export type Condition = 'Nuevo' | 'Como Nuevo' | 'Muy Bueno' | 'Bueno' | 'Regular';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  dni?: string;
  city?: string;
  notes: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  model: string;
  storage: string;
  color: string;
  condition: Condition;
  battery: number;
  stock: number;
  price_sell_usd: number;
  price_tradein_usd: number;
  notes: string;
}

export interface Settings {
  usd_rate: number;
  updated_at: string;
  default_warranty_days: number;
}

export interface Transaction {
  id: string;
  date: string;
  product_sold_id: string;
  product_sold_name: string;
  product_tradein_id: string | null;
  product_tradein_name: string | null;
  sell_usd: number;
  tradein_usd: number;
  adjustment_usd: number;
  final_usd: number;
  usd_rate_snapshot: number;
  notes: string;
  customer_balance_action: 'zero' | 'credit' | 'none';
  // CRM & Warranty Extensions
  customer_id?: string;
  warranty_enabled?: boolean;
  warranty_days?: number;
  warranty_start?: string;
  warranty_end?: string;
}

export type View = 'inventory' | 'tradein' | 'history' | 'settings' | 'product_form' | 'customers' | 'customer_detail' | 'warranties';
