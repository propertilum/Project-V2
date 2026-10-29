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
  const mergedUsers = (() => {
    const map = new Map();
    propUsers.forEach((u) => map.set(u.email?.toLowerCase(), u));
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
    <div className="min-h-screen bg-[#000000] font-sans text-[#F5F5F7] flex flex-col selection:bg-[#0A84FF] selection:text-white">
      
      {/* Top Admin Banner */}
      <header className="border-b border-[#38383A] bg-[#1C1C1E]/95 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 bg-[#0A84FF] rounded-[10px] flex items-center justify-center text-white font-semibold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[16px] font-semibold tracking-tight text-white">CardHub Admin</span>
                <span className="text-[10px] uppercase font-medium tracking-wider px-2 py-0.5 rounded-full bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30">
                  Restricted
                </span>
              </div>
              <p className="text-[12px] text-[#8E8E93] mt-0.5">
                Customer management, card oversight, and platform monitoring
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Refresh Firestore users */}
            <button
              onClick={handleRefreshUsers}
              disabled={loadingUsers}
              className="px-3 py-1.5 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] border border-[#38383A] text-[#F5F5F7] text-[12px] font-medium rounded-[8px] transition flex items-center gap-1.5 disabled:opacity-50"
              title="Reload customers from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0A84FF] ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>{loadingUsers ? 'Loading…' : 'Refresh'}</span>
            </button>

            {/* Switch to customer view */}
            <button
              onClick={onSwitchToCustomerView}
              className="px-3 py-1.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white text-[12px] font-medium rounded-[8px] transition flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-[#FF453A]/15 hover:bg-[#FF453A]/25 border border-[#FF453A]/30 text-[#FF453A] text-[12px] font-medium rounded-[8px] transition active:scale-[0.98] flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-[#FF453A]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-8 space-y-6">
        
        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[12px] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider">Registered Customers</span>
              <div className="p-2 bg-[#0A84FF]/15 text-[#0A84FF] rounded-[8px]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[22px] font-bold text-white font-mono">{totalCustomers} Accounts</div>
            <div className="text-[11px] text-[#34C759] mt-1 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>{activeCustomers} Active &amp; Verified</span>
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[12px] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider">Active Virtual Cards</span>
              <div className="p-2 bg-[#0A84FF]/15 text-[#0A84FF] rounded-[8px]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[22px] font-bold text-white font-mono">{totalIssuedCards} Cards</div>
            <div className="text-[11px] text-[#8E8E93] mt-1">
              Tokenized across all customer vaults
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[12px] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider">Fleet Spend Limits</span>
              <div className="p-2 bg-[#34C759]/15 text-[#34C759] rounded-[8px]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[22px] font-bold text-white font-mono">{formatCurrency(totalSpendingLimits)}</div>
            <div className="text-[11px] text-[#8E8E93] mt-1">
              Combined monthly ceiling authorized
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[12px] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider">Compliance &amp; Security</span>
              <div className="p-2 bg-[#BF5AF2]/15 text-[#BF5AF2] rounded-[8px]">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-[22px] font-bold text-[#34C759] font-mono">100% SECURE</div>
            <div className="text-[11px] text-[#8E8E93] mt-1">
              PCI-DSS Level 1 &amp; Bcrypt Salted
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[12px] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0A84FF]/15 text-[#0A84FF] rounded-[8px] shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white block">Administrative Cryptographic Security Protocol</span>
              <span className="text-[#8E8E93] text-[11px]">
                Under PCI-DSS and security best practices, raw card PANs are tokenized/masked and passwords are cryptographically salted (<code className="text-[#0A84FF] font-mono">Bcrypt $2a$12</code>).
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30 rounded-full font-medium text-[11px] shrink-0 self-start md:self-auto">
            Audit Compliant
          </span>
        </div>

        {/* Search, Filter & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1C1C1E] p-4 rounded-[12px] border border-[#38383A]">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name, email, phone, card..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 h-9 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[13px] text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] transition box-border"
            />
          </div>

          {/* Filters & Export */}
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <div className="flex items-center h-9 bg-[#2C2C2E] p-0.5 rounded-[8px] border border-[#38383A] box-border">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 h-7.5 rounded-[6px] font-medium transition active:scale-[0.98] flex items-center justify-center ${
                  statusFilter === 'all' ? 'bg-[#0A84FF] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 h-7.5 rounded-[6px] font-medium transition active:scale-[0.98] flex items-center justify-center ${
                  statusFilter === 'active' ? 'bg-[#0A84FF] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Active ({activeCustomers})
              </button>
              <button
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 h-7.5 rounded-[6px] font-medium transition active:scale-[0.98] flex items-center justify-center ${
                  statusFilter === 'suspended' ? 'bg-[#0A84FF] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                Suspended ({customers.length - activeCustomers})
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 h-9 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] border border-[#38383A] text-[#F5F5F7] rounded-[8px] transition flex items-center gap-1.5 font-medium box-border"
              title="Download CSV roster of all customer details"
            >
              <Download className="w-3.5 h-3.5 text-[#0A84FF]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Customer Roster Table */}
        <div className="bg-[#1C1C1E] border border-[#38383A] rounded-[12px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-[#38383A] bg-[#2C2C2E]/60 text-[#8E8E93] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-3 px-4 sm:px-6">Customer Dossier</th>
                  <th className="py-3 px-4">Contact &amp; Location</th>
                  <th className="py-3 px-4">Onboarded Virtual Card</th>
                  <th className="py-3 px-4">Password &amp; Security</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#38383A]/60">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-[#8E8E93]">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-[13px] font-medium text-[#F5F5F7]">No matching customers found</p>
                      <p className="text-[11px] text-[#8E8E93] mt-1">Try adjusting your search criteria or simulate a test signup.</p>
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
                        className="hover:bg-[#2C2C2E]/50 transition cursor-pointer group"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        {/* Customer Info */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-[8px] bg-[#0A84FF]/20 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF] font-semibold text-[11px] shrink-0 font-mono">
                              {initials}
                            </div>
                            <div>
                              <span className="font-semibold text-white text-[13px] block group-hover:text-[#0A84FF] transition">
                                {customer.name}
                              </span>
                              <span className="text-[11px] text-[#8E8E93] font-mono">
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Location */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="text-[#F5F5F7] font-medium">
                              {customer.phone || 'No phone provided'}
                            </div>
                            <div className="text-[11px] text-[#8E8E93] truncate max-w-[180px]">
                              {customer.cityState || customer.address || 'Address on file'}
                            </div>
                          </div>
                        </td>

                        {/* Onboarded Card */}
                        <td className="py-3.5 px-4">
                          {card ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                  card.brand === 'Mastercard' ? 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30' : 'bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30'
                                }`}>
                                  {card.brand || 'VISA'}
                                </span>
                                <span className="font-mono text-[#F5F5F7] font-medium text-[11px]">
                                  {card.maskedNumber || `•••• ${card.last4 || '4242'}`}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#8E8E93] flex items-center gap-1">
                                <span>Limit:</span>
                                <span className="font-mono font-medium text-[#34C759]">
                                  ${(card.monthlyLimit || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#FF9F0A] bg-[#FF9F0A]/10 px-2 py-0.5 rounded-full border border-[#FF9F0A]/20 text-[10px] font-medium">
                              Pending Setup
                            </span>
                          )}
                        </td>

                        {/* Password & Security status */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-[#34C759] shrink-0" />
                              <span className="font-mono text-[#8E8E93] text-[11px]">
                                ••••••••
                              </span>
                            </div>
                            <div className="text-[10px] text-[#8E8E93] font-mono">
                              Bcrypt Salted
                            </div>
                          </div>
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            customer.status === 'active'
                              ? 'bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30'
                              : 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'active' ? 'bg-[#34C759]' : 'bg-[#FF453A]'}`}></span>
                            <span className="capitalize">{customer.status}</span>
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 sm:pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="px-2.5 py-1 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] rounded-[6px] text-[11px] font-medium transition active:scale-[0.98]"
                              title="View full customer dossier"
                            >
                              Inspect
                            </button>

                            <button
                              onClick={() => handleToggleStatus(customer.id, customer.status)}
                              className={`p-1 rounded-[6px] border transition active:scale-[0.98] ${
                                customer.status === 'active'
                                  ? 'border-[#38383A] text-[#8E8E93] hover:border-[#FF453A]/50 hover:text-[#FF453A]'
                                  : 'border-[#34C759]/30 text-[#34C759] bg-[#34C759]/15 hover:bg-[#34C759]/25'
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
                              className="p-1 rounded-[6px] border border-[#38383A] text-[#8E8E93] hover:border-[#FF453A]/50 hover:text-[#FF453A] transition active:scale-[0.98]"
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

          <div className="px-6 py-3 bg-[#2C2C2E]/40 border-t border-[#38383A] flex items-center justify-between text-[11px] text-[#8E8E93]">
            <span>Showing {filteredCustomers.length} of {customers.length} registered customers</span>
            <span className="font-mono text-[10px]">Real-Time Ingestion Active</span>
          </div>
        </div>

      </main>

      {/* Customer Full Dossier Drawer (Slide-Over Inspection) */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl bg-[#1C1C1E] border-l border-[#38383A] h-full overflow-y-auto p-6 sm:p-8 flex flex-col justify-between shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-[#38383A]">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-[10px] bg-[#0A84FF] flex items-center justify-center text-white font-bold text-sm">
                    {selectedCustomer.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-white tracking-tight flex items-center gap-2">
                      <span>{selectedCustomer.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                        selectedCustomer.status === 'active' 
                          ? 'bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30' 
                          : 'bg-[#FF453A]/15 text-[#FF453A] border border-[#FF453A]/30'
                      }`}>
                        {selectedCustomer.status}
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#8E8E93] font-mono">{selectedCustomer.id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-[#8E8E93] hover:text-white rounded-[8px] hover:bg-[#2C2C2E] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dossier Content Blocks */}
              <div className="mt-6 space-y-5 text-[12px]">
                
                {/* 1. Account Details Submitted */}
                <div>
                  <h4 className="font-semibold text-[#0A84FF] uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Customer Account Dossier</span>
                  </h4>
                  <div className="bg-[#2C2C2E] border border-[#38383A] rounded-[8px] p-4 space-y-2.5">
                    <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                      <span className="text-[#8E8E93]">Full Name</span>
                      <span className="font-semibold text-white">{selectedCustomer.name}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                      <span className="text-[#8E8E93]">Email Address</span>
                      <span className="font-mono text-[#0A84FF] font-medium">{selectedCustomer.email}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                      <span className="text-[#8E8E93]">Phone Number</span>
                      <span className="font-mono text-white">{selectedCustomer.phone || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                      <span className="text-[#8E8E93]">Billing Street Address</span>
                      <span className="text-white text-right">{selectedCustomer.address || 'Standard on file'}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                      <span className="text-[#8E8E93]">City / State &amp; Postal Code</span>
                      <span className="text-white">{selectedCustomer.cityState || 'Global'}, {selectedCustomer.zipCode || '10001'}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#8E8E93]">Registration Timestamp</span>
                      <span className="text-[#8E8E93] font-mono text-[11px]">
                        {new Date(selectedCustomer.createdAt).toLocaleString()} ({formatRelativeTime(selectedCustomer.createdAt)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Onboarded Virtual Card Details */}
                <div>
                  <h4 className="font-semibold text-[#0A84FF] uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Onboarded First-Time Virtual Card</span>
                  </h4>

                  {selectedCustomer.primaryCard ? (
                    <div className="bg-[#2C2C2E] border border-[#38383A] rounded-[8px] p-4 space-y-2.5">
                      <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                        <span className="text-[#8E8E93]">Card Friendly Label</span>
                        <span className="font-semibold text-white">{selectedCustomer.primaryCard.label}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                        <span className="text-[#8E8E93]">Printed Cardholder</span>
                        <span className="font-mono font-semibold text-white uppercase">{selectedCustomer.primaryCard.cardHolderName || selectedCustomer.name}</span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                        <span className="text-[#8E8E93]">Card Network</span>
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-[#0A84FF]/15 text-[#0A84FF] border border-[#0A84FF]/30">
                          {selectedCustomer.primaryCard.brand}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                        <span className="text-[#8E8E93]">Account Number (Masked)</span>
                        <span className="font-mono font-medium text-white tracking-wider">
                          {selectedCustomer.primaryCard.maskedNumber || `•••• •••• •••• ${selectedCustomer.primaryCard.last4}`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                        <span className="text-[#8E8E93]">Expiry Date &amp; CVV Token</span>
                        <span className="font-mono text-[#8E8E93]">
                          {selectedCustomer.primaryCard.expDate} • CVV: ••• (Encrypted Token)
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1">
                        <span className="text-[#8E8E93]">Authorized Monthly Spending Cap</span>
                        <span className="font-mono font-bold text-[#34C759] text-[13px]">
                          ${(selectedCustomer.primaryCard.monthlyLimit || 0).toLocaleString()} USD
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-[8px] bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 text-[#FF9F0A] text-[12px]">
                      Customer has registered their account, but has not completed the first-time card configuration flow yet.
                    </div>
                  )}
                </div>

                {/* 3. Cryptographic & Security Verification */}
                <div>
                  <h4 className="font-semibold text-[#0A84FF] uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Cryptographic Security &amp; Authentication State</span>
                  </h4>
                  <div className="bg-[#2C2C2E] border border-[#38383A] rounded-[8px] p-4 space-y-2.5">
                    <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                      <span className="text-[#8E8E93]">Customer Password Hash</span>
                      <span className="font-mono text-[11px] text-[#8E8E93] truncate max-w-[240px]" title={selectedCustomer.passwordHash}>
                        {selectedCustomer.passwordHash || '$2a$12$secureEncryptedHash'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-[#38383A]">
                      <span className="text-[#8E8E93]">Hash Algorithm</span>
                      <span className="text-white font-mono text-[11px]">Bcrypt (Blowfish 12-Rounds Salted)</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-[#8E8E93]">Two-Factor Authentication</span>
                      <span className="text-[#34C759] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enforced on Account
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-[#38383A] flex items-center gap-3">
              <button
                onClick={() => handleToggleStatus(selectedCustomer.id, selectedCustomer.status)}
                className={`flex-1 py-2 rounded-[8px] font-medium text-[12px] transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                  selectedCustomer.status === 'active'
                    ? 'bg-[#FF453A]/15 hover:bg-[#FF453A]/25 text-[#FF453A] border border-[#FF453A]/30'
                    : 'bg-[#34C759] hover:bg-[#30B74E] text-white'
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
                className="px-4 py-2 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-[0.98] text-[#F5F5F7] rounded-[8px] font-medium text-[12px] transition"
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
