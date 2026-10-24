import { 
  Sparkles, Repeat, PieChart, Link2, ShieldAlert, Shield, 
  Settings, Clock, ChevronRight, UserCheck, LogOut, CreditCard
} from 'lucide-react';

export default function MobileVaultMenu({
  onNavigateTab,
  openAlertsCount = 0,
  currentUser,
  onGoToAdmin,
  onLogout,
}) {
  const UTILITY_SECTIONS = [
    {
      title: 'Card Studio & Insights',
      items: [
        {
          id: 'customizer',
          label: 'Card Studio',
          description: 'Personalize card themes, textures, and visual presentation',
          icon: Sparkles,
          iconColor: 'text-[#BF5AF2]',
          bgColor: 'bg-[#BF5AF2]/15',
        },
        {
          id: 'subscriptions',
          label: 'Subscriptions',
          description: 'Detect and control recurring billing across all cards',
          icon: Repeat,
          iconColor: 'text-[#0A84FF]',
          bgColor: 'bg-[#0A84FF]/15',
        },
        {
          id: 'spending',
          label: 'Spending Insights',
          description: 'Understand where your money goes across categories and cards',
          icon: PieChart,
          iconColor: 'text-[#34C759]',
          bgColor: 'bg-[#34C759]/15',
        },
      ],
    },
    {
      title: 'Security & Connections',
      items: [
        {
          id: 'connections',
          label: 'Connections',
          description: 'Financial data providers, Open Banking status, and API permissions',
          icon: Link2,
          iconColor: 'text-[#0A84FF]',
          bgColor: 'bg-[#0A84FF]/15',
        },
        {
          id: 'rules',
          label: 'Rules & Limits',
          description: 'Deterministic spending boundaries and interactive simulator',
          icon: Shield,
          iconColor: 'text-[#FF9F0A]',
          bgColor: 'bg-[#FF9F0A]/15',
        },
        {
          id: 'alerts',
          label: 'Security & Risk Alerts',
          description: 'Prioritized threat triage and limit violations',
          icon: ShieldAlert,
          iconColor: 'text-[#FF453A]',
          bgColor: 'bg-[#FF453A]/15',
          badge: openAlertsCount > 0 ? `${openAlertsCount} alerts` : null,
        },
        {
          id: 'activity',
          label: 'Audit Trail',
          description: 'Chronological audit trail of all sensitive operations',
          icon: Clock,
          iconColor: 'text-[#8E8E93]',
          bgColor: 'bg-[#8E8E93]/15',
        },
        {
          id: 'settings',
          label: 'Settings',
          description: 'Account security, active sessions, preferences, and data exports',
          icon: Settings,
          iconColor: 'text-[#8E8E93]',
          bgColor: 'bg-[#8E8E93]/15',
        },
      ],
    },
  ];

  return (
    <div className="p-5 flex flex-col gap-6 pb-12">
      {/* User Profile Card */}
      <div className="p-4 rounded-[14px] bg-[#1C1C1E] border border-[#38383A] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF] font-bold text-sm">
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ME'}
          </div>
          <div>
            <div className="text-sm font-semibold text-[#F5F5F7]">
              {currentUser?.name || 'CardHub User'}
            </div>
            <div className="text-[11px] text-[#8E8E93] font-mono">
              {currentUser?.email || 'user@cardhub.io'}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 rounded-[8px] bg-[#2C2C2E] border border-[#38383A] text-[#FF453A] active:bg-[#FF453A]/10 transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Grouped Navigation Sections */}
      {UTILITY_SECTIONS.map((sec) => (
        <div key={sec.title} className="flex flex-col gap-2">
          <h3 className="text-[11px] font-semibold text-[#8E8E93] uppercase font-mono tracking-wider px-1">
            {sec.title}
          </h3>
          <div className="rounded-[14px] bg-[#1C1C1E] border border-[#38383A] divide-y divide-[#38383A]/60 overflow-hidden shadow-xs">
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className="flex items-center justify-between p-3.5 active:bg-[#2C2C2E] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${item.bgColor} ${item.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#F5F5F7] flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#FF453A] text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8E8E93] truncate mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#8E8E93] shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Admin Switcher */}
      <div className="rounded-[14px] bg-[#1C1C1E] border border-[#38383A] overflow-hidden shadow-xs">
        <div
          onClick={onGoToAdmin}
          className="flex items-center justify-between p-3.5 active:bg-[#2C2C2E] transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#0A84FF]/15 text-[#0A84FF] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#F5F5F7]">Administrator Console</div>
              <div className="text-[10px] text-[#8E8E93]">Switch to system oversight view</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
        </div>
      </div>
    </div>
  );
}
