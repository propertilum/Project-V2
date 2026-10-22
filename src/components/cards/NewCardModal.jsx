import { useState } from 'react';
import {
  CreditCard, ShieldCheck, ArrowRight, ArrowLeft, Check,
  AlertTriangle, Shield
} from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { generateCardDetails } from '../../utils/cardGenerator';

const STEPS = [
  { id: 1, label: 'Purpose' },
  { id: 2, label: 'Merchant' },
  { id: 3, label: 'Controls' },
  { id: 4, label: 'Schedule' },
  { id: 5, label: 'Alerts' },
  { id: 6, label: 'Review' },
];

export default function NewCardModal({ isOpen, onClose, onCardCreated, activeUser }) {
  const [step, setStep] = useState(1);

  // Form State
  const [label, setLabel] = useState('');
  const [purposeCategory, setPurposeCategory] = useState('subscription');
  const [merchantLock, setMerchantLock] = useState('');
  const [isMerchantLocked, setIsMerchantLocked] = useState(false);
  const [brand, setBrand] = useState('VISA');
  const [monthlyLimit, setMonthlyLimit] = useState('500');
  const [perTxLimit, setPerTxLimit] = useState('150');
  const [allowOnline, setAllowOnline] = useState(true);
  const [allowInternational, setAllowInternational] = useState(false);
  const [expiryWindow, setExpiryWindow] = useState('rolling'); // 'rolling', '1_year', 'single_use'
  const [notifyOnHighSpend, setNotifyOnHighSpend] = useState(true);
  const [notifyOnDeclines, setNotifyOnDeclines] = useState(true);

  const resetForm = () => {
    setStep(1);
    setLabel('');
    setMerchantLock('');
    setIsMerchantLocked(false);
    setMonthlyLimit('500');
    setPerTxLimit('150');
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinishCreate = (e) => {
    if (e) e.preventDefault();
    const { cardNumber, last4, expDate } = generateCardDetails(brand);

    const newVirtualCard = {
      id: `card-${Date.now()}`,
      label: label.trim() || `${merchantLock || 'Protection'} Virtual Card`,
      source: 'cardhub_issuer',
      institution: 'CardHub Virtual Issuer',
      type: purposeCategory,
      brand: brand,
      theme: purposeCategory === 'subscription' ? 'emerald' : purposeCategory === 'shopping' ? 'gold' : 'midnight',
      texture: 'waves',
      isLocked: false,
      isDefault: false,
      monthlyLimit: parseFloat(monthlyLimit) || 500,
      currentSpend: 0.00,
      perTxLimit: parseFloat(perTxLimit) || 150,
      allowOnline: allowOnline,
      allowATM: false,
      allowInternational: allowInternational,
      merchantLock: isMerchantLocked && merchantLock.trim() ? merchantLock.trim() : null,
      connectionStatus: 'connected_current',
      lastSyncedAt: Date.now(),
      cardNumber: cardNumber,
      last4: last4,
      cvv: '•••',
      expDate: expDate,
      cardHolderName: `${(activeUser?.firstName || 'MUHAMMAD').toUpperCase()} ${(activeUser?.lastName || 'KAMRAN').toUpperCase()}`,
      createdAt: Date.now(),
      isDemo: true, // Marked transparently as demo object until eligible issuer sandbox is live
    };

    onCardCreated(newVirtualCard);
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title="Create Purpose-Specific Virtual Card"
      subtitle="Follow the 6-step wizard to configure hardware-enforced limits and merchant locks."
      icon={CreditCard}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-xs">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                  step === s.id
                    ? 'bg-indigo-600 text-white font-bold'
                    : step > s.id
                      ? 'bg-slate-800 text-emerald-400 font-medium'
                      : 'text-slate-500'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                  {step > s.id ? <Check className="w-2.5 h-2.5" /> : s.id}
                </span>
                <span className="hidden sm:inline text-[11px]">{s.label}</span>
              </div>
            ))}
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            Step {step} of 6
          </span>
        </div>

        {/* Step 1: Purpose */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                What is this virtual card for?
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Netflix Subscription, Amazon Shopping, AWS Billing"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-2">
                Card Purpose Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'subscription', label: 'Subscription / SaaS', desc: 'Recurring billings' },
                  { id: 'shopping', label: 'E-Commerce Retail', desc: 'Online checkouts' },
                  { id: 'travel', label: 'Travel & Airlines', desc: 'Hotel and flights' },
                  { id: 'burner', label: 'Free Trial Burner', desc: 'Single-use security' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPurposeCategory(item.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      purposeCategory === item.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-200">{item.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Payment Network</label>
              <div className="grid grid-cols-3 gap-2">
                {['VISA', 'Mastercard', 'AMEX'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    className={`py-2 rounded-xl font-bold border transition text-center ${
                      brand === b
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Merchant Lock */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMerchantLocked}
                  onChange={(e) => setIsMerchantLocked(e.target.checked)}
                  className="w-4 h-4 rounded mt-0.5 bg-slate-900 border-slate-700 text-indigo-600"
                />
                <div>
                  <span className="font-bold text-white block">
                    Enable Merchant Lock
                  </span>
                  <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">
                    Locks this virtual card strictly to one merchant name. Authorizations from any other merchant will be declined automatically at the gateway.
                  </span>
                </div>
              </label>

              {isMerchantLocked && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <label className="block font-bold text-slate-300 mb-1">
                    Allowed Merchant Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Netflix, Spotify, Amazon, Figma"
                    value={merchantLock}
                    onChange={(e) => setMerchantLock(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-indigo-300 mt-1.5 flex items-center gap-1 font-mono">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Any charge not matching &quot;{merchantLock || 'Merchant'}&quot; will be hard-declined.</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Spending Controls */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Monthly Budget Cap ($)
                </label>
                <input
                  type="number"
                  step="10"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Hard ceiling for cumulative monthly transactions.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Max Per-Transaction Cap ($)
                </label>
                <input
                  type="number"
                  step="5"
                  value={perTxLimit}
                  onChange={(e) => setPerTxLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Individual swipes above this amount are blocked.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-300 mb-2">Channel Controls</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-slate-300">Allow Online E-Commerce</span>
                  <input
                    type="checkbox"
                    checked={allowOnline}
                    onChange={(e) => setAllowOnline(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                </label>
                <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-slate-300">Allow International Currency</span>
                  <input
                    type="checkbox"
                    checked={allowInternational}
                    onChange={(e) => setAllowInternational(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 h-4 w-4"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Expiration & Schedule */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block font-bold text-slate-300">
              Card Lifetime &amp; Expiration Policy
            </label>
            <div className="space-y-2">
              {[
                { id: 'rolling', title: 'Standard Multi-Year Virtual Card', desc: 'Valid for 3 years. Renews rolling monthly limits.' },
                { id: '1_year', title: '1-Year Project Card', desc: 'Automatically deactivates after 12 calendar months.' },
                { id: 'single_use', title: 'Single-Use Burner Card', desc: 'Auto-depletes and freezes permanently after the first charge clears.' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    expiryWindow === opt.id
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="expiryWindow"
                    checked={expiryWindow === opt.id}
                    onChange={() => setExpiryWindow(opt.id)}
                    className="mt-0.5 text-indigo-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-slate-200 block">{opt.title}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Notifications */}
        {step === 5 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block font-bold text-slate-300">
              Notification &amp; Anomaly Preferences
            </label>
            <div className="space-y-2.5">
              <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">Instant Transaction Alerts</span>
                  <span className="text-[11px] text-slate-500">Notify immediately when an authorization occurs</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnHighSpend}
                  onChange={(e) => setNotifyOnHighSpend(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 h-4 w-4"
                />
              </label>

              <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-200 block">Declined Attempt Alerts</span>
                  <span className="text-[11px] text-slate-500">Notify if a merchant tries to over-bill or violate rules</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOnDeclines}
                  onChange={(e) => setNotifyOnDeclines(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 h-4 w-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 6: Review & Plain Language Summary */}
        {step === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Card Configuration Summary</span>
                <Badge variant="demo" size="xs">Simulation Ready</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Card Label</span>
                  <span className="text-slate-200 font-bold">{label || 'Virtual Protection Card'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Network</span>
                  <span className="text-slate-200 font-mono">{brand}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Monthly Budget</span>
                  <span className="text-slate-200 font-mono">${monthlyLimit} / month</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Per-Transaction Limit</span>
                  <span className="text-slate-200 font-mono">${perTxLimit} max</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Merchant Restriction</span>
                  <span className="text-slate-200 font-mono">
                    {isMerchantLocked && merchantLock ? `Strictly "${merchantLock}"` : 'Open to all valid merchants'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Lifetime Policy</span>
                  <span className="text-slate-200 font-mono">{expiryWindow}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 space-y-1">
                <div className="font-bold">What will be enforced:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
                  <li>Transactions over ${perTxLimit} will be automatically declined.</li>
                  {isMerchantLocked && merchantLock && (
                    <li>Charges from merchants other than &quot;{merchantLock}&quot; will be declined.</li>
                  )}
                  <li>Cumulative spending will not exceed ${monthlyLimit} this calendar month.</li>
                </ul>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-800/80 pt-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Demo notice: This card is created in the CardHub Simulation Sandbox. It cannot be used at real point-of-sale terminals until an issuing partner is active.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={handleBack}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="success"
              size="sm"
              icon={ShieldCheck}
              onClick={handleFinishCreate}
            >
              Issue Virtual Card
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
