import { useState } from 'react';
import { 
  CreditCard, Shield, Plus, ArrowUpRight, ArrowDownLeft, 
  Lock, Unlock, Eye, EyeOff, Copy, ChevronRight, 
  Repeat, CheckCircle, Sparkles, AlertTriangle, ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import CardPreview from '../cards/CardPreview';
import { getFullCardNumber } from '../../utils/cardGenerator';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import StatusDot from '../ui/StatusDot';
import { SkeletonMetric, SkeletonCard } from '../ui/Skeleton';
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
  isLoading = false,
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
          <SkeletonMetric />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <SkeletonCard />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <SkeletonMetric />
            <SkeletonMetric />
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state: new user has no cards yet ─────────────────────────────────
  if (!activeCard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-[#1C1C1E] border border-[#38383A] rounded-[12px]">
        <div className="w-14 h-14 rounded-[10px] bg-[#0A84FF]/10 border border-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center mb-4">
          <CreditCard className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-[#F5F5F7] mb-1.5">No Cards Connected Yet</h2>
        <p className="text-xs text-[#8E8E93] max-w-sm leading-relaxed mb-6">
          Connect your existing bank card to monitor activity, or issue a dedicated virtual card with hardware-enforced spending limits.
        </p>
        <div className="flex flex-wrap items-center gap-2.5 justify-center">
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
      <div className={`p-4 rounded-[12px] border transition-all ${
        highAlertsCount > 0
          ? 'bg-[#FF453A]/10 border-[#FF453A]/30 text-[#FF453A]'
          : openAlerts.length > 0
            ? 'bg-[#FF9F0A]/10 border-[#FF9F0A]/30 text-[#FF9F0A]'
            : 'bg-[#1C1C1E] border-[#38383A]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${
              highAlertsCount > 0
                ? 'bg-[#FF453A]/20 text-[#FF453A]'
                : openAlerts.length > 0
                  ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]'
                  : 'bg-[#34C759]/10 text-[#34C759]'
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
                <span className="font-semibold text-[#F5F5F7]">
                  {highAlertsCount > 0
                    ? `${highAlertsCount} High Priority Security Alert`
                    : openAlerts.length > 0
                      ? `${openAlerts.length} Unresolved Risk Alerts Require Review`
                      : 'Card Security Posture: Looks Normal'}
                </span>
                <Badge variant={highAlertsCount > 0 ? 'red' : openAlerts.length > 0 ? 'orange' : 'green'} size="xs">
                  {highAlertsCount > 0 ? 'Action Required' : openAlerts.length > 0 ? 'Needs Review' : 'Active Defense'}
                </Badge>
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">
                {openAlerts.length > 0
                  ? 'Spending limit breaches or provider sync delays were flagged in recent data.'
                  : 'No anomalies or unexpected charges detected in recent verified authorizations.'}
              </p>
            </div>
          </div>

          {openAlerts.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => onNavigateTab('alerts')}
              >
                Review Alerts ({openAlerts.length}) →
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Vital Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Available Wallet */}
        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider font-mono">
              Wallet Balance
            </span>
            <div className="w-7 h-7 rounded-[6px] bg-[#0A84FF]/10 text-[#0A84FF] flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-semibold text-[#F5F5F7] font-mono tracking-tight">
              {formatCurrency(walletBalance)}
            </div>
            <p className="text-[11px] text-[#8E8E93] mt-0.5">Liquid balance for virtual funding</p>
          </div>
          <button
            onClick={onOpenTopUp}
            className="text-[#0A84FF] hover:underline text-xs font-medium flex items-center gap-1 mt-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Fund Wallet</span>
          </button>
        </div>

        {/* Metric 2: Monthly Outflow */}
        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider font-mono">
              Monthly Outflow
            </span>
            <div className="w-7 h-7 rounded-[6px] bg-[#FF9F0A]/10 text-[#FF9F0A] flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-semibold text-[#F5F5F7] font-mono tracking-tight">
              {formatCurrency(totalCurrentSpend)}
            </div>
            <p className="text-[11px] text-[#8E8E93] mt-0.5">
              Across {cards.length} monitored &amp; virtual cards
            </p>
          </div>
          <div className="w-full bg-[#2C2C2E] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#FF9F0A] h-1.5 rounded-full"
              style={{ width: `${Math.min(100, totalMonthlyLimit > 0 ? (totalCurrentSpend / totalMonthlyLimit) * 100 : 0)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Card Inventory */}
        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider font-mono">
              Card Inventory
            </span>
            <div className="w-7 h-7 rounded-[6px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-semibold text-[#F5F5F7] font-mono tracking-tight">
              {cards.length} <span className="text-sm font-normal text-[#8E8E93]">total</span>
            </div>
            <p className="text-[11px] text-[#8E8E93] mt-0.5">
              {virtualCardsCount} Virtual · {bankCardsCount} Linked Bank
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('my-cards')}
            className="text-[#34C759] hover:underline text-xs font-medium flex items-center gap-1 mt-0.5"
          >
            <span>Inspect All Cards</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Metric 4: Protection Status */}
        <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider font-mono">
              Enforcement Mode
            </span>
            <div className="w-7 h-7 rounded-[6px] bg-[#BF5AF2]/10 text-[#BF5AF2] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-semibold text-[#F5F5F7] font-mono tracking-tight">
              Hardware
            </div>
            <p className="text-[11px] text-[#34C759] font-medium mt-0.5 flex items-center gap-1 font-mono">
              <CheckCircle className="w-3 h-3" /> Real-Time Declines
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('rules')}
            className="text-[#0A84FF] hover:underline text-xs font-medium flex items-center gap-1 mt-0.5"
          >
            <span>View Spending Rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Interactive Card Console & Quick Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Card Preview & Controls */}
        <div className="lg:col-span-7 bg-[#1C1C1E] p-5 sm:p-6 rounded-[12px] border border-[#38383A] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#F5F5F7] tracking-tight">{activeCard.label}</h2>
                <Badge
                  variant={
                    activeCard.isLocked
                      ? 'red'
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
              <p className="text-xs text-[#8E8E93] mt-0.5 font-mono">
                {activeCard.institution || 'CardHub Virtual Issuer'} · Ending in {activeCard.last4 || (activeCard.cardNumber ? activeCard.cardNumber.slice(-4) : '4242')}
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('customizer')}
              className="text-xs text-[#0A84FF] font-medium hover:underline"
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
            <div className="grid grid-cols-4 gap-2 mt-4 text-xs font-medium">
              <button
                onClick={() => onCopy(getFullCardNumber(activeCard), 'Card Number')}
                className="py-2 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] rounded-[8px] border border-[#38383A] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>Copy</span>
              </button>

              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className="py-2 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] rounded-[8px] border border-[#38383A] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSensitive ? 'Hide' : 'Reveal'}</span>
              </button>

              <button
                onClick={() => setShowCVV(!showCVV)}
                className="py-2 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] rounded-[8px] border border-[#38383A] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#0A84FF]" />
                <span>{showCVV ? 'CVV' : 'CVV'}</span>
              </button>

              {!isBankCard ? (
                <button
                  onClick={() => onUpdateCard(activeCard.id, { isLocked: !activeCard.isLocked })}
                  className={`py-2 rounded-[8px] font-medium transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                    activeCard.isLocked
                      ? 'bg-[#34C759] text-white hover:bg-[#28B04C]'
                      : 'bg-[#2C2C2E] hover:bg-[#FF453A]/20 text-[#FF453A] border border-[#38383A]'
                  }`}
                >
                  {activeCard.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{activeCard.isLocked ? 'Unfreeze' : 'Freeze'}</span>
                </button>
              ) : (
                <button
                  disabled
                  title="Real bank cards cannot be frozen remotely by CardHub."
                  className="py-2 rounded-[8px] font-medium bg-[#1C1C1E] text-[#636366] border border-[#38383A] cursor-not-allowed flex items-center justify-center gap-1 text-[11px]"
                >
                  <Lock className="w-3 h-3 text-[#636366]" />
                  <span>Freeze N/A</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Card Switcher Horizontal Scroll */}
          <div className="pt-4 border-t border-[#38383A]">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider font-mono">
                Select Card ({cards.length})
              </span>
              <button
                onClick={onOpenNewCard}
                className="text-xs text-[#0A84FF] font-medium hover:underline flex items-center gap-1"
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
                    className={`shrink-0 p-3 rounded-[8px] border text-left transition duration-100 active:scale-[0.98] w-44 ${
                      isSelected
                        ? 'border-[#0A84FF] bg-[#0A84FF]/10 ring-1 ring-[#0A84FF]'
                        : 'border-[#38383A] hover:border-[#38383A]/80 bg-[#2C2C2E]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono font-medium text-[#0A84FF]">
                        {isBank ? 'Bank' : c.brand}
                      </span>
                      {c.isLocked && <Lock className="w-3 h-3 text-[#FF453A]" />}
                    </div>
                    <div className="font-medium text-[#F5F5F7] text-xs truncate">{c.label}</div>
                    <div className="font-mono text-[10px] text-[#8E8E93] mt-1">
                      •••• {c.last4 || (c.cardNumber ? c.cardNumber.slice(-4) : '4242')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Quick Command Actions & Card Boundaries */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card Spending Boundaries Widget */}
          <div className="bg-[#1C1C1E] p-5 sm:p-6 rounded-[12px] border border-[#38383A] shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#38383A]">
              <span className="font-medium text-[#8E8E93] uppercase tracking-wider text-[11px] font-mono">
                {isBankCard ? 'Monitoring Alert Threshold' : 'Hardware Spending Boundary'}
              </span>
              <span className="text-[#0A84FF] font-medium font-mono">
                ${activeCard.monthlyLimit} / mo
              </span>
            </div>

            <div>
              <div className="flex justify-between text-[#8E8E93] mb-1">
                <span>Monthly Allocation Gauge</span>
                <span className="font-semibold text-[#F5F5F7] font-mono">${activeCard.monthlyLimit}</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={activeCard.monthlyLimit}
                onChange={(e) => onUpdateCard(activeCard.id, { monthlyLimit: parseFloat(e.target.value) })}
                className="w-full accent-[#0A84FF] cursor-pointer"
              />
            </div>

            {/* Quick Channel Safeguard Status */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-[8px] bg-[#2C2C2E]/60 border border-[#38383A] text-center">
                <span className="text-[10px] text-[#8E8E93] uppercase font-mono block mb-1">Online</span>
                <span className={`font-semibold text-xs font-mono ${activeCard.allowOnline ? 'text-[#34C759]' : 'text-[#636366]'}`}>
                  {activeCard.allowOnline ? 'ALLOWED' : 'LOCKED'}
                </span>
              </div>

              <div className="p-2.5 rounded-[8px] bg-[#2C2C2E]/60 border border-[#38383A] text-center">
                <span className="text-[10px] text-[#8E8E93] uppercase font-mono block mb-1">International</span>
                <span className={`font-semibold text-xs font-mono ${activeCard.allowInternational ? 'text-[#34C759]' : 'text-[#636366]'}`}>
                  {activeCard.allowInternational ? 'ALLOWED' : 'LOCKED'}
                </span>
              </div>

              <div className="p-2.5 rounded-[8px] bg-[#2C2C2E]/60 border border-[#38383A] text-center">
                <span className="text-[10px] text-[#8E8E93] uppercase font-mono block mb-1">ATM Cash</span>
                <span className={`font-semibold text-xs font-mono ${activeCard.allowATM ? 'text-[#34C759]' : 'text-[#636366]'}`}>
                  {activeCard.allowATM ? 'ALLOWED' : 'LOCKED'}
                </span>
              </div>
            </div>

            {/* Issue Burner Action Card */}
            <button
              onClick={onOpenBurnerCard}
              className="w-full py-2.5 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>Issue Single-Use Burner Card</span>
            </button>
          </div>

          {/* Upcoming Subscriptions Radar */}
          <div className="bg-[#1C1C1E] p-5 sm:p-6 rounded-[12px] border border-[#38383A] shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-[#F5F5F7] text-sm flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-[#0A84FF]" />
                  <span>Recurring Subscriptions</span>
                </h3>
                <p className="text-[11px] text-[#8E8E93] mt-0.5">Automated detection within next 14 days</p>
              </div>

              <button
                onClick={() => onNavigateTab('subscriptions')}
                className="text-xs text-[#0A84FF] font-medium hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {upcomingSubs.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2.5 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-[#F5F5F7] block">{sub.name}</span>
                    <span className="text-[10px] text-[#8E8E93] font-mono">
                      Charges in {sub.daysRemaining} days • {sub.cardName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium font-mono text-[#F5F5F7] text-sm">
                      ${sub.monthlyCost.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-[#8E8E93] block uppercase font-mono">/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recent Authorizations Table */}
      <div className="bg-[#1C1C1E] p-5 sm:p-6 rounded-[12px] border border-[#38383A] shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-[#38383A]">
          <div>
            <h3 className="font-semibold text-[#F5F5F7] text-base">Recent Authorizations</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Live feed of merchant events across linked and virtual cards
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-[#0A84FF] font-medium hover:underline flex items-center gap-1"
          >
            <span>Open Full Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#38383A] text-[#8E8E93] uppercase font-mono text-[10px] tracking-wider">
                <th className="pb-3">Merchant</th>
                <th className="pb-3">Card Used</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#38383A]/60 font-normal">
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-[#2C2C2E]/60 transition cursor-pointer"
                >
                  <td className="py-3 flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-medium ${
                        tx.type === 'credit'
                          ? 'bg-[#34C759]/15 text-[#34C759]'
                          : 'bg-[#2C2C2E] text-[#8E8E93]'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="font-medium text-[#F5F5F7]">{tx.merchant}</span>
                  </td>
                  <td className="py-3 text-[#8E8E93]">
                    {tx.cardName || 'Executive Card'}
                  </td>
                  <td className="py-3 text-[#8E8E93]">{tx.category}</td>
                  <td className="py-3 text-[#636366] font-mono text-[11px]">{tx.date}</td>
                  <td className="py-3">
                    <Badge variant={tx.status === 'declined' ? 'red' : 'green'} size="xs">
                      {tx.status}
                    </Badge>
                  </td>
                  <td
                    className={`py-3 text-right font-mono font-medium text-sm tabular-nums ${
                      tx.type === 'credit' ? 'text-[#34C759]' : 'text-[#F5F5F7]'
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
