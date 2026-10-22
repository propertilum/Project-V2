import { useState, useMemo } from 'react';
import { 
  Search, ArrowUpRight, ArrowDownLeft, Download, X,
  Building2, Layers
} from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORIES } from '../../data/constants';

export default function TransactionsTab({
  transactions = [],
  cards = [],
  onSelectTransaction,
  initialFilter = '',
  onFilterCleared,
}) {
  const [search, setSearch] = useState(initialFilter);
  const [prevInitialFilter, setPrevInitialFilter] = useState(initialFilter);
  const [selectedCardId, setSelectedCardId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // React pattern: Adjust state upon prop change without triggering cascading effect renders
  if (initialFilter !== prevInitialFilter) {
    setPrevInitialFilter(initialFilter);
    if (initialFilter) {
      setSearch(initialFilter);
    }
  }

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchMerchant = (t.merchant || '').toLowerCase().includes(q);
          const matchAuth = (t.authCode || '').toLowerCase().includes(q);
          const matchNotes = (t.notes || '').toLowerCase().includes(q);
          if (!matchMerchant && !matchAuth && !matchNotes) return false;
        }

        // Card
        if (selectedCardId !== 'all' && t.cardId !== selectedCardId) return false;

        // Category
        if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;

        // Status
        if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

        // Type
        if (selectedType !== 'all' && t.type !== selectedType) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
        if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0);
        if (sortBy === 'date-asc') return (a.id > b.id ? 1 : -1);
        return (a.id < b.id ? 1 : -1); // default date-desc
      });
  }, [transactions, search, selectedCardId, selectedCategory, selectedStatus, selectedType, sortBy]);

  const totalDebits = filteredTransactions
    .filter((t) => t.type === 'debit' && t.status !== 'declined')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  const totalDeclined = filteredTransactions
    .filter((t) => t.status === 'declined')
    .reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Merchant', 'Card', 'Category', 'Status', 'Type', 'Amount'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      `"${t.merchant}"`,
      `"${t.cardName || ''}"`,
      t.category,
      t.status,
      t.type,
      t.amount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cardhub_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Filtered Outflow Volume
          </span>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatCurrency(totalDebits)}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Cleared and authorized debits</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Protected / Declined Volume
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {formatCurrency(totalDeclined)}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Blocked by spending boundaries</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Matched Records
            </span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {filteredTransactions.length}{' '}
              <span className="text-xs font-normal text-slate-500">/ {transactions.length}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Normalized telemetry events</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 2. Search & Filtering Controls */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, auth code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value && onFilterCleared) onFilterCleared();
              }}
              className="w-full pl-8 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); if (onFilterCleared) onFilterCleared(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Card Filter */}
          <div>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Cards</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} (··{c.last4 || c.cardNumber?.slice(-4) || '4242'})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Settled</option>
              <option value="declined">Declined / Blocked</option>
              <option value="pending">Pending Auth</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="debit">Debits</option>
              <option value="credit">Credits</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Transaction Ledger Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No matching transactions</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No authorizations match the active search and filter parameters.
            </p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => { setSearch(''); setSelectedCardId('all'); setSelectedCategory('All'); setSelectedStatus('all'); }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-5">Merchant / Destination</th>
                  <th className="py-3 px-4">Card Used</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredTransactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  const isDeclined = tx.status === 'declined';
                  const matchedCard = cards.find((c) => c.id === tx.cardId);
                  const isBank = matchedCard?.source === 'bank_connection';

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction?.(tx)}
                      className="hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-5 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            isDeclined
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : isCredit
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-indigo-500/10 text-indigo-400'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className={`font-bold block ${isDeclined ? 'text-rose-300' : 'text-white'}`}>
                            {tx.merchant}
                          </span>
                          {tx.authCode && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Auth: {tx.authCode}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          {isBank ? (
                            <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          ) : (
                            <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          )}
                          <span>{tx.cardName || 'Primary Card'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">{tx.category}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{tx.date}</td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            isDeclined
                              ? 'rose'
                              : tx.status === 'pending'
                                ? 'amber'
                                : 'emerald'
                          }
                          size="xs"
                        >
                          {tx.status}
                        </Badge>
                      </td>

                      <td
                        className={`py-3.5 px-5 text-right font-mono font-bold text-sm ${
                          isDeclined
                            ? 'text-slate-500 line-through'
                            : isCredit
                              ? 'text-emerald-400'
                              : 'text-white'
                        }`}
                      >
                        {isCredit
                          ? `+${formatCurrency(tx.amount)}`
                          : `-${formatCurrency(tx.amount)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
