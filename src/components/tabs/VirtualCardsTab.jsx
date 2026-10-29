import { useState, useMemo } from 'react';
import {
  Plus, Flame, Lock, Unlock, Eye
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import CardPreview from '../cards/CardPreview';
import { SkeletonCard } from '../ui/Skeleton';

export default function VirtualCardsTab({
  cards = [],
  onOpenNewCard,
  onOpenBurnerCard,
  onSelectCardDetails,
  onUpdateCard,
  isLoading = false,
  showToast,
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'frozen', 'burner'

  // Filter only virtual protection & demo cards (excluding linked bank cards)
  const virtualCards = useMemo(() => {
    return cards.filter((c) => c.source !== 'bank_connection');
  }, [cards]);

  const filtered = useMemo(() => {
    return virtualCards.filter((card) => {
      if (statusFilter === 'active' && card.isLocked) return false;
      if (statusFilter === 'frozen' && !card.isLocked) return false;
      if (statusFilter === 'burner' && !card.isBurner && card.type !== 'burner') return false;
      return true;
    });
  }, [virtualCards, statusFilter]);

  const activeCount = virtualCards.filter((c) => !c.isLocked).length;
  const frozenCount = virtualCards.filter((c) => c.isLocked).length;

  const handleToggleFreeze = (card) => {
    const next = !card.isLocked;
    onUpdateCard?.(card.id, { isLocked: next });
    showToast?.(`Virtual card "${card.label}" ${next ? 'frozen' : 'unfrozen'}.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Hero Action Header */}
      <div className="p-5 rounded-[12px] bg-[#1C1C1E] border border-[#38383A] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-[#F5F5F7] tracking-tight">
              Purpose-Specific Virtual Cards
            </h2>
            <Badge variant="blue" size="xs">
              Hardware Spend Limits Enforced
            </Badge>
          </div>
          <p className="text-xs text-[#8E8E93] max-w-xl leading-relaxed">
            Isolate merchants and subscription risks. Every virtual card has an independent per-transaction cap, period budget, and instant pause switch.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={Flame}
            onClick={onOpenBurnerCard}
          >
            Create Burner
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenNewCard}
          >
            Create Virtual Card
          </Button>
        </div>
      </div>

      {/* Filter Tabs (macOS Segmented Control) */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#38383A]">
        <div className="flex items-center gap-1 p-1 bg-[#1C1C1E] rounded-[8px] border border-[#38383A] text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-[6px] font-medium transition duration-100 border whitespace-nowrap text-center ${
              statusFilter === 'all' ? 'bg-[#2C2C2E] text-[#F5F5F7] border-[#38383A] shadow-sm' : 'border-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            <span className="sm:hidden">All ({virtualCards.length})</span>
            <span className="hidden sm:inline">All Virtual ({virtualCards.length})</span>
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-[6px] font-medium transition duration-100 border whitespace-nowrap text-center ${
              statusFilter === 'active' ? 'bg-[#2C2C2E] text-[#F5F5F7] border-[#38383A] shadow-sm' : 'border-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('frozen')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-[6px] font-medium transition duration-100 border whitespace-nowrap text-center ${
              statusFilter === 'frozen' ? 'bg-[#2C2C2E] text-[#F5F5F7] border-[#38383A] shadow-sm' : 'border-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            Frozen ({frozenCount})
          </button>
          <button
            onClick={() => setStatusFilter('burner')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-[6px] font-medium transition duration-100 border whitespace-nowrap text-center ${
              statusFilter === 'burner' ? 'bg-[#2C2C2E] text-[#F5F5F7] border-[#38383A] shadow-sm' : 'border-transparent text-[#8E8E93] hover:text-[#F5F5F7]'
            }`}
          >
            <span className="sm:hidden">Burner</span>
            <span className="hidden sm:inline">Burner / Disposable</span>
          </button>
        </div>

        <div className="text-xs text-[#8E8E93] font-mono hidden sm:block">
          Simulation &amp; Sandbox Rails
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((card) => {
            return (
              <div
                key={card.id}
                className="flex flex-col space-y-2 group"
              >
                {/* 1. Ultimate CardHub Virtual Card Component */}
                <div
                  onClick={() => onSelectCardDetails?.(card)}
                  className="cursor-pointer transition-transform duration-200 active:scale-[0.99]"
                >
                  <CardPreview card={card} />
                </div>

                {/* 2. Docked Action Controls */}
                <div className="flex items-center justify-between px-3 py-2 rounded-[10px] bg-[#1C1C1E] border border-[#38383A] text-xs shadow-sm">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#8E8E93]">
                    <span className={`w-1.5 h-1.5 rounded-full ${card.isLocked ? 'bg-[#FF453A]' : 'bg-[#34C759]'}`} />
                    <span>{card.isLocked ? 'Decline All Active' : 'Live Gateway Active'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={card.isLocked ? 'secondary' : 'danger'}
                      size="xs"
                      icon={card.isLocked ? Unlock : Lock}
                      onClick={() => handleToggleFreeze(card)}
                    >
                      {card.isLocked ? 'Unfreeze' : 'Freeze'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Eye}
                      onClick={() => onSelectCardDetails?.(card)}
                    >
                      Details
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
