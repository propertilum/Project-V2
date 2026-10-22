import { useState } from 'react';
import { 
  CreditCard, Shield, Plus, ArrowUpRight, ArrowDownLeft, 
  Lock, Unlock, Eye, EyeOff, Copy, ChevronRight, 
  Repeat, CheckCircle, Sparkles, AlertTriangle, ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import CardPreview from '../cards/CardPreview';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import StatusDot from '../ui/StatusDot';
import { formatCurrency } from '../../utils/formatters';

export default function OverviewTab({
  cards = [],
  activeCardId,
  setActiveCardId,
  walletBalance,
  transactions = [],
  subscriptions = [],
  alerts = [],
  onOpenNewCard,
  onOpenBurnerCard,
  onOpenTopUp,
  onUpdateCard,
  onSelectTransaction,
  onNavigateTab,
  onCopy,
}) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  const activeCard = cards.find((c) => c.id === activeCardId) || cards[0];
  const isBankCard = activeCard?.source === 'bank_connection';

  const totalMonthlyLimit = cards.reduce((acc, c) => acc + (c.monthlyLimit || 0), 0);
  const totalCurrentSpend = transactions
    .filter((t) => t.type === 'debit')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  const virtualCardsCount = cards.filter((c) => c.source !== 'bank_connection').length;
  const bankCardsCount = cards.filter((c) => c.source === 'bank_connection').length;

  const openAlerts = alerts.filter((a) => a.status === 'open');
  const highAlertsCount = openAlerts.filter((a) => a.severity === 'high').length;

  const upcomingSubs = subscriptions
    .filter((s) => s.status === 'active')
    .slice(0, 3);

  const recentTransactions = transactions.slice(0, 6);

  // ── Empty state: new user has no cards yet ─────────────────────────────────
  if (!activeCard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
          <CreditCard className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Cards Connected Yet</h2>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
          Connect your existing bank card to monitor activity, or issue a dedicated virtual card with hardware-enforced spending limits.
        </p>
        <div className="flex flex-wrap items-center gap-3 justify-center">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={onOpenNewCard}
          >
            Create Virtual Card
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={Sparkles}
            onClick={onOpenBurnerCard}
          >
            Create Burner Card
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Health & Attention Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        highAlertsCount > 0
          ? 'bg-rose-950/25 border-rose-800/40'
          : openAlerts.length > 0
            ? 'bg-amber-950/20 border-amber-800/40'
            : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              highAlertsCount > 0
                ? 'bg-rose-500/20 text-rose-400'
                : openAlerts.length > 0
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {highAlertsCount > 0 ? (
                <ShieldAlert className="w-4 h-4" />
              ) : openAlerts.length > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  {highAlertsCount > 0
                    ? `${highAlertsCount} High Priority Security Alert`
                    : openAlerts.length > 0
                      ? `${openAlerts.length} Unresolved Risk Alerts Require Review`
                      : 'Card Security Posture: Looks Normal'}
                </span>
                <Badge variant={highAlertsCount > 0 ? 'rose' : openAlerts.length > 0 ? 'amber' : 'emerald'} size="xs">
                  {highAlertsCount > 0 ? 'Action Required' : openAlerts.length > 0 ? 'Needs Review' : 'Active Defense'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {openAlerts.length > 0
                  ? 'Spending limit breaches or provider sync delays were flagged in recent data.'
                  : 'No anomalies or unexpected charges detected in recent verified authorizations.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {openAlerts.length > 0 && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => onNavigateTab('alerts')}
              >
                Review Alerts ({openAlerts.length}) →
              </Button>
            )}
            <Button
              variant="primary"
              size="xs"
              icon={Plus}
              onClick={onOpenNewCard}
            >
              New Virtual Card
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Vital Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Available Wallet */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Available Wallet Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono">
              {formatCurrency(walletBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Liquid balance for virtual funding</p>
          </div>
          <button
            onClick={onOpenTopUp}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fund Wallet</span>
          </button>
        </div>

        {/* Metric 2: Monthly Outflow */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Monthly Outflow
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono">
              {formatCurrency(totalCurrentSpend)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Across {cards.length} monitored &amp; virtual cards
            </p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, totalMonthlyLimit > 0 ? (totalCurrentSpend / totalMonthlyLimit) * 100 : 0)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Card Inventory */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Card Inventory
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono">
              {cards.length} <span className="text-sm font-normal text-slate-400">total</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {virtualCardsCount} Virtual · {bankCardsCount} Linked Bank
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('my-cards')}
            className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1 mt-1"
          >
            <span>Inspect All Cards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 4: Protection Status */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Enforcement Mode
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-white font-mono">
              Hardware
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1 font-mono">
              <CheckCircle className="w-3 h-3" /> Real-Time Declines
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('rules')}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 mt-1"
          >
            <span>View Spending Rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Interactive Card Console & Quick Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Card Preview & Controls */}
        <div className="lg:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">{activeCard.label}</h2>
                <Badge
                  variant={
                    activeCard.isLocked
                      ? 'rose'
                      : isBankCard
                        ? 'monitoring'
                        : 'enforced'
                  }
                  size="xs"
                >
                  <StatusDot status={activeCard.isLocked ? 'frozen' : 'active'} className="mr-1" />
                  {activeCard.isLocked ? 'Frozen' : isBankCard ? 'Monitored Bank' : 'Hardware Enforced'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {activeCard.institution || 'CardHub Virtual Issuer'} · Ending in {activeCard.last4 || (activeCard.cardNumber ? activeCard.cardNumber.slice(-4) : '4242')}
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('customizer')}
              className="text-xs text-indigo-400 font-semibold hover:underline"
            >
              Card Studio
            </button>
          </div>

          {/* CR80 Card Visual Canvas */}
          <div className="max-w-md mx-auto">
            <CardPreview
              card={activeCard}
              showNumber={showSensitive}
              showCVV={showCVV}
            />

            {/* Quick Action Controls */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-xs font-semibold">
              <button
                onClick={() => onCopy(activeCard.cardNumber, 'Card Number')}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy</span>
              </button>

              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSensitive ? 'Hide' : 'Reveal'}</span>
              </button>

              <button
                onClick={() => setShowCVV(!showCVV)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{showCVV ? 'CVV' : 'CVV'}</span>
              </button>

              {!isBankCard ? (
                <button
                  onClick={() => onUpdateCard(activeCard.id, { isLocked: !activeCard.isLocked })}
                  className={`py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    activeCard.isLocked
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-slate-800 hover:bg-rose-950/60 text-slate-200 border border-slate-700'
                  }`}
                >
                  {activeCard.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{activeCard.isLocked ? 'Unfreeze' : 'Freeze'}</span>
                </button>
              ) : (
                <button
                  disabled
                  title="Real bank cards cannot be frozen remotely by CardHub."
                  className="py-2.5 rounded-xl font-bold bg-slate-950 text-slate-600 border border-slate-800 cursor-not-allowed flex items-center justify-center gap-1 text-[10px]"
                >
                  <Lock className="w-3 h-3 text-slate-600" />
                  <span>Bank Freeze N/A</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Card Switcher Horizontal Scroll */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Card to Inspect ({cards.length})
              </span>
              <button
                onClick={onOpenNewCard}
                className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New</span>
              </button>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {cards.map((c) => {
                const isSelected = c.id === activeCard.id;
                const isBank = c.source === 'bank_connection';
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCardId(c.id)}
                    className={`shrink-0 p-3 rounded-xl border text-left transition w-44 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-indigo-400">
                        {isBank ? 'Bank Card' : c.brand}
                      </span>
                      {c.isLocked && <Lock className="w-3 h-3 text-rose-400" />}
                    </div>
                    <div className="font-bold text-white text-xs truncate">{c.label}</div>
                    <div className="font-mono text-[10px] text-slate-400 mt-1">
                      •••• {c.last4 || (c.cardNumber ? c.cardNumber.slice(-4) : '4242')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Quick Command Actions & Card Boundaries */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Spending Boundaries Widget */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                {isBankCard ? 'Monitoring Alert Threshold' : 'Hardware Spending Boundary'}
              </span>
              <span className="text-indigo-400 font-bold font-mono">
                ${activeCard.monthlyLimit} / month
              </span>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Monthly Allocation Gauge</span>
                <span className="font-bold text-white">${activeCard.monthlyLimit}</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={activeCard.monthlyLimit}
                onChange={(e) => onUpdateCard(activeCard.id, { monthlyLimit: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Quick Channel Safeguard Status */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Online</span>
                <span className={`font-bold text-xs ${activeCard.allowOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {activeCard.allowOnline ? 'ALLOWED' : 'LOCKED'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">International</span>
                <span className={`font-bold text-xs ${activeCard.allowInternational ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {activeCard.allowInternational ? 'ALLOWED' : 'LOCKED'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">ATM Cash</span>
                <span className={`font-bold text-xs ${activeCard.allowATM ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {activeCard.allowATM ? 'ALLOWED' : 'LOCKED'}
                </span>
              </div>
            </div>

            {/* Issue Burner Action Card */}
            <button
              onClick={onOpenBurnerCard}
              className="w-full py-3 bg-gradient-to-r from-rose-900/80 to-indigo-900/80 hover:from-rose-800 hover:to-indigo-800 text-white font-bold rounded-xl border border-indigo-700/50 shadow-md transition flex items-center justify-center gap-2 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Issue Single-Use Burner Card</span>
            </button>
          </div>

          {/* Upcoming Subscriptions Radar */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-indigo-400" />
                  <span>Recurring Subscriptions</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated detection within next 14 days</p>
              </div>

              <button
                onClick={() => onNavigateTab('subscriptions')}
                className="text-xs text-indigo-400 font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {upcomingSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{sub.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Charges in {sub.daysRemaining} days • {sub.cardName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-white text-sm">
                      ${sub.monthlyCost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Authorizations Table */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">Recent Authorizations</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live feed of merchant events across linked and virtual cards
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Open Full Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <th className="pb-3">Merchant</th>
                <th className="pb-3">Card Used</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <td className="py-3.5 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                        tx.type === 'credit'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-bold text-white">{tx.merchant}</span>
                  </td>
                  <td className="py-3.5 text-slate-400 font-medium">
                    {tx.cardName || 'Executive Card'}
                  </td>
                  <td className="py-3.5 text-slate-400">{tx.category}</td>
                  <td className="py-3.5 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                  <td className="py-3.5">
                    <Badge variant={tx.status === 'declined' ? 'rose' : 'emerald'} size="xs">
                      {tx.status}
                    </Badge>
                  </td>
                  <td
                    className={`py-3.5 text-right font-mono font-bold text-sm ${
                      tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {tx.type === 'credit'
                      ? `+${formatCurrency(tx.amount)}`
                      : `-${formatCurrency(tx.amount)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
