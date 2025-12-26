import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Product, Settings, Transaction, Customer } from '../types';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is installed or will be

interface SessionContextType {
  session: Session | null;
  user: User | null;
  products: Product[];
  settings: Settings | null;
  transactions: Transaction[];
  customers: Customer[];
  loading: boolean;
  fetchUserData: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};

interface SessionContextProviderProps {
  children: ReactNode;
}

export const SessionContextProvider: React.FC<SessionContextProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    setLoading(true);
    if (!user) {
      setProducts([]);
      setSettings(null);
      setTransactions([]);
      setCustomers([]);
      setLoading(false);
      return;
    }

    const userId = user.id;

    try {
      // Fetch Settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching settings:', settingsError);
        toast.error('Error al cargar la configuración.');
      } else if (settingsData) {
        setSettings(settingsData);
      } else {
        // If no settings, create default ones (handled by trigger on new user, but good fallback)
        const { data: newSettings, error: insertSettingsError } = await supabase
          .from('settings')
          .insert({ user_id: userId, usd_rate: 1000, default_warranty_days: 30 })
          .select()
          .single();
        if (insertSettingsError) {
          console.error('Error creating default settings:', insertSettingsError);
          toast.error('Error al crear configuración por defecto.');
        } else {
          setSettings(newSettings);
        }
      }

      // Fetch Products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);
      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast.error('Error al cargar productos.');
      } else {
        setProducts(productsData || []);
      }

      // Fetch Customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId);
      if (customersError) {
        console.error('Error fetching customers:', customersError);
        toast.error('Error al cargar clientes.');
      } else {
        setCustomers(customersData || []);
      }

      // Fetch Transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);
      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
        toast.error('Error al cargar transacciones.');
      } else {
        setTransactions(transactionsData || []);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error general al cargar datos del usuario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else if (!loading) {
      // Clear data if user logs out
      setProducts([]);
      setSettings(null);
      setTransactions([]);
      setCustomers([]);
    }
  }, [user, loading]); // Depend on user and loading to prevent double fetches

  return (
    <SessionContext.Provider value={{ session, user, products, settings, transactions, customers, loading, fetchUserData }}>
      {children}
    </SessionContext.Provider>
  );
};