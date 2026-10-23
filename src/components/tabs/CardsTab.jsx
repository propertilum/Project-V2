import { useState } from 'react';
import { 
  Plus, Search, Sliders, Shield, Lock, Unlock, 
  Copy, Flame 
} from 'lucide-react';
import CardPreview from '../cards/CardPreview';
import Badge from '../ui/Badge';
import { CARD_TYPES } from '../../data/constants';
import { formatCurrency } from '../../utils/formatters';

export default function CardsTab({
  cards,
  onOpenNewCard,
  onOpenBurnerCard,
  onSelectCardDetails,
  onUpdateCard,
  onCopy,
}) {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'all', label: 'All Cards', count: cards.length },
    { id: 'active', label: 'Active', count: cards.filter((c) => !c.isLocked && !c.isBurned).length },
    { id: 'frozen', label: 'Frozen', count: cards.filter((c) => c.isLocked).length },
    { id: 'burner', label: 'Burner', count: cards.filter((c) => c.isBurner).length },
    { id: 'subscription', label: 'Subscriptions', count: cards.filter((c) => c.type === 'subscription').length },
  ];

  const filteredCards = cards.filter((card) => {
    if (filterType === 'active' && (card.isLocked || card.isBurned)) return false;
    if (filterType === 'frozen' && !card.isLocked) return false;
    if (filterType === 'burner' && !card.isBurner) return false;
    if (filterType === 'subscription' && card.type !== 'subscription') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchLabel = (card.label || '').toLowerCase().includes(q);
      const matchNumber = (card.cardNumber || card.last4 || '').replace(/\s+/g, '').includes(q);
      const matchBrand = (card.brand || '').toLowerCase().includes(q);
      return matchLabel || matchNumber || matchBrand;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-[#F5F5F7]">
      {/* Top Controls Bar */}
      <div className="bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* macOS segmented filter */}
        <div className="flex bg-[#2C2C2E] border border-[#38383A] p-0.5 rounded-[8px] overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 text-[12px] font-medium rounded-[6px] transition active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-[#0A84FF] text-white shadow-sm'
                  : 'text-[#8E8E93] hover:text-[#F5F5F7]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 rounded-full font-mono ${filterType === tab.id ? 'bg-white/20 text-white' : 'bg-[#38383A] text-[#8E8E93]'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[12px] text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF]"
            />
          </div>

          <button
            onClick={onOpenBurnerCard}
            className="px-3 py-1.5 bg-[#FF453A]/15 hover:bg-[#FF453A]/25 border border-[#FF453A]/30 text-[#FF453A] font-medium text-[12px] rounded-[8px] transition active:scale-[0.98] flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Issue Burner</span>
          </button>

          <button
            onClick={onOpenNewCard}
            className="px-3 py-1.5 bg-[#0A84FF] hover:bg-[#0071E3] text-white font-medium text-[12px] rounded-[8px] transition active:scale-[0.98] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Virtual Card</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="bg-[#1C1C1E] p-12 rounded-[12px] border border-[#38383A] text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-[12px] bg-[#0A84FF]/15 border border-[#0A84FF]/30 text-[#0A84FF] flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-white">No cards matched your filter</h3>
            <p className="text-[12px] text-[#8E8E93] mt-1">
              Try adjusting your search criteria or issue a new purpose-built virtual card.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => { setFilterType('all'); setSearchQuery(''); }}
              className="px-3 py-1.5 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] font-medium rounded-[8px] text-[12px] transition border border-[#38383A]"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenNewCard}
              className="px-3 py-1.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium rounded-[8px] text-[12px] transition"
            >
              Issue Virtual Card
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            const typeMeta = CARD_TYPES[card.type] || CARD_TYPES.main;
            const spendPercent = Math.min(100, Math.round(((card.currentSpend || 0) / card.monthlyLimit) * 100));

            return (
              <div
                key={card.id}
                className="bg-[#1C1C1E] rounded-[12px] border border-[#38383A] overflow-hidden flex flex-col justify-between hover:border-[#48484A] transition"
              >
                {/* Card Header Info */}
                <div className="p-3.5 border-b border-[#38383A] flex items-center justify-between bg-[#2C2C2E]/60">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="font-semibold text-white text-[13px] truncate">{card.label}</span>
                    <Badge variant={typeMeta.color} size="xs">{typeMeta.name}</Badge>
                  </div>

                  <span className="font-mono text-[11px] font-semibold text-[#8E8E93] shrink-0">
                    {card.brand}
                  </span>
                </div>

                {/* Card Canvas Visual */}
                <div className="p-4">
                  <CardPreview card={card} size="compact" />

                  {/* Spend Progress Bar */}
                  <div className="mt-4 p-3 bg-[#2C2C2E] rounded-[8px] border border-[#38383A] space-y-2">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-[#8E8E93] font-medium">Monthly Allocation</span>
                      <span className="font-mono font-medium text-white">
                        {formatCurrency(card.currentSpend || 0)} / {formatCurrency(card.monthlyLimit)}
                      </span>
                    </div>

                    <div className="w-full bg-[#38383A] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${spendPercent > 80 ? 'bg-[#FF453A]' : 'bg-[#0A84FF]'}`}
                        style={{ width: `${spendPercent}%` }}
                      ></div>
                    </div>

                    {/* Channel Safeguard Pills */}
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] font-medium font-mono">
                      <span className={`px-2 py-0.5 rounded-[4px] ${card.allowOnline ? 'bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30' : 'bg-[#38383A] text-[#8E8E93]'}`}>
                        Online: {card.allowOnline ? 'ON' : 'OFF'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-[4px] ${card.allowInternational ? 'bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30' : 'bg-[#38383A] text-[#8E8E93]'}`}>
                        Int&apos;l: {card.allowInternational ? 'ON' : 'OFF'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-[4px] ${card.allowATM ? 'bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30' : 'bg-[#38383A] text-[#8E8E93]'}`}>
                        ATM: {card.allowATM ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-[#2C2C2E]/60 border-t border-[#38383A] flex items-center gap-2">
                  <button
                    onClick={() => onSelectCardDetails(card)}
                    className="flex-1 py-1.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium text-[12px] rounded-[6px] transition flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Controls &amp; Limits</span>
                  </button>

                  <button
                    onClick={() => onCopy(card.cardNumber, 'Card Number')}
                    className="px-2.5 py-1.5 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] font-medium text-[12px] rounded-[6px] border border-[#38383A] transition"
                    title="Copy Card Number"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#0A84FF]" />
                  </button>

                  <button
                    onClick={() => onUpdateCard(card.id, { isLocked: !card.isLocked })}
                    className={`px-2.5 py-1.5 font-medium text-[12px] rounded-[6px] border transition active:scale-[0.98] ${
                      card.isLocked
                        ? 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30 hover:bg-[#FF453A]/25'
                        : 'bg-[#2C2C2E] text-[#8E8E93] border-[#38383A] hover:bg-[#38383A]'
                    }`}
                    title={card.isLocked ? 'Unfreeze Card' : 'Freeze Card'}
                  >
                    {card.isLocked ? <Unlock className="w-3.5 h-3.5 text-[#FF453A]" /> : <Lock className="w-3.5 h-3.5 text-[#8E8E93]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
