import { supabase } from '../src/integrations/supabase/client';
import { Product, Settings, Transaction, Customer } from '../types';

export const db = {
  // Productos
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

  deleteProduct: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar producto:', error.message);
    }
  },

  // 👇 Acá irán después funciones similares para: settings, customers, transactions
};
