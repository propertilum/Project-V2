import { useState, useMemo } from 'react';
import {
  CreditCard, Shield, Lock, Unlock, Eye,
  Search, Building2, ArrowUpRight
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import StatusDot from '../ui/StatusDot';
import EmptyState from '../ui/EmptyState';
import { SkeletonCard } from '../ui/Skeleton';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

export default function MyCardsTab({
  cards = [],
  onSelectCardDetails,
  onUpdateCard,
  onNavigateTab,
  isLoading = false,
  showToast,
}) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'bank_connection', 'cardhub_issuer', 'demo'

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (sourceFilter !== 'all' && (card.source || 'demo') !== sourceFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchLabel = (card.label || '').toLowerCase().includes(q);
        const matchBrand = (card.brand || '').toLowerCase().includes(q);
        const matchLast4 = (card.last4 || '').includes(q);
        const matchInstitution = (card.institution || '').toLowerCase().includes(q);
        if (!matchLabel && !matchBrand && !matchLast4 && !matchInstitution) return false;
      }
      return true;
    });
  }, [cards, sourceFilter, search]);

  const bankCardsCount = cards.filter((c) => c.source === 'bank_connection').length;
  const virtualCardsCount = cards.filter((c) => c.source === 'cardhub_issuer').length;
  const demoCardsCount = cards.filter((c) => c.source === 'demo' || !c.source).length;

  const handleToggleFreeze = (card) => {
    if (card.source === 'bank_connection') {
      showToast?.('Linked bank cards cannot be frozen by CardHub. Please freeze via your bank app.', 'warning');
      return;
    }
    const nextLocked = !card.isLocked;
    onUpdateCard?.(card.id, { isLocked: nextLocked });
    showToast?.(`Card "${card.label}" ${nextLocked ? 'frozen' : 'unfrozen'}.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & CTAs */}
      <div className="p-5 rounded-[12px] bg-[#1C1C1E] border border-[#38383A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-[#F5F5F7] tracking-tight">
              All Connected &amp; Issued Cards
            </h2>
            <span className="text-xs text-[#8E8E93] font-mono">
              ({cards.length} Total Cards)
            </span>
          </div>
          <p className="text-xs text-[#8E8E93] max-w-2xl leading-relaxed">
            Monitor activity across your primary bank cards and control exposure with purpose-specific virtual cards.
          </p>
        </div>

        {onNavigateTab && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowUpRight}
              onClick={() => onNavigateTab('virtual-cards')}
            >
              Virtual Cards Hub
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#38383A]">
        {/* Source Pills (macOS Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-[#1C1C1E] rounded-[8px] border border-[#38383A] text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setSourceFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-[6px] font-medium transition duration-100 border whitespace-nowrap text-center ${
              sourceFilter === 'all' ? 'bg-[#2C2C2E] text-[#F5F5F7] border-[#38383A] shadow-sm' : 'border-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            <span className="sm:hidden">All ({cards.length})</span>
            <span className="hidden sm:inline">All Cards ({cards.length})</span>
          </button>
          <button
            onClick={() => setSourceFilter('bank_connection')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-[6px] font-medium transition duration-100 border whitespace-nowrap text-center ${
              sourceFilter === 'bank_connection' ? 'bg-[#2C2C2E] text-[#F5F5F7] border-[#38383A] shadow-sm' : 'border-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            <span className="sm:hidden">Bank ({bankCardsCount})</span>
            <span className="hidden sm:inline">Linked Bank ({bankCardsCount})</span>
          </button>
          <button
            onClick={() => setSourceFilter('cardhub_issuer')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-[6px] font-medium transition duration-100 border whitespace-nowrap text-center ${
              sourceFilter === 'cardhub_issuer' ? 'bg-[#2C2C2E] text-[#F5F5F7] border-[#38383A] shadow-sm' : 'border-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            <span className="sm:hidden">Virtual ({virtualCardsCount})</span>
            <span className="hidden sm:inline">Virtual Protection ({virtualCardsCount})</span>
          </button>
          <button
            onClick={() => setSourceFilter('demo')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-[6px] font-medium transition duration-100 border whitespace-nowrap text-center ${
              sourceFilter === 'demo' ? 'bg-[#2C2C2E] text-[#F5F5F7] border-[#38383A] shadow-sm' : 'border-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            Demo ({demoCardsCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cards..."
            className="w-full bg-[#1C1C1E] text-[#F5F5F7] text-xs pl-8 pr-3 py-1.5 h-8 rounded-[8px] border border-[#38383A] focus:outline-none focus:border-[#0A84FF] box-border"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredCards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No cards found"
          description="No cards match your filter criteria. Clear search or check other tabs."
          actionText={search ? "Clear Search" : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card) => {
          const isBankCard = card.source === 'bank_connection';
          const isVirtual = card.source === 'cardhub_issuer';
          const monthlyLimit = parseFloat(card.monthlyLimit) || 0;
          const spend = parseFloat(card.currentSpend) || 0;
          const percentUsed = monthlyLimit > 0 ? Math.min(100, Math.round((spend / monthlyLimit) * 100)) : 0;

          return (
            <div
              key={card.id}
              className={`rounded-[12px] border transition-all duration-150 flex flex-col justify-between overflow-hidden ${
                card.isLocked
                  ? 'bg-[#1C1C1E] border-[#FF453A]/30 opacity-80'
                  : 'bg-[#1C1C1E] border-[#38383A] hover:border-[#38383A]/80 shadow-sm'
              }`}
            >
              {/* Card Header Strip */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center font-medium text-xs ${
                      isBankCard
                        ? 'bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20'
                        : isVirtual
                          ? 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
                          : 'bg-[#BF5AF2]/10 text-[#BF5AF2] border border-[#BF5AF2]/20'
                    }`}>
                      {isBankCard ? <Building2 className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#F5F5F7] tracking-tight leading-snug">
                        {card.label}
                      </h3>
                      <span className="text-[10px] text-[#8E8E93] font-mono block">
                        {card.institution || (isBankCard ? 'Linked Bank Account' : 'CardHub Virtual Issuer')}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      card.isLocked
                        ? 'red'
                        : isBankCard
                          ? 'monitoring'
                          : isVirtual
                            ? 'enforced'
                            : 'demo'
                    }
                    size="xs"
                  >
                    <StatusDot status={card.isLocked ? 'frozen' : 'active'} className="mr-1" />
                    {card.isLocked
                      ? 'Frozen'
                      : isBankCard
                        ? 'Monitored'
                        : isVirtual
                          ? 'Active Virtual'
                          : 'Simulation'}
                  </Badge>
                </div>

                {/* Masked Card Details */}
                <div className="p-2.5 my-3 rounded-[8px] bg-[#2C2C2E]/60 border border-[#38383A] flex items-center justify-between text-xs">
                  <div className="font-mono text-[#F5F5F7] font-medium tracking-wider">
                    •••• {card.last4 || (card.cardNumber ? card.cardNumber.slice(-4) : '4242')}
                  </div>
                  <div className="text-[10px] font-mono text-[#8E8E93]">
                    Exp: {card.expDate || '12/28'}
                  </div>
                  <div className="text-[10px] font-semibold text-[#0A84FF] uppercase tracking-wider font-mono">
                    {card.brand || 'VISA'}
                  </div>
                </div>

                {/* Spend & Limit Progress */}
                {monthlyLimit > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8E8E93]">Spend this period:</span>
                      <span className="font-mono font-medium text-[#F5F5F7] tabular-nums">
                        {formatCurrency(spend)} / {formatCurrency(monthlyLimit)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#2C2C2E] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          percentUsed > 90
                            ? 'bg-[#FF453A]'
                            : percentUsed > 75
                              ? 'bg-[#FF9F0A]'
                              : 'bg-[#0A84FF]'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Merchant Lock or Special restrictions */}
                {card.merchantLock && (
                  <div className="mt-2.5 text-[11px] text-[#0A84FF] flex items-center gap-1 font-mono">
                    <Shield className="w-3 h-3 text-[#0A84FF] shrink-0" />
                    <span>Locked to: {card.merchantLock}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-2.5 border-t border-[#38383A] bg-[#2C2C2E]/40 flex items-center justify-between text-xs">
                <div className="text-[10px] text-[#8E8E93] font-mono">
                  {card.lastSyncedAt ? `Synced ${formatRelativeTime(card.lastSyncedAt)}` : 'Live'}
                </div>

                <div className="flex items-center gap-2">
                  {/* Freeze button for Virtual Cards only */}
                  {!isBankCard ? (
                    <button
                      onClick={() => handleToggleFreeze(card)}
                      className={`p-1.5 rounded-[6px] border text-xs transition duration-100 active:scale-[0.98] ${
                        card.isLocked
                          ? 'bg-[#34C759]/15 border-[#34C759]/30 text-[#34C759] hover:bg-[#34C759]/25'
                          : 'bg-[#2C2C2E] border-[#38383A] text-[#8E8E93] hover:text-[#FF453A] hover:border-[#FF453A]/40'
                      }`}
                      title={card.isLocked ? 'Unfreeze card' : 'Freeze card'}
                    >
                      {card.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span
                      className="text-[10px] text-[#636366] cursor-help font-mono"
                      title="Bank cards cannot be frozen remotely by CardHub."
                    >
                      Bank Freeze N/A
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Eye}
                    onClick={() => onSelectCardDetails?.(card)}
                  >
                    Inspect
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
