import { useState } from 'react';
import { 
  Settings, User, Download, RefreshCw, Database, AlertTriangle 
} from 'lucide-react';
import Badge from '../ui/Badge';
import { SkeletonTable } from '../ui/Skeleton';

export default function SettingsTab({
  settings,
  currentUser,
  onOpenVerifyEmail,
  onUpdateSettings,
  onResetData,
  onExportAllData,
  isLoading = false,
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6">
        <SkeletonTable rows={3} />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 text-[13px] text-[#F5F5F7]">
      {/* 1. Profile Information */}
      <div className="bg-[#1C1C1E] p-6 rounded-[12px] border border-[#38383A] space-y-5">
        <div className="border-b border-[#38383A] pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#F5F5F7] flex items-center gap-2">
              <User className="w-4 h-4 text-[#0A84FF]" />
              <span>Account Profile &amp; Legal Entity</span>
            </h2>
            <p className="text-[12px] text-[#8E8E93] mt-0.5">Primary verified account identity for virtual card issuance.</p>
          </div>

          {currentUser?.emailVerified ? (
            <Badge variant="green" size="sm" dot>
              Verified Account
            </Badge>
          ) : (
            <button
              onClick={onOpenVerifyEmail}
              className="px-3 py-1 rounded-full bg-[#FF9F0A]/15 hover:bg-[#FF9F0A]/25 text-[#FF9F0A] border border-[#FF9F0A]/30 text-[11px] font-medium flex items-center gap-1.5 transition active:scale-[0.98]"
              title="Click to verify your email"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF9F0A]" />
              <span>Verify Email</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-[#2C2C2E] rounded-[8px] border border-[#38383A]">
            <span className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1 tracking-wider">Full Legal Name</span>
            <span className="font-medium text-[#F5F5F7] text-[13px]">{currentUser?.name || 'CardHub User'}</span>
          </div>

          <div className="p-3.5 bg-[#2C2C2E] rounded-[8px] border border-[#38383A] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1 tracking-wider">Authenticated Email</span>
              <span className="font-medium text-[#F5F5F7] text-[13px] font-mono">{currentUser?.email || 'user@example.com'}</span>
            </div>
            {currentUser?.emailVerified ? (
              <span className="text-[10px] text-[#34C759] font-medium bg-[#34C759]/15 border border-[#34C759]/30 px-2 py-0.5 rounded-full">
                Verified
              </span>
            ) : (
              <button
                onClick={onOpenVerifyEmail}
                className="text-[10px] text-[#FF9F0A] font-medium hover:underline bg-[#FF9F0A]/15 border border-[#FF9F0A]/30 px-2 py-0.5 rounded-full"
              >
                Action Req.
              </button>
            )}
          </div>

          <div className="p-3.5 bg-[#2C2C2E] rounded-[8px] border border-[#38383A]">
            <span className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1 tracking-wider">Primary Billing Phone</span>
            <span className="font-medium text-[#F5F5F7] text-[13px]">{currentUser?.phone || '+1 (555) 000-0000'}</span>
          </div>

          <div className="p-3.5 bg-[#2C2C2E] rounded-[8px] border border-[#38383A]">
            <span className="text-[10px] uppercase font-semibold text-[#8E8E93] block mb-1 tracking-wider">Registered Region</span>
            <span className="font-medium text-[#F5F5F7] text-[13px]">{currentUser?.cityState || currentUser?.address || 'Global / USA'}</span>
          </div>
        </div>
      </div>

      {/* 2. Platform Preferences */}
      <div className="bg-[#1C1C1E] p-6 rounded-[12px] border border-[#38383A] space-y-5">
        <div className="border-b border-[#38383A] pb-4">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0A84FF]" />
            <span>Platform Controls &amp; Currency</span>
          </h2>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">Operational defaults for transactions and session life.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-[#8E8E93] mb-1.5 text-[11px] uppercase tracking-wider">Vault Display Currency</label>
            <select
              value={settings.currency || 'USD ($)'}
              onChange={(e) => onUpdateSettings({ currency: e.target.value })}
              className="w-full p-2.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF]"
            >
              <option value="USD ($)">USD ($) - United States Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="GBP (£)">GBP (£) - British Pound</option>
              <option value="PKR (Rs)">PKR (Rs) - Pakistani Rupee</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-[#8E8E93] mb-1.5 text-[11px] uppercase tracking-wider">Idle Inactivity Lockout</label>
            <select
              value={settings.sessionTimeout || '30 mins'}
              onChange={(e) => onUpdateSettings({ sessionTimeout: e.target.value })}
              className="w-full p-2.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF]"
            >
              <option value="15 mins">15 minutes</option>
              <option value="30 mins">30 minutes (Recommended)</option>
              <option value="1 hour">1 hour</option>
              <option value="4 hours">4 hours</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <div className="p-3.5 bg-[#2C2C2E] rounded-[8px] border border-[#38383A] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#F5F5F7] text-[13px]">Email Authorizations Digest</div>
              <div className="text-[12px] text-[#8E8E93]">Send an instant receipt email whenever a virtual card is charged.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => onUpdateSettings({ emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Data & State Management */}
      <div className="bg-[#1C1C1E] p-6 rounded-[12px] border border-[#38383A] space-y-5">
        <div className="border-b border-[#38383A] pb-4">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0A84FF]" />
            <span>Vault Data &amp; State Backup</span>
          </h2>
          <p className="text-[12px] text-[#8E8E93] mt-0.5">
            Export complete cryptographic JSON backups or restore factory prototype demo state.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Backup */}
          <div className="p-4 bg-[#2C2C2E] rounded-[8px] border border-[#38383A] space-y-4 flex flex-col justify-between">
            <div>
              <span className="font-semibold text-[#F5F5F7] text-[13px] block">Export Vault JSON</span>
              <p className="text-[12px] text-[#8E8E93] mt-1 leading-relaxed">
                Save an offline JSON file containing all card tokens, limits, rules, and ledger logs.
              </p>
            </div>
            <button
              onClick={onExportAllData}
              className="py-2 px-3.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium rounded-[8px] transition flex items-center justify-center gap-2 text-[13px]"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Reset Demo */}
          <div className="p-4 bg-[#2C2C2E] rounded-[8px] border border-[#38383A] space-y-4 flex flex-col justify-between">
            <div>
              <span className="font-semibold text-[#F5F5F7] text-[13px] block">Reset Demo State</span>
              <p className="text-[12px] text-[#8E8E93] mt-1 leading-relaxed">
                Purge modified cards and transactions in localStorage and reload fresh prototype seed data.
              </p>
            </div>

            {confirmReset ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { onResetData(); setConfirmReset(false); }}
                  className="flex-1 py-2 bg-[#FF453A] hover:bg-[#D70015] active:scale-[0.98] text-white font-medium rounded-[8px] transition text-[13px]"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="py-2 px-3 bg-[#38383A] hover:bg-[#48484A] active:scale-[0.98] text-[#F5F5F7] font-medium rounded-[8px] transition text-[13px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="py-2 px-3.5 bg-[#38383A]/60 hover:bg-[#FF453A]/15 text-[#8E8E93] hover:text-[#FF453A] border border-[#38383A] hover:border-[#FF453A]/40 font-medium rounded-[8px] transition active:scale-[0.98] flex items-center justify-center gap-2 text-[13px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restore Demo Defaults</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
