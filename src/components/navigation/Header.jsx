import {
  Menu, Plus, Download, MessageSquare, Lock, Unlock, ShieldAlert
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const TAB_META = {
  overview:        { title: 'Overview',                  subtitle: 'Real-time card intelligence, exposure metrics, and active boundaries' },
  'my-cards':      { title: 'My Cards',                  subtitle: 'Consolidated inventory of linked bank cards and CardHub virtual cards' },
  'virtual-cards': { title: 'Virtual Cards',             subtitle: 'Purpose-specific digital cards with hardware-enforced spending limits' },
  transactions:    { title: 'Activity',                  subtitle: 'Normalized transaction events, cleared charges, and declined attempts' },
  alerts:          { title: 'Security & Risk Alerts',    subtitle: 'Prioritized threat triage, limit violations, and sync delay notices' },
  rules:           { title: 'Rules & Limits',            subtitle: 'Deterministic spending boundaries and interactive authorization simulator' },
  connections:     { title: 'Connections',               subtitle: 'Financial data providers, Open Banking status, and API permissions' },
  settings:        { title: 'Settings',                  subtitle: 'Account security, active sessions, preferences, and data exports' },
  customizer:      { title: 'Card Studio',               subtitle: 'Personalize card themes, textures, and visual presentation' },
  spending:        { title: 'Spending Insights',         subtitle: 'Understand where your money goes across categories and cards' },
  subscriptions:   { title: 'Subscriptions',            subtitle: 'Detect and control recurring billing across all cards' },
  security:        { title: 'Security Console',          subtitle: 'Active hardware sessions, credential verification, and panic freeze' },
  activity:        { title: 'Activity Log',              subtitle: 'Chronological audit trail of all sensitive operations' },
};

export default function Header({
  activeTab,
  currentUser,
  walletBalance,
  onOpenTopUp,
  onOpenChat,
  onToggleMobileMenu,
  onPanicFreezeAll,
  allCardsFrozen,
  onGoToAdmin,
}) {
  const { title, subtitle } = TAB_META[activeTab] || {
    title: 'CardHub',
    subtitle: 'Financial card-intelligence and exposure-control platform',
  };

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">

      {/* Title & mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Right action bar */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Wallet balance */}
        <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl shadow-sm flex items-center gap-3 hover:border-slate-700 transition-all">
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block leading-none mb-0.5 font-mono">
              Wallet Balance
            </span>
            <span className="text-sm font-black text-white font-mono">
              {formatCurrency(walletBalance)}
            </span>
          </div>
          <button
            onClick={onOpenTopUp}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fund</span>
          </button>
        </div>

        {/* Panic freeze toggle */}
        <button
          onClick={onPanicFreezeAll}
          title={allCardsFrozen ? 'Click to unfreeze all virtual cards' : 'Emergency freeze: lock all virtual cards instantly'}
          className={`px-3 py-2 text-xs font-semibold rounded-2xl transition-all flex items-center gap-1.5 shadow-sm border ${
            allCardsFrozen
              ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900/60'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-rose-800/60 hover:text-rose-400'
          }`}
        >
          {allCardsFrozen ? (
            <>
              <Unlock className="w-3.5 h-3.5" />
              <span>Unfreeze All</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Freeze All Virtual</span>
            </>
          )}
        </button>

        {/* Export statement */}
        <button
          onClick={() => window.print()}
          title="Print / Export Statement"
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium rounded-2xl transition-all flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Support chat */}
        <button
          onClick={onOpenChat}
          title="Open Assistant Support"
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium rounded-2xl transition-all flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Assistant</span>
        </button>

        {/* Admin shortcut */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={onGoToAdmin}
            title="Return to admin dashboard"
            className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
}
