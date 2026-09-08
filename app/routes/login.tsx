import { useState } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [{ title: 'BuildAxon — Sign in' }, { name: 'description', content: 'Sign in to BuildAxon' }];
};

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Backend wiring (Supabase) comes later. Visual only for now.
    console.log('Auth submit (not wired yet):', { mode, email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0f0e] px-4">
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-teal-500/30 flex flex-col md:flex-row shadow-2xl">
        {/* Left brand panel */}
        <div className="flex-1 p-10 flex flex-col justify-center gap-4 bg-gradient-to-br from-[#0d3330] to-[#0a1f1c]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center">
              <span className="i-ph:share-network-fill text-sm text-[#0a0f0e]" />
            </div>
            <span className="text-lg font-medium text-white">
              Build<span className="text-teal-400">Axon</span>
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mt-2">Build without limits</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Turn your ideas into real web apps with AI. Sign up to start building.
          </p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 p-10 flex flex-col justify-center gap-3 bg-[#0a0f0e]">
          <h3 className="text-xl font-medium text-white mb-2">
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-teal-500/20 bg-[#0d1614] text-white text-sm outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-teal-500/20 bg-[#0d1614] text-white text-sm outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#04211c] font-semibold text-sm transition-colors"
            >
              {mode === 'signup' ? 'Sign up' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center gap-2.5 my-1">
            <div className="flex-1 h-px bg-teal-500/15" />
            <span className="text-[11px] text-gray-600">OR</span>
            <div className="flex-1 h-px bg-teal-500/15" />
          </div>

          <button
            type="button"
            className="w-full py-2.5 rounded-lg bg-transparent border border-teal-500/20 hover:border-teal-500/40 text-gray-200 font-medium text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="i-ph:google-logo-bold text-base" />
            Continue with Google
          </button>

          <span className="text-xs text-gray-400 text-center mt-4">
            {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              className="text-teal-400 font-medium hover:underline"
            >
              {mode === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
