import React from 'react';

interface Integration {
  name: string;
  href: string;
  bg: string;
  text: string;
  logo: React.ReactNode;
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Supabase',
    href: 'https://supabase.com',
    bg: '#3ECF8E',
    text: '#0b2e20',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0b2e20" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com',
    bg: '#24292e',
    text: '#ffffff',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    name: 'Vercel',
    href: 'https://vercel.com',
    bg: '#000000',
    text: '#ffffff',
    logo: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1.608l12 20.784H0Z" />
      </svg>
    ),
  },
  {
    name: 'Netlify',
    href: 'https://netlify.com',
    bg: '#014847',
    text: '#32E6E2',
    logo: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#32E6E2" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.934 8.519a1.044 1.044 0 0 1 .303.23l2.349-1.045-2.192-2.171-.491 2.954zM12.06 6.546a1.305 1.305 0 0 1 .209.574l3.497 1.482a1.044 1.044 0 0 1 .355-.177l.574-3.55-2.13-2.234-2.86 3.164a1.174 1.174 0 0 1 .355.737zM23.657 11.24l-3.34-3.33-2.845 1.263 3.152 3.184zM14.657 9.673l-3.51-1.484a1.148 1.148 0 0 1-.647.427l-.71 4.401a1.226 1.226 0 0 1 .262.267l6.11-.324z" />
      </svg>
    ),
  },
];

const IntegrationButton: React.FC<{ integration: Integration }> = ({ integration }) => (
  <a
    href={integration.href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 hover:scale-105"
    style={{ background: integration.bg, color: integration.text }}
    title={`Open ${integration.name}`}
  >
    {integration.logo}
    {integration.name}
  </a>
);

const StarterTemplates: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <span className="text-sm text-gray-500">connect your data and deployment services</span>
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center items-center gap-3 max-w-md">
          {INTEGRATIONS.map((integration) => (
            <IntegrationButton key={integration.name} integration={integration} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StarterTemplates;
