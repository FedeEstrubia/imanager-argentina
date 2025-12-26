"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">iManager <span className="text-blue-600">AR</span></h1>
          <p className="text-slate-500 mt-2">Inicia sesión para gestionar tu inventario</p>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]} // No social providers for now
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb', // Blue-600
                  brandAccent: '#1d4ed8', // Blue-700
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin} // Redirect to home after login
        />
      </div>
    </div>
  );
};

export default Login;