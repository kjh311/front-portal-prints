import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { Printer } from 'lucide-react';

const Auth: React.FC = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-md w-full px-6 text-center">
        <div className="mb-8 inline-flex p-4 rounded-3xl bg-white shadow-lg">
          <Printer size={48} className="text-indigo-600" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
          Portal <span className="text-gradient">Prints</span>
        </h1>
        <p className="text-lg text-slate-600 mb-12">
          Your cinematic YouTube moments, captured and curated in a premium Polaroid gallery.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all group"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Sign in with Google
        </button>
        
        <p className="mt-6 text-sm text-slate-400">
          Syncs with your Portal Prints Chrome Extension.
        </p>
      </div>
    </div>
  );
};

export default Auth;
