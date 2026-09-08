import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [{ title: 'BuildAxon — Pricing' }, { name: 'description', content: 'BuildAxon pricing plans' }];
};

const FREE_FEATURES = [
  'Use your own API key',
  'Standard AI providers',
  'Build and preview apps',
  'Community support',
];

const PRO_FEATURES = [
  'Use your own API key',
  'All providers + premium models',
  'Higher usage limits',
  'Custom domain support',
  'Priority support',
];

function Check() {
  return <span className="i-ph:check-bold text-teal-400 mr-2 shrink-0" />;
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0a0f0e] text-white">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-teal-500/10">
        <a href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center">
            <span className="i-ph:share-network-fill text-sm text-[#0a0f0e]" />
          </div>
          <span className="text-base font-medium">
            Build<span className="text-teal-400">Axon</span>
          </span>
        </a>
        <div className="flex items-center gap-6">
          <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
            Docs
          </a>
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

      {/* Header */}
      <div className="text-center mt-16 mb-10 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Pricing</h1>
        <p className="text-gray-400 text-sm md:text-base">Choose the best plan for you</p>
      </div>

      {/* Plans */}
      <div className="flex flex-wrap gap-5 justify-center max-w-3xl mx-auto px-4 pb-20">
        {/* Free */}
        <div className="flex-1 min-w-[260px] bg-[#0d1614] border border-teal-500/15 rounded-2xl p-7 flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-medium mb-1">Free</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold">$0</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 mt-1">
            {FREE_FEATURES.map((f) => (
              <span key={f} className="flex items-center text-sm text-gray-300">
                <Check />
                {f}
              </span>
            ))}
          </div>
          <a
            href="/login"
            className="mt-auto w-full py-2.5 rounded-lg bg-transparent border border-teal-500/25 hover:border-teal-500/50 text-gray-200 font-medium text-sm text-center transition-colors"
          >
            Get started
          </a>
        </div>

        {/* Pro */}
        <div className="flex-1 min-w-[260px] bg-[#0d1614] border-2 border-teal-500 rounded-2xl p-7 flex flex-col gap-4 relative">
          <span className="absolute -top-3 left-6 bg-teal-500 text-[#04211c] text-[11px] font-semibold px-3 py-1 rounded-full">
            Most popular
          </span>
          <div>
            <h3 className="text-xl font-medium mb-1">Pro</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold">$9</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 mt-1">
            {PRO_FEATURES.map((f) => (
              <span key={f} className="flex items-center text-sm text-gray-300">
                <Check />
                {f}
              </span>
            ))}
          </div>
          <a
            href="/login"
            className="mt-auto w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#04211c] font-semibold text-sm text-center transition-colors"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    </div>
  );
}
