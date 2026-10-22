import { useState } from 'react';
import { Flame, Shield, Clock, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import Modal from '../ui/Modal';
import { generateCardDetails } from '../../utils/cardGenerator';

export default function BurnerCardModal({ isOpen, onClose, onCardCreated, activeUser }) {
  const [step, setStep] = useState(1); // 1: Config, 2: Review & Issue
  const [label, setLabel] = useState('');
  const [usageType, setUsageType] = useState('single'); // 'single' | 'multi'
  const [duration, setDuration] = useState('24h'); // '1h' | '24h' | '7d' | '30d'
  const [limit, setLimit] = useState('50');
  const [merchantLock, setMerchantLock] = useState('');
  const [brand, setBrand] = useState('VISA');

  const durationLabels = {
    '1h': { text: '1 Hour', ms: 1000 * 60 * 60 },
    '24h': { text: '24 Hours', ms: 1000 * 60 * 60 * 24 },
    '7d': { text: '7 Days', ms: 1000 * 60 * 60 * 24 * 7 },
    '30d': { text: '30 Days', ms: 1000 * 60 * 60 * 24 * 30 },
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    setStep(2);
  };

  const handleConfirmIssue = () => {
    const { cardNumber, cvv, expDate } = generateCardDetails(brand);
    const lifespanMs = durationLabels[duration].ms;
    const expiresAt = Date.now() + lifespanMs;

    const newBurnerCard = {
      id: `card-${Date.now()}`,
      label: label.trim(),
      type: 'burner',
      brand: brand,
      theme: 'rose',
      texture: 'dots',
      isLocked: false,
      isDefault: false,
      monthlyLimit: parseFloat(limit) || 50,
      currentSpend: 0.00,
      perTxLimit: parseFloat(limit) || 50,
      allowOnline: true,
      allowATM: false,
      allowInternational: false,
      isBurner: true,
      singleUse: usageType === 'single',
      isBurned: false,
      expiresAt: expiresAt,
      purposeTag: merchantLock || 'Single checkout protection',
      firstName: activeUser?.firstName || 'Muhammad',
      lastName: activeUser?.lastName || 'Kamran',
      currentAddress: activeUser?.currentAddress || '123 Main Street, Gulshan-e-Iqbal',
      cityState: activeUser?.cityState || 'Karachi, Sindh, Pakistan',
      zipCode: activeUser?.zipCode || '75300',
      phoneNumber: activeUser?.phoneNumber || '+92 300 1234567',
      secondaryPhone: activeUser?.secondaryPhone || '+92 321 7654321',
      cardNumber: cardNumber,
      cvv: cvv,
      expDate: expDate,
      cardHolderName: `${(activeUser?.firstName || 'MUHAMMAD').toUpperCase()} ${(activeUser?.lastName || 'KAMRAN').toUpperCase()}`,
      createdAt: Date.now(),
    };

    onCardCreated(newBurnerCard);
    setStep(1);
    setLabel('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setStep(1); onClose(); }}
      title={step === 1 ? "Issue Disposable Burner Card" : "Review & Activate Burner Token"}
      subtitle={step === 1 ? "Create an isolated, temporary virtual card that self-destructs after use." : "Inspect precise authorization safeguards before token issuance."}
      icon={Flame}
      maxWidth="max-w-lg"
    >
      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-5 text-xs text-slate-200">
          <div>
            <label className="block font-bold text-slate-200 mb-1.5">
              Card Purpose / Nickname <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Free Trial Protection, Subscriptions, One-Time Checkout"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-[#262B33] rounded-xl text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-200 mb-1.5">Usage Mode</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUsageType('single')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  usageType === 'single'
                    ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500'
                    : 'border-[#262B33] hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">One-Time Use</span>
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <span className="text-[11px] text-slate-400">Auto-destroys immediately after the first transaction.</span>
              </button>

              <button
                type="button"
                onClick={() => setUsageType('multi')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  usageType === 'multi'
                    ? 'border-rose-500 bg-rose-500/10 ring-1 ring-rose-500'
                    : 'border-[#262B33] hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Multi-Use Window</span>
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-[11px] text-slate-400">Allows multiple charges up to the limit until time expires.</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-200 mb-1.5">Lifespan &amp; Expiration</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(durationLabels).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDuration(key)}
                  className={`py-2 px-1 rounded-xl font-bold border text-center transition ${
                    duration === key
                      ? 'border-rose-500 bg-rose-500/20 text-rose-300 ring-1 ring-rose-500'
                      : 'border-[#262B33] bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-200 mb-1.5">Maximum Spend Limit ($)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['25', '50', '100', '250'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLimit(val)}
                  className={`py-2 rounded-xl font-bold border transition ${
                    limit === val
                      ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                      : 'border-[#262B33] bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
              <input
                type="number"
                min="5"
                max="1000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-[#262B33] rounded-xl font-bold text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-200 mb-1.5">Merchant Restriction (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Only accept Figma.com charges"
              value={merchantLock}
              onChange={(e) => setMerchantLock(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-[#262B33] rounded-xl text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2"
            >
              <span>Review Guardrails</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5 text-xs text-slate-200">
          <div className="p-4 bg-rose-950/30 border border-rose-900/40 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>Isolated Burner Guardrails</span>
            </div>
            
            <ul className="space-y-2 text-slate-300 text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Spend Cap:</strong> Charges above <strong>${limit}.00</strong> will be automatically declined.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Expiration:</strong> Card expires in <strong>{durationLabels[duration].text}</strong>. Any subsequent recurring charge attempts will be blocked.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Channel Restrictions:</strong> ATM withdrawals and international usage are permanently locked to <strong>OFF</strong>.
                </span>
              </li>
              {merchantLock && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>Locked Purpose:</strong> Restricted to <em>{merchantLock}</em>.
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-[#262B33] flex items-center justify-between text-slate-300">
            <span className="font-medium">Selected Network</span>
            <div className="flex gap-2">
              {['VISA', 'Mastercard'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs border transition ${
                    brand === b ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-[#262B33] font-bold rounded-xl transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmIssue}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Issue Single-Use Card Now</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
