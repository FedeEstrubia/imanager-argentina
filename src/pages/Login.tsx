import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Bienvenido a iManager AR
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Inicia sesión para gestionar tu inventario.
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          providers={[]} // Only email/password for now
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
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Contraseña',
                email_input_placeholder: 'Tu email',
                password_input_placeholder: 'Tu contraseña',
                button_label: 'Iniciar Sesión',
                social_provider_text: 'Iniciar sesión con {{provider}}',
                link_text: '¿Ya tienes una cuenta? Inicia Sesión',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Contraseña',
                email_input_placeholder: 'Tu email',
                password_input_placeholder: 'Tu contraseña',
                button_label: 'Registrarse',
                social_provider_text: 'Registrarse con {{provider}}',
                link_text: '¿No tienes una cuenta? Regístrate',
              },
              forgotten_password: {
                email_label: 'Email',
                password_label: 'Contraseña',
                email_input_placeholder: 'Tu email',
                button_label: 'Enviar instrucciones de recuperación',
                link_text: '¿Olvidaste tu contraseña?',
              },
              update_password: {
                password_label: 'Nueva Contraseña',
                password_input_placeholder: 'Tu nueva contraseña',
                button_label: 'Actualizar Contraseña',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;