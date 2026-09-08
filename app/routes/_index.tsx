import { json, type MetaFunction } from '@remix-run/cloudflare';
import { useState, useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const meta: MetaFunction = () => {
  return [{ title: 'BuildAxon' }, { name: 'description', content: 'BuildAxon — build web apps in seconds with AI' }];
};

export const loader = () => json({});

/**
 * Landing gate for BuildAxon.
 * Shows a welcome/landing view first; once the visitor clicks Enter,
 * the builder is revealed. This is a visual gate only for now —
 * real Supabase auth will replace the "entered" check later.
 */
function LandingGate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0f0e] px-4">
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-teal-500/30 flex flex-col md:flex-row shadow-2xl">
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

        <div className="flex-1 p-10 flex flex-col justify-center gap-3 bg-[#0a0f0e]">
          <h3 className="text-xl font-medium text-white mb-2">Get started</h3>
          <p className="text-sm text-gray-400 mb-2">Create an account or continue to explore the builder.</p>

          <button
            type="button"
            onClick={onEnter}
            className="w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#04211c] font-semibold text-sm transition-colors"
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={onEnter}
            className="w-full py-2.5 rounded-lg bg-transparent border border-teal-500/20 hover:border-teal-500/40 text-gray-200 font-medium text-sm transition-colors"
          >
            Log in
          </button>

          <div className="flex items-center gap-2.5 my-1">
            <div className="flex-1 h-px bg-teal-500/15" />
            <span className="text-[11px] text-gray-600">OR</span>
            <div className="flex-1 h-px bg-teal-500/15" />
          </div>

          <button
            type="button"
            onClick={onEnter}
            className="w-full py-2.5 rounded-lg bg-transparent text-teal-400 hover:text-teal-300 font-medium text-sm transition-colors"
          >
            Continue as guest →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [entered, setEntered] = useState(true);

  useEffect(() => {
    // Show the gate only if the visitor hasn't entered before in this browser.
    try {
      const hasEntered = localStorage.getItem('buildaxon_entered');
      setEntered(hasEntered === 'true');
    } catch {
      setEntered(true);
    }
  }, []);

  const handleEnter = () => {
    try {
      localStorage.setItem('buildaxon_entered', 'true');
    } catch {
      // ignore storage errors
    }
    setEntered(true);
  };

  if (!entered) {
    return <LandingGate onEnter={handleEnter} />;
  }

  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
