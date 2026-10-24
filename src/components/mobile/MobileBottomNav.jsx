import { CreditCard, DollarSign, Shield, Layers } from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  onNavigateTab,
  openAlertsCount = 0,
}) {
  const isWalletActive = activeTab === 'overview' || activeTab === 'my-cards' || activeTab === 'virtual-cards';
  const isActivityActive = activeTab === 'transactions';
  const isShieldActive = activeTab === 'rules' || activeTab === 'alerts' || activeTab === 'security';
  const isVaultActive = !isWalletActive && !isActivityActive && !isShieldActive;

  const NAV_ITEMS = [
    {
      id: 'wallet',
      label: 'Wallet',
      icon: CreditCard,
      isActive: isWalletActive,
      onClick: () => onNavigateTab('overview'),
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: DollarSign,
      isActive: isActivityActive,
      onClick: () => onNavigateTab('transactions'),
    },
    {
      id: 'shield',
      label: 'Shield',
      icon: Shield,
      isActive: isShieldActive,
      badge: openAlertsCount > 0 ? openAlertsCount : null,
      onClick: () => onNavigateTab(openAlertsCount > 0 ? 'alerts' : 'rules'),
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: Layers,
      isActive: isVaultActive,
      onClick: () => onNavigateTab('vault-menu'),
    },
  ];

  return (
    <nav
      className="w-full bg-[#1C1C1E]/95 backdrop-blur-2xl border-t border-[#38383A] px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] select-none"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-[10px] transition-all duration-150 active:scale-[0.92] ${
                active ? 'text-[#0A84FF]' : 'text-[#8E8E93] hover:text-[#F5F5F7]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#FF453A] text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium tracking-tight mt-1 ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute -bottom-1 w-4 h-0.5 bg-[#0A84FF] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
