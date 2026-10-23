import {
  Menu, Plus, Download, MessageSquare, Lock, Unlock, ShieldAlert, Bell
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
  openAlertsCount = 0,
  onOpenTopUp,
  onOpenChat,
  onToggleMobileMenu,
  onPanicFreezeAll,
  allCardsFrozen,
  onGoToAdmin,
  onNavigateTab,
}) {
  const { title, subtitle } = TAB_META[activeTab] || {
    title: 'CardHub',
    subtitle: 'Financial card-intelligence and exposure-control platform',
  };

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-6 border-b border-[#38383A]">

      {/* Title & mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-[8px] bg-[#1C1C1E] border border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] hover:bg-[#2C2C2E] transition active:scale-[0.98]"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F5F5F7] tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Right action bar */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Wallet balance */}
        <div className="bg-[#1C1C1E] border border-[#38383A] px-3 py-1.5 rounded-[8px] flex items-center gap-3">
          <div>
            <span className="text-[9px] text-[#8E8E93] uppercase font-semibold tracking-wider block leading-none mb-0.5 font-mono">
              Wallet Balance
            </span>
            <span className="text-sm font-semibold text-[#F5F5F7] font-mono">
              {formatCurrency(walletBalance)}
            </span>
          </div>
          <button
            onClick={onOpenTopUp}
            className="px-2 py-1 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white text-[11px] font-medium rounded-[6px] transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fund</span>
          </button>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => onNavigateTab?.('alerts')}
          title={openAlertsCount > 0 ? `${openAlertsCount} Unresolved Security Alerts` : 'Notifications & Alerts'}
          className="relative p-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] rounded-[8px] transition active:scale-[0.98]"
        >
          <Bell className="w-4 h-4" />
          {openAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF453A] text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {openAlertsCount}
            </span>
          )}
        </button>

        {/* Panic freeze toggle */}
        <button
          onClick={onPanicFreezeAll}
          title={allCardsFrozen ? 'Click to unfreeze all virtual cards' : 'Emergency freeze: lock all virtual cards instantly'}
          className={`px-3 py-2 text-xs font-medium rounded-[8px] transition active:scale-[0.98] flex items-center gap-1.5 border ${
            allCardsFrozen
              ? 'bg-[#FF453A]/15 border-[#FF453A]/30 text-[#FF453A] hover:bg-[#FF453A]/25'
              : 'bg-[#1C1C1E] border-[#38383A] text-[#8E8E93] hover:text-[#FF453A] hover:border-[#FF453A]/40'
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
          className="px-3 py-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] text-xs font-medium rounded-[8px] transition active:scale-[0.98] flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-[#0A84FF]" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Support chat */}
        <button
          onClick={onOpenChat}
          title="Open Assistant Support"
          className="px-3 py-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] text-xs font-medium rounded-[8px] transition active:scale-[0.98] flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#0A84FF]" />
          <span className="hidden sm:inline">Assistant</span>
        </button>

        {/* Admin shortcut */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={onGoToAdmin}
            title="Return to admin dashboard"
            className="px-3 py-2 bg-[#FF453A] hover:bg-[#D70015] active:scale-[0.98] text-white text-xs font-medium rounded-[8px] transition flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
}
