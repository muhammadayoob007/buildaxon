import React from 'react';

const EXAMPLE_PROMPTS = [
  {
    label: 'Mobile App',
    color: 'border-orange-500 text-orange-500 hover:bg-orange-500/10',
    text: 'Build a modern, mobile-first web app with a clean UI using React and Tailwind. Make it fully responsive with a bottom navigation bar, a home screen, and smooth interactions. Design it at mobile phone width (max-width 430px), app-like, not a wide desktop layout.',
  },
  {
    label: 'Website',
    color: 'border-teal-500 text-teal-500 hover:bg-teal-500/10',
    text: 'Build a modern, responsive marketing website with a hero section, features, testimonials, pricing, and a contact form using React and Tailwind.',
  },
  {
    label: 'Dashboard',
    color: 'border-green-500 text-green-500 hover:bg-green-500/10',
    text: 'Build a modern admin dashboard with a sidebar, stat cards, charts, and a data table using React and Tailwind.',
  },
  {
    label: 'Animation',
    color: 'border-pink-500 text-pink-500 hover:bg-pink-500/10',
    text: 'Build a visually stunning landing page with smooth scroll animations, hover effects, and animated transitions using React, Tailwind, and CSS animations.',
  },
  {
    label: 'Todo App',
    color: 'border-sky-500 text-sky-500 hover:bg-sky-500/10',
    text: 'Build a todo app in React using Tailwind with categories, priorities, and a clean modern design.',
  },
  {
    label: 'Game',
    color: 'border-cyan-500 text-cyan-500 hover:bg-cyan-500/10',
    text: 'Make a space invaders game in HTML, CSS and JavaScript.',
  },
];

export function ExamplePrompts(sendMessage?: { (event: React.UIEvent, messageInput?: string): void | undefined }) {
  return (
    <div id="examples" className="relative flex flex-col gap-9 w-full max-w-3xl mx-auto flex justify-center mt-6">
      <div
        className="flex flex-wrap justify-center gap-2"
        style={{
          animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
        }}
      >
        {EXAMPLE_PROMPTS.map((examplePrompt, index: number) => {
          return (
            <button
              key={index}
              onClick={(event) => {
                sendMessage?.(event, examplePrompt.text);
              }}
              className={`border rounded-full bg-transparent px-3 py-1 text-xs transition-theme ${examplePrompt.color}`}
            >
              {examplePrompt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}