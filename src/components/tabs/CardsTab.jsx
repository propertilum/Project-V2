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
    { id: 'burner', label: 'Burner / Expiring', count: cards.filter((c) => c.isBurner).length },
    { id: 'subscription', label: 'Subscriptions', count: cards.filter((c) => c.type === 'subscription').length },
  ];

  const filteredCards = cards.filter((card) => {
    // Type filter
    if (filterType === 'active' && (card.isLocked || card.isBurned)) return false;
    if (filterType === 'frozen' && !card.isLocked) return false;
    if (filterType === 'burner' && !card.isBurner) return false;
    if (filterType === 'subscription' && card.type !== 'subscription') return false;

    // Search query
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
    <div className="space-y-6 text-slate-200">
      {/* Top Controls Bar */}
      <div className="bg-[#111418] p-5 rounded-2xl border border-[#262B33] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-[#161B22] text-slate-400 hover:text-white border border-[#262B33]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterType === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#161B22] border border-[#262B33] rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={onOpenBurnerCard}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4" />
            <span>Issue Burner</span>
          </button>

          <button
            onClick={onOpenNewCard}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Virtual Card</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="bg-[#111418] p-12 rounded-2xl border border-[#262B33] text-center space-y-4 max-w-lg mx-auto shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-700/50 text-indigo-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No cards matched your filter</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or issue a new purpose-built virtual card.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => { setFilterType('all'); setSearchQuery(''); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenNewCard}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
            >
              Issue Virtual Card
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => {
            const typeMeta = CARD_TYPES[card.type] || CARD_TYPES.main;
            const spendPercent = Math.min(100, Math.round(((card.currentSpend || 0) / card.monthlyLimit) * 100));

            return (
              <div
                key={card.id}
                className="bg-[#111418] rounded-2xl border border-[#262B33] shadow-lg overflow-hidden flex flex-col justify-between hover:border-slate-700 transition duration-200"
              >
                {/* Card Header Info */}
                <div className="p-4 border-b border-[#262B33] flex items-center justify-between bg-[#161B22]">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="font-bold text-white text-sm truncate">{card.label}</span>
                    <Badge variant={typeMeta.color}>{typeMeta.name}</Badge>
                  </div>

                  <span className="font-mono text-xs font-black text-slate-400 shrink-0">
                    {card.brand}
                  </span>
                </div>

                {/* Card Canvas Visual */}
                <div className="p-4">
                  <CardPreview card={card} size="compact" />

                  {/* Spend Progress Bar */}
                  <div className="mt-4 p-3 bg-[#161B22] rounded-xl border border-[#262B33] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Monthly Allocation</span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(card.currentSpend || 0)} / {formatCurrency(card.monthlyLimit)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${spendPercent > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${spendPercent}%` }}
                      ></div>
                    </div>

                    {/* Channel Safeguard Pills */}
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-md font-mono ${card.allowOnline ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80' : 'bg-slate-800 text-slate-500'}`}>
                        Online: {card.allowOnline ? 'ON' : 'OFF'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-mono ${card.allowInternational ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80' : 'bg-slate-800 text-slate-500'}`}>
                        Int&apos;l: {card.allowInternational ? 'ON' : 'OFF'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-mono ${card.allowATM ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80' : 'bg-slate-800 text-slate-500'}`}>
                        ATM: {card.allowATM ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-[#161B22] border-t border-[#262B33] flex items-center gap-2">
                  <button
                    onClick={() => onSelectCardDetails(card)}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Controls &amp; Limits</span>
                  </button>

                  <button
                    onClick={() => onCopy(card.cardNumber, 'Card Number')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
                    title="Copy Card Number"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  </button>

                  <button
                    onClick={() => onUpdateCard(card.id, { isLocked: !card.isLocked })}
                    className={`px-3 py-2 font-bold text-xs rounded-xl border transition ${
                      card.isLocked
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-950/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={card.isLocked ? 'Unfreeze Card' : 'Freeze Card'}
                  >
                    {card.isLocked ? <Unlock className="w-3.5 h-3.5 text-rose-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
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
