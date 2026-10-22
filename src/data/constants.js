export const CARD_THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Obsidian Navy',
    bg: 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950',
    text: 'text-white',
    border: 'border-slate-800',
    accent: 'bg-indigo-600',
  },
  gold: {
    id: 'gold',
    name: 'Imperial Gold',
    bg: 'bg-gradient-to-tr from-amber-950 via-amber-900 to-slate-950',
    text: 'text-amber-100',
    border: 'border-amber-800/40',
    accent: 'bg-amber-600',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyber',
    bg: 'bg-gradient-to-tr from-fuchsia-950 via-purple-900 to-slate-950',
    text: 'text-fuchsia-100',
    border: 'border-fuchsia-800/40',
    accent: 'bg-fuchsia-600',
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon Fiber',
    bg: 'bg-gradient-to-tr from-neutral-900 via-zinc-900 to-black',
    text: 'text-zinc-100',
    border: 'border-zinc-800',
    accent: 'bg-zinc-700',
  },
  rose: {
    id: 'rose',
    name: 'Rose Gold Luxury',
    bg: 'bg-gradient-to-tr from-rose-950 via-rose-900 to-slate-900',
    text: 'text-rose-100',
    border: 'border-rose-800/40',
    accent: 'bg-rose-600',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Royale',
    bg: 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-950',
    text: 'text-emerald-100',
    border: 'border-emerald-800/40',
    accent: 'bg-emerald-600',
  },
};

export const CARD_TEXTURES = {
  none: 'bg-none',
  dots: 'bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] opacity-20',
  waves: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent',
  lines: 'bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_14px]',
};

export const CARD_TYPES = {
  main: {
    id: 'main',
    name: 'Main Card',
    badge: 'Primary Account',
    description: 'Everyday high-limit business and personal spending.',
    color: 'indigo',
    defaultLimit: 5000,
  },
  subscription: {
    id: 'subscription',
    name: 'Subscription Card',
    badge: 'Recurring Billing',
    description: 'Locked to recurring SaaS, streaming, and software tools.',
    color: 'emerald',
    defaultLimit: 400,
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping Card',
    badge: 'E-Commerce Safe',
    description: 'Protected for one-off online purchases with online-only locks.',
    color: 'amber',
    defaultLimit: 1000,
  },
  travel: {
    id: 'travel',
    name: 'Travel Card',
    badge: 'Zero FX Global',
    description: 'Optimized for international travel and multi-currency transactions.',
    color: 'cyan',
    defaultLimit: 3000,
  },
  burner: {
    id: 'burner',
    name: 'Disposable Burner',
    badge: 'Auto-Expiring',
    description: 'Temporary card for single-use trials or high-risk checkouts.',
    color: 'rose',
    defaultLimit: 150,
  },
};

export const CATEGORIES = [
  'All',
  'SaaS & Infrastructure',
  'AI Software',
  'Developer Tools',
  'Marketing',
  'Entertainment & Media',
  'E-Commerce & Retail',
  'Travel & Lodging',
  'Deposit',
];
