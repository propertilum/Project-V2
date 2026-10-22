import { useState } from 'react';
import { 
  Settings, User, Download, RefreshCw, Database, CheckCircle2, AlertTriangle 
} from 'lucide-react';

export default function SettingsTab({
  settings,
  currentUser,
  onOpenVerifyEmail,
  onUpdateSettings,
  onResetData,
  onExportAllData,
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="max-w-4xl space-y-6 text-xs text-slate-200">
      {/* 1. Profile Information */}
      <div className="bg-[#111418] p-6 md:p-8 rounded-2xl border border-[#262B33] shadow-lg space-y-6">
        <div className="border-b border-[#262B33] pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Account Profile &amp; Legal Entity</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Primary verified account identity for virtual card issuance.</p>
          </div>

          {currentUser?.emailVerified ? (
            <span className="px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-[11px] font-bold flex items-center gap-1.5 shadow-sm font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Account</span>
            </span>
          ) : (
            <button
              onClick={onOpenVerifyEmail}
              className="px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 transition shadow-sm font-mono"
              title="Click to verify your email"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Verify Email</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#161B22] rounded-xl border border-[#262B33]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono tracking-wider">Full Legal Name</span>
            <span className="font-bold text-white text-sm">{currentUser?.name || 'CardHub User'}</span>
          </div>

          <div className="p-4 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono tracking-wider">Authenticated Email</span>
              <span className="font-bold text-white text-sm font-mono">{currentUser?.email || 'user@example.com'}</span>
            </div>
            {currentUser?.emailVerified ? (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                Verified
              </span>
            ) : (
              <button
                onClick={onOpenVerifyEmail}
                className="text-[10px] text-amber-400 font-bold hover:underline bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono"
              >
                Action Req.
              </button>
            )}
          </div>

          <div className="p-4 bg-[#161B22] rounded-xl border border-[#262B33]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono tracking-wider">Primary Billing Phone</span>
            <span className="font-bold text-white text-sm">{currentUser?.phone || '+1 (555) 000-0000'}</span>
          </div>

          <div className="p-4 bg-[#161B22] rounded-xl border border-[#262B33]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono tracking-wider">Registered Region</span>
            <span className="font-bold text-white text-sm">{currentUser?.cityState || currentUser?.address || 'Global / USA'}</span>
          </div>
        </div>
      </div>

      {/* 2. Platform Preferences */}
      <div className="bg-[#111418] p-6 md:p-8 rounded-2xl border border-[#262B33] shadow-lg space-y-6">
        <div className="border-b border-[#262B33] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Platform Controls &amp; Currency</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Operational defaults for transactions and session life.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-300 mb-1.5 font-mono text-[11px] uppercase tracking-wider">Vault Display Currency</label>
            <select
              value={settings.currency || 'USD ($)'}
              onChange={(e) => onUpdateSettings({ currency: e.target.value })}
              className="w-full p-2.5 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="USD ($)">USD ($) - United States Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="GBP (£)">GBP (£) - British Pound</option>
              <option value="PKR (Rs)">PKR (Rs) - Pakistani Rupee</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1.5 font-mono text-[11px] uppercase tracking-wider">Idle Inactivity Lockout</label>
            <select
              value={settings.sessionTimeout || '30 mins'}
              onChange={(e) => onUpdateSettings({ sessionTimeout: e.target.value })}
              className="w-full p-2.5 bg-[#161B22] border border-[#262B33] rounded-xl font-medium text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="15 mins">15 minutes</option>
              <option value="30 mins">30 minutes (Recommended)</option>
              <option value="1 hour">1 hour</option>
              <option value="4 hours">4 hours</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Email Authorizations Digest</div>
              <div className="text-[11px] text-slate-400">Send an instant receipt email whenever a virtual card is charged.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => onUpdateSettings({ emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Data & State Management */}
      <div className="bg-[#111418] p-6 md:p-8 rounded-2xl border border-[#262B33] shadow-lg space-y-6">
        <div className="border-b border-[#262B33] pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Vault Data &amp; State Backup</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export complete cryptographic JSON backups or restore factory prototype demo state.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Backup */}
          <div className="p-5 bg-[#161B22] rounded-xl border border-[#262B33] space-y-4 flex flex-col justify-between">
            <div>
              <span className="font-bold text-white text-sm block">Export Vault JSON</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Save an encrypted offline JSON file containing all card tokens, limits, rules, and ledger logs.
              </p>
            </div>
            <button
              onClick={onExportAllData}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Reset Demo */}
          <div className="p-5 bg-[#161B22] rounded-xl border border-[#262B33] space-y-4 flex flex-col justify-between">
            <div>
              <span className="font-bold text-white text-sm block">Reset Demo State</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Purge modified cards and transactions in localStorage and reload fresh prototype seed data.
              </p>
            </div>

            {confirmReset ? (
              <div className="flex gap-2">
                <button
                  onClick={() => { onResetData(); setConfirmReset(false); }}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="py-2.5 px-4 bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 font-bold rounded-xl transition flex items-center justify-center gap-2"
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
