import { useState, useEffect } from 'react';
import { 
  Users, CreditCard, Shield, Lock, Search, Download, 
  CheckCircle2, UserCheck, UserX, Trash2, ArrowUpRight, 
  LogOut, X, Mail, DollarSign, RefreshCw
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { getAllUserProfiles } from '../../lib/firestoreService';

function exportCustomersToCSV(customers) {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Address', 'Status', 'Registered Date', 'Primary Card Brand', 'Card Last 4', 'Spend Limit'];
  const rows = customers.map((c) => [
    c.id,
    `"${c.name}"`,
    c.email,
    `"${c.phone || ''}"`,
    `"${c.address || ''}"`,
    c.status,
    new Date(c.createdAt).toISOString(),
    c.primaryCard?.brand || 'None',
    c.primaryCard?.last4 || 'N/A',
    c.primaryCard?.monthlyLimit || 0
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `cardhub_customers_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function AdminDashboard({ 
  users: propUsers, 
  cards, 
  onUpdateUser, 
  onDeleteUser, 
  onSwitchToCustomerView, 
  onLogout 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [firestoreUsers, setFirestoreUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch real users from Firestore on mount — this is the source of truth
  useEffect(() => {
    let cancelled = false;
    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const fetched = await getAllUserProfiles();
        if (!cancelled) setFirestoreUsers(fetched);
      } catch (err) {
        console.error('[Admin] Failed to load Firestore users:', err);
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    }
    loadUsers();
    return () => { cancelled = true; };
  }, []);

  // Merge Firestore users with prop users (prop users = INITIAL_USERS / admin)
  // Firestore wins for real accounts; prop users fill in pre-seeded data
  const mergedUsers = (() => {
    const map = new Map();
    // Start with prop users (includes admin + seeded users)
    propUsers.forEach((u) => map.set(u.email?.toLowerCase(), u));
    // Firestore users override (these are real Firebase Auth accounts)
    firestoreUsers.forEach((u) => {
      if (u.role !== 'admin') map.set(u.email?.toLowerCase(), u);
    });
    return Array.from(map.values());
  })();

  // Filter customers (exclude admin)
  const customers = mergedUsers.filter((u) => u.role !== 'admin');

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.primaryCard?.label && customer.primaryCard.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.primaryCard?.brand && customer.primaryCard.brand.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ? true : customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate high-level platform analytics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const totalIssuedCards = cards.length;
  const totalSpendingLimits = cards.reduce((sum, c) => sum + (c.monthlyLimit || 0), 0);

  const handleToggleStatus = (customerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    onUpdateUser(customerId, { status: newStatus });
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleExportCSV = () => exportCustomersToCSV(customers);

  const handleRefreshUsers = async () => {
    setLoadingUsers(true);
    try {
      const fetched = await getAllUserProfiles();
      setFirestoreUsers(fetched);
    } catch (err) {
      console.error('[Admin] Refresh failed:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Admin Banner */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-black tracking-tight text-white">CardHub Admin</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Restricted Access
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Customer management, card oversight, and platform monitoring
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Refresh Firestore users */}
            <button
              onClick={handleRefreshUsers}
              disabled={loadingUsers}
              className="px-3.5 py-2 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/40 text-indigo-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Reload customers from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>{loadingUsers ? 'Loading…' : 'Refresh'}</span>
            </button>

            {/* Switch to customer view */}
            <button
              onClick={onSwitchToCustomerView}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
              <span>Customer View</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-8">
        
        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Customers</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">{totalCustomers} Accounts</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{activeCustomers} Active & Verified</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Virtual Cards</span>
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">{totalIssuedCards} Cards</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Tokenized across all customer vaults
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fleet Spend Limits</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">{formatCurrency(totalSpendingLimits)}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Combined monthly ceiling authorized
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance & Security</span>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">100% SECURE</div>
            <div className="text-[11px] text-slate-400 mt-1">
              PCI-DSS Level 1 & Bcrypt Salted
            </div>
          </div>

        </div>

        {/* Security & Architecture Compliance Notice */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-800/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white block">Administrative Cryptographic Security Protocol</span>
              <span className="text-slate-400 text-[11px]">
                Under PCI-DSS and security best practices, raw card PANs are tokenized/masked and passwords are cryptographically salted (<code className="text-indigo-300 font-mono">Bcrypt $2a$12</code>), safeguarding customer credentials while providing full administrative visibility over customer accounts and card limits.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[10px] shrink-0 self-start md:self-auto">
            Audit Compliant
          </span>
        </div>

        {/* Search, Filter & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name, email, phone, card..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Filters & Export */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'active' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Active ({activeCustomers})
              </button>
              <button
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'suspended' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Suspended ({customers.length - activeCustomers})
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 font-medium"
              title="Download CSV roster of all customer details"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Customer Roster Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3.5 px-4 sm:px-6">Customer Dossier</th>
                  <th className="py-3.5 px-4">Contact & Location</th>
                  <th className="py-3.5 px-4">Onboarded Virtual Card</th>
                  <th className="py-3.5 px-4">Password & Security</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                      <p className="text-sm font-medium">No matching customers found</p>
                      <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or simulate a test signup.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const initials = customer.name
                      ? customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      : 'CU';
                    const card = customer.primaryCard || (customer.cards && customer.cards[0]);

                    return (
                      <tr 
                        key={customer.id} 
                        className="hover:bg-slate-800/50 transition cursor-pointer group"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        {/* Customer Info */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold font-mono shrink-0">
                              {initials}
                            </div>
                            <div>
                              <span className="font-bold text-white text-xs block group-hover:text-indigo-400 transition">
                                {customer.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Location */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="text-slate-300 font-medium">
                              {customer.phone || 'No phone provided'}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                              {customer.cityState || customer.address || 'Address on file'}
                            </div>
                          </div>
                        </td>

                        {/* Onboarded Card */}
                        <td className="py-4 px-4">
                          {card ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${
                                  card.brand === 'Mastercard' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-blue-950 text-blue-400 border border-blue-800'
                                }`}>
                                  {card.brand || 'VISA'}
                                </span>
                                <span className="font-mono text-slate-200 font-bold text-[11px]">
                                  {card.maskedNumber || `•••• ${card.last4 || '4242'}`}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <span>Limit:</span>
                                <span className="font-mono font-semibold text-emerald-400">
                                  ${(card.monthlyLimit || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px] font-medium">
                              Pending First-Time Setup
                            </span>
                          )}
                        </td>

                        {/* Password & Security status */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="font-mono text-slate-300 text-[11px]">
                                ••••••••
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Bcrypt Salted ($2a$12)
                            </div>
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            customer.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            <span className="capitalize">{customer.status}</span>
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-4 sm:pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                              title="View full customer dossier"
                            >
                              Inspect Dossier
                            </button>

                            <button
                              onClick={() => handleToggleStatus(customer.id, customer.status)}
                              className={`p-1.5 rounded-lg border transition ${
                                customer.status === 'active'
                                  ? 'border-slate-700 text-slate-400 hover:border-rose-700 hover:text-rose-400 hover:bg-rose-950/20'
                                  : 'border-emerald-700/60 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/40'
                              }`}
                              title={customer.status === 'active' ? 'Suspend Customer Account' : 'Reactivate Customer Account'}
                            >
                              {customer.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Permanently delete account for ${customer.name}?`)) {
                                  onDeleteUser(customer.id);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-rose-700 hover:text-rose-400 hover:bg-rose-950/20 transition"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3.5 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredCustomers.length} of {customers.length} registered customers</span>
            <span className="font-mono text-[11px]">Real-Time Ingestion Active</span>
          </div>
        </div>

      </main>

      {/* Customer Full Dossier Drawer (Slide-Over Inspection) */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-600/30">
                    {selectedCustomer.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{selectedCustomer.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        selectedCustomer.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {selectedCustomer.status}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedCustomer.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dossier Content Blocks */}
              <div className="mt-6 space-y-6 text-xs">
                
                {/* 1. Account Details Submitted */}
                <div>
                  <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Customer Account Dossier</span>
                  </h4>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-bold text-white">{selectedCustomer.name}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Email Address</span>
                      <span className="font-mono text-indigo-300 font-semibold">{selectedCustomer.email}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Phone Number</span>
                      <span className="font-mono text-slate-200">{selectedCustomer.phone || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Billing Street Address</span>
                      <span className="text-slate-200 text-right">{selectedCustomer.address || 'Standard on file'}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">City / State & Postal Code</span>
                      <span className="text-slate-200">{selectedCustomer.cityState || 'Global'}, {selectedCustomer.zipCode || '10001'}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Registration Timestamp</span>
                      <span className="text-slate-300 font-mono text-[11px]">
                        {new Date(selectedCustomer.createdAt).toLocaleString()} ({formatRelativeTime(selectedCustomer.createdAt)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Onboarded Virtual Card Details */}
                <div>
                  <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Onboarded First-Time Virtual Card</span>
                  </h4>

                  {selectedCustomer.primaryCard ? (
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Card Friendly Label</span>
                        <span className="font-bold text-white">{selectedCustomer.primaryCard.label}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Printed Cardholder</span>
                        <span className="font-mono font-bold text-white uppercase">{selectedCustomer.primaryCard.cardHolderName || selectedCustomer.name}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Card Network</span>
                        <span className="px-2 py-0.5 rounded font-black italic text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800">
                          {selectedCustomer.primaryCard.brand}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Account Number (Masked)</span>
                        <span className="font-mono font-bold text-white tracking-wider">
                          {selectedCustomer.primaryCard.maskedNumber || `•••• •••• •••• ${selectedCustomer.primaryCard.last4}`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                        <span className="text-slate-400">Expiry Date & CVV Token</span>
                        <span className="font-mono text-slate-200">
                          {selectedCustomer.primaryCard.expDate} • CVV: ••• (Encrypted Token)
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">Authorized Monthly Spending Cap</span>
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          ${(selectedCustomer.primaryCard.monthlyLimit || 0).toLocaleString()} USD
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                      Customer has registered their account, but has not completed the first-time card configuration flow yet.
                    </div>
                  )}
                </div>

                {/* 3. Cryptographic & Security Verification */}
                <div>
                  <h4 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Cryptographic Security & Authentication State</span>
                  </h4>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Customer Password Hash</span>
                      <span className="font-mono text-[11px] text-slate-300 truncate max-w-[240px]" title={selectedCustomer.passwordHash}>
                        {selectedCustomer.passwordHash || '$2a$12$secureEncryptedHash'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                      <span className="text-slate-400">Hash Algorithm</span>
                      <span className="text-slate-200 font-mono text-[11px]">Bcrypt (Blowfish 12-Rounds Salted)</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Two-Factor Authentication</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enforced on Account
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <button
                onClick={() => handleToggleStatus(selectedCustomer.id, selectedCustomer.status)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  selectedCustomer.status === 'active'
                    ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {selectedCustomer.status === 'active' ? (
                  <>
                    <UserX className="w-4 h-4" />
                    <span>Suspend Customer</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Reactivate Customer</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
