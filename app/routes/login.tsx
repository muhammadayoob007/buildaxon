import { useState } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [{ title: 'BuildAxon — Sign in' }, { name: 'description', content: 'Sign in to BuildAxon' }];
};

const PRODUCTS = {
  Create: ['Design', 'Apps & Websites', 'Slides'],
  Platform: ['Agents', 'Databases', 'Integrations', 'Security'],
};

function TopNav() {
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-teal-500/10">
      <div className="flex items-center gap-8">
        <a href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center">
            <span className="i-ph:share-network-fill text-sm text-[#0a0f0e]" />
          </div>
          <span className="text-base font-medium text-white">
            Build<span className="text-teal-400">Axon</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          <div className="relative" onMouseEnter={() => setProductsOpen(true)} onMouseLeave={() => setProductsOpen(false)}>
            <button className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors bg-transparent border-none outline-none cursor-pointer focus:outline-none">
              Products
              <span className="i-ph:caret-down text-xs" />
            </button>
            {productsOpen && (
              <div className="absolute top-full left-0 pt-3 z-50">
                <div className="bg-[#0d1614] border border-teal-500/20 rounded-xl p-5 shadow-2xl flex gap-10 min-w-[340px]">
                  {Object.entries(PRODUCTS).map(([section, items]) => (
                    <div key={section} className="flex flex-col gap-2.5">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{section}</span>
                      {items.map((item) => (
                        <a key={item} href="/" className="text-sm text-gray-300 hover:text-teal-400 transition-colors">
                          {item}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
            Docs
          </a>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <a href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
          Log in
        </a>
        <a
          href="/login"
          className="text-sm px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#04211c] font-semibold transition-colors"
        >
          Create account
        </a>
      </div>
    </nav>
  );
}

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
    <div className="min-h-screen bg-[#0a0f0e] flex flex-col">
      <TopNav />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-teal-500/30 flex flex-col md:flex-row shadow-2xl">
          {/* Left brand panel */}
          <div className="flex-1 p-10 flex flex-col justify-center gap-4 bg-gradient-to-br from-[#0d3330] to-[#0a1f1c]">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">Build without limits</h2>
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

              {mode === 'signin' && (
                <div className="text-right">
                  <a href="/login" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#04211c] font-semibold text-sm transition-colors mt-1"
              >
                {mode === 'signup' ? 'Sign up' : 'Log in'}
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
    </div>
  );
}
