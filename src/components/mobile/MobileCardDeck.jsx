import { useState, useRef, useEffect } from 'react';
import { 
  Lock, Unlock, Copy, Sliders, Plus, Sparkles, CreditCard, 
  ArrowUpRight, ArrowDownLeft, Shield, AlertTriangle, ChevronRight,
  Eye, EyeOff
} from 'lucide-react';
import CardPreview from '../cards/CardPreview';
import MobileActionSheet from './MobileActionSheet';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { getFullCardNumber, getCvv } from '../../utils/cardGenerator';

export default function MobileCardDeck({
  cards = [],
  activeCardId,
  setActiveCardId,
  walletBalance,
  transactions = [],
  onOpenNewCard,
  onOpenBurnerCard,
  onOpenTopUp,
  onUpdateCard,
  onSelectTransaction,
  onNavigateTab,
  onCopy,
  onOpenCardDetails,
}) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const scrollRef = useRef(null);

  const activeCardIndex = Math.max(0, cards.findIndex((c) => c.id === activeCardId));
  const activeCard = cards[activeCardIndex] || cards[0];

  // Sync scroll position when activeCardId changes externally
  useEffect(() => {
    if (!scrollRef.current || cards.length === 0) return;
    const cardEl = scrollRef.current.children[activeCardIndex];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeCardIndex, cards.length]);

  // Handle carousel snap scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth * 0.85;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (cards[newIndex] && cards[newIndex].id !== activeCardId) {
      setActiveCardId(cards[newIndex].id);
    }
  };

  const handleToggleFreeze = () => {
    if (!activeCard) return;
    if (activeCard.source === 'bank_connection') {
      onCopy?.('', 'Linked bank cards must be frozen via your bank.');
      return;
    }
    const nextLocked = !activeCard.isLocked;
    onUpdateCard(activeCard.id, { isLocked: nextLocked });
  };

  const handleCopyCardNumber = () => {
    if (!activeCard) return;
    const fullNum = getFullCardNumber(activeCard);
    onCopy?.(fullNum, `${activeCard.label} Card Number`);
  };

  // Filter transactions for this card, fallback to recent
  const cardTransactions = transactions
    .filter((t) => t.cardId === activeCard?.id)
    .slice(0, 4);

  const displayTransactions = cardTransactions.length > 0 ? cardTransactions : transactions.slice(0, 4);

  const monthlyLimit = parseFloat(activeCard?.monthlyLimit) || 0;
  const currentSpend = parseFloat(activeCard?.currentSpend) || 0;
  const percentUsed = monthlyLimit > 0 ? Math.min(100, Math.round((currentSpend / monthlyLimit) * 100)) : 0;
  const isNearCap = percentUsed >= 80;

  if (!activeCard) {
    return (
      <div className="p-5 flex flex-col items-center justify-center text-center my-8">
        <div className="w-14 h-14 rounded-[12px] bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] flex items-center justify-center mb-4">
          <CreditCard className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#F5F5F7]">No Active Cards</h2>
        <p className="text-xs text-[#8E8E93] max-w-xs mt-1 mb-5">
          Issue a virtual card or generate a single-use burner token to start making secure transactions.
        </p>
        <div className="w-full space-y-2.5">
          <button
            onClick={onOpenNewCard}
            className="w-full py-3 px-4 rounded-[12px] bg-[#0A84FF] text-white font-semibold text-sm active:scale-[0.98] transition shadow-md shadow-[#0A84FF]/25 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Virtual Card</span>
          </button>
          <button
            onClick={onOpenBurnerCard}
            className="w-full py-3 px-4 rounded-[12px] bg-[#2C2C2E] border border-[#38383A] text-[#F5F5F7] font-semibold text-sm active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#BF5AF2]" />
            <span>Generate Burner Token</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-3 pb-6">

      {/* ── 1. Apple Wallet Swipeable Card Deck Carousel ── */}
      <div className="w-full flex flex-col items-center">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full flex gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar px-5 scroll-smooth"
        >
          {cards.map((card, idx) => {
            const isSelected = card.id === activeCard.id;
            return (
              <div
                key={card.id}
                onClick={() => {
                  setActiveCardId(card.id);
                  if (isSelected) {
                    setShowSensitive((prev) => !prev);
                    setShowCVV((prev) => !prev);
                  }
                }}
                className={`snap-center shrink-0 w-[86vw] max-w-[340px] transition-all duration-200 cursor-pointer ${
                  isSelected ? 'scale-100 opacity-100' : 'scale-[0.95] opacity-60'
                }`}
              >
                <CardPreview
                  card={card}
                  showNumber={isSelected && showSensitive}
                  showCVV={isSelected && showCVV}
                  className="shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
                />
              </div>
            );
          })}

          {/* Quick Issue Card Tile at end of deck */}
          <div
            onClick={() => setIsActionSheetOpen(true)}
            className="snap-center shrink-0 w-[86vw] max-w-[340px] aspect-[1.586/1] rounded-[14px] border-2 border-dashed border-[#38383A] bg-[#1C1C1E]/40 hover:bg-[#1C1C1E] active:scale-[0.98] flex flex-col items-center justify-center gap-2 text-[#8E8E93] hover:text-[#0A84FF] transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-[#2C2C2E] border border-[#38383A] flex items-center justify-center text-[#0A84FF]">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#F5F5F7]">Issue New Card</span>
            <span className="text-[10px] text-[#8E8E93]">Tap to create</span>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-1.5 mt-3">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setActiveCardId(card.id)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                card.id === activeCard.id
                  ? 'w-5 bg-[#0A84FF]'
                  : 'w-1.5 bg-[#38383A]'
              }`}
              aria-label={`Go to card ${idx + 1}`}
            />
          ))}
          {cards.length > 1 && (
            <span className="text-[10px] font-mono text-[#8E8E93] ml-1.5">
              {activeCardIndex + 1}/{cards.length}
            </span>
          )}
        </div>
      </div>

      {/* ── 2. Dedicated Thumb-Zone Quick Action Dock ── */}
      <div className="px-5">
        <div className="grid grid-cols-4 gap-2.5">
          {/* Freeze / Unfreeze */}
          <button
            onClick={handleToggleFreeze}
            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-[12px] border transition active:scale-[0.94] ${
              activeCard.isLocked
                ? 'bg-[#FF453A]/15 border-[#FF453A]/40 text-[#FF453A]'
                : 'bg-[#1C1C1E] border-[#38383A] text-[#F5F5F7] hover:border-[#48484A]'
            }`}
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#2C2C2E] flex items-center justify-center mb-1">
              {activeCard.isLocked ? (
                <Lock className="w-4 h-4 text-[#FF453A]" />
              ) : (
                <Unlock className="w-4 h-4 text-[#34C759]" />
              )}
            </div>
            <span className="text-[11px] font-medium leading-none">
              {activeCard.isLocked ? 'Unfreeze' : 'Freeze'}
            </span>
          </button>

          {/* Copy Card Number */}
          <button
            onClick={handleCopyCardNumber}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-[12px] bg-[#1C1C1E] border border-[#38383A] text-[#F5F5F7] hover:border-[#48484A] active:scale-[0.94] transition"
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#2C2C2E] flex items-center justify-center mb-1 text-[#0A84FF]">
              <Copy className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium leading-none">Copy</span>
          </button>

          {/* Controls & Limits */}
          <button
            onClick={() => onOpenCardDetails?.(activeCard)}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-[12px] bg-[#1C1C1E] border border-[#38383A] text-[#F5F5F7] hover:border-[#48484A] active:scale-[0.94] transition"
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#2C2C2E] flex items-center justify-center mb-1 text-[#FF9F0A]">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium leading-none">Limits</span>
          </button>

          {/* Issue & Action Options Menu */}
          <button
            onClick={() => setIsActionSheetOpen(true)}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-[12px] bg-[#1C1C1E] border border-[#38383A] text-[#F5F5F7] hover:border-[#48484A] active:scale-[0.94] transition"
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#2C2C2E] flex items-center justify-center mb-1 text-[#0A84FF]">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-medium leading-none">Issue</span>
          </button>
        </div>
      </div>

      {/* ── 3. Active Card Exposure & Limit Widget ── */}
      <div className="px-5">
        <div className="p-4 rounded-[14px] bg-[#1C1C1E] border border-[#38383A] shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F5F5F7]">{activeCard.label}</span>
              <span className="text-[10px] font-mono text-[#8E8E93]">
                •••• {activeCard.last4 || (activeCard.cardNumber ? activeCard.cardNumber.slice(-4) : '4242')}
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[5px] uppercase ${
              activeCard.isLocked
                ? 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
                : 'bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30'
            }`}>
              {activeCard.isLocked ? 'Frozen' : 'Active'}
            </span>
          </div>

          {/* Spending Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-[#8E8E93] font-medium">Monthly Spending</span>
              <span className="font-mono font-semibold text-[#F5F5F7]">
                {formatCurrency(currentSpend)}{' '}
                <span className="text-[#8E8E93] font-normal">/ {formatCurrency(monthlyLimit)}</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#2C2C2E] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isNearCap ? 'bg-[#FF9F0A]' : 'bg-[#0A84FF]'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#38383A]/60 text-[10px] text-[#8E8E93]">
            <span className="px-2 py-0.5 rounded-[5px] bg-[#2C2C2E] font-medium text-[#F5F5F7]">
              {activeCard.source === 'bank_connection' ? 'Linked Bank Card' : 'CardHub Virtual Issuer'}
            </span>
            {activeCard.merchantLock && (
              <span className="px-2 py-0.5 rounded-[5px] bg-[#0A84FF]/10 text-[#0A84FF] border border-[#0A84FF]/20 font-mono">
                Locked: {activeCard.merchantLock}
              </span>
            )}
            {activeCard.isBurner && (
              <span className="px-2 py-0.5 rounded-[5px] bg-[#BF5AF2]/10 text-[#BF5AF2] border border-[#BF5AF2]/20 font-mono">
                Single-use Token
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Card-Specific Recent Activity ── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-semibold text-[#8E8E93] uppercase font-mono tracking-wider">
            Card Activity
          </h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-[11px] font-semibold text-[#0A84FF] flex items-center gap-0.5 active:opacity-75"
          >
            <span>All Activity</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayTransactions.length === 0 ? (
          <div className="p-4 rounded-[12px] bg-[#1C1C1E] border border-[#38383A] text-center text-xs text-[#8E8E93]">
            No recent charges recorded for this card.
          </div>
        ) : (
          <div className="rounded-[14px] bg-[#1C1C1E] border border-[#38383A] divide-y divide-[#38383A]/60 overflow-hidden shadow-xs">
            {displayTransactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              const isDeclined = tx.status === 'declined';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction?.(tx)}
                  className="flex items-center justify-between p-3.5 active:bg-[#2C2C2E] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 text-xs font-bold font-mono border ${
                      isDeclined
                        ? 'bg-[#FF453A]/15 border-[#FF453A]/30 text-[#FF453A]'
                        : isCredit
                          ? 'bg-[#34C759]/15 border-[#34C759]/30 text-[#34C759]'
                          : 'bg-[#2C2C2E] border-[#38383A] text-[#F5F5F7]'
                    }`}>
                      {tx.merchant ? tx.merchant.slice(0, 2).toUpperCase() : 'TX'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#F5F5F7] truncate">
                        {tx.merchant || 'Merchant Charge'}
                      </div>
                      <div className="text-[10px] text-[#8E8E93] font-mono mt-0.5">
                        {tx.timestamp ? formatRelativeTime(tx.timestamp) : 'Recent'} • {tx.category || 'General'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-xs font-bold font-mono ${
                      isDeclined
                        ? 'text-[#8E8E93] line-through'
                        : isCredit
                          ? 'text-[#34C759]'
                          : 'text-[#F5F5F7]'
                    }`}>
                      {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                    <div className="text-[9px] font-mono mt-0.5">
                      {isDeclined ? (
                        <span className="text-[#FF453A]">Declined</span>
                      ) : (
                        <span className="text-[#34C759]">Approved</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. Animated Option Action Sheet ── */}
      <MobileActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        title="Card Issuance & Actions"
        subtitle={`Select an action for ${activeCard?.label || 'CardHub'}`}
        options={[
          {
            id: 'virtual',
            label: 'Issue Virtual Card',
            description: 'Create a permanent digital card with monthly spending caps & merchant locks',
            icon: CreditCard,
            color: 'text-[#0A84FF]',
            bg: 'bg-[#0A84FF]/15',
            badge: 'Recommended',
            onClick: onOpenNewCard,
          },
          {
            id: 'burner',
            label: 'Generate Burner Token',
            description: 'Single-use self-destructing disposable card for free trials & untrusted checkouts',
            icon: Sparkles,
            color: 'text-[#BF5AF2]',
            bg: 'bg-[#BF5AF2]/15',
            onClick: onOpenBurnerCard,
          },
          {
            id: 'fund',
            label: 'Fund CardHub Balance',
            description: 'Deposit funds to increase available limits across your cards (0% fee)',
            icon: Plus,
            color: 'text-[#34C759]',
            bg: 'bg-[#34C759]/15',
            onClick: onOpenTopUp,
          },
          {
            id: 'limits',
            label: 'Card Controls & Limits',
            description: 'Adjust monthly limit, merchant lock, or view sensitive CVV & card number',
            icon: Sliders,
            color: 'text-[#FF9F0A]',
            bg: 'bg-[#FF9F0A]/15',
            onClick: () => onOpenCardDetails?.(activeCard),
          },
        ]}
      />

    </div>
  );
}
