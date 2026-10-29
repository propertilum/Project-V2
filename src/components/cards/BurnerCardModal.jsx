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
      {/* Step Indicator Header */}
      <div className="pb-3 mb-4 border-b border-[#38383A] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#FF453A] text-white flex items-center justify-center text-[10px] font-bold font-mono">
              {step}
            </span>
            <span className="font-semibold text-[#F5F5F7]">
              {step === 1 ? 'Configure Burner Parameters' : 'Authorize & Issue Token'}
            </span>
          </div>
          <span className="text-[#8E8E93] font-mono text-[11px]">
            Step {step} of 2
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className={`h-1.5 rounded-full transition-all duration-300 bg-[#FF453A] ${step === 1 ? 'shadow-[0_0_8px_rgba(255,69,58,0.6)]' : ''}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'bg-[#FF453A] shadow-[0_0_8px_rgba(255,69,58,0.6)]' : 'bg-[#2C2C2E]'}`} />
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleNext} className="space-y-4 text-xs text-[#F5F5F7]">
          <div>
            <label className="block font-medium text-[#8E8E93] mb-1 font-mono uppercase text-[11px]">
              Card Purpose / Nickname <span className="text-[#FF453A]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Free Trial Protection, One-Time Checkout"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[#F5F5F7] focus:outline-none focus:border-[#FF453A]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#8E8E93] mb-1 font-mono uppercase text-[11px]">Usage Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUsageType('single')}
                className={`p-3 rounded-[8px] border text-left transition duration-100 flex flex-col gap-1 ${
                  usageType === 'single'
                    ? 'border-[#FF453A] bg-[#FF453A]/10 ring-1 ring-[#FF453A]'
                    : 'border-[#38383A] hover:border-[#38383A]/80 bg-[#2C2C2E]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F5F5F7]">One-Time Use</span>
                  <Zap className="w-3.5 h-3.5 text-[#FF453A]" />
                </div>
                <span className="text-[11px] text-[#8E8E93]">Auto-destroys immediately after the first transaction.</span>
              </button>

              <button
                type="button"
                onClick={() => setUsageType('multi')}
                className={`p-3 rounded-[8px] border text-left transition duration-100 flex flex-col gap-1 ${
                  usageType === 'multi'
                    ? 'border-[#FF453A] bg-[#FF453A]/10 ring-1 ring-[#FF453A]'
                    : 'border-[#38383A] hover:border-[#38383A]/80 bg-[#2C2C2E]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F5F5F7]">Multi-Use Window</span>
                  <Clock className="w-3.5 h-3.5 text-[#0A84FF]" />
                </div>
                <span className="text-[11px] text-[#8E8E93]">Allows multiple charges up to the limit until time expires.</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#8E8E93] mb-1 font-mono uppercase text-[11px]">Lifespan &amp; Expiration</label>
            <div className="grid grid-cols-2 min-[440px]:grid-cols-4 gap-2">
              {Object.entries(durationLabels).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDuration(key)}
                  className={`py-2 px-1 rounded-[8px] font-medium border text-center transition duration-100 ${
                    duration === key
                      ? 'border-[#FF453A] bg-[#FF453A]/20 text-[#FF453A] ring-1 ring-[#FF453A]'
                      : 'border-[#38383A] bg-[#2C2C2E] text-[#8E8E93] hover:text-[#F5F5F7]'
                  }`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#8E8E93] mb-1 font-mono uppercase text-[11px]">Maximum Spend Limit ($)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['25', '50', '100', '250'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLimit(val)}
                  className={`py-1.5 rounded-[8px] font-medium border transition duration-100 ${
                    limit === val
                      ? 'border-[#FF453A] bg-[#FF453A]/20 text-[#FF453A]'
                      : 'border-[#38383A] bg-[#2C2C2E] text-[#8E8E93] hover:text-[#F5F5F7]'
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-[#8E8E93]">$</span>
              <input
                type="number"
                min="5"
                max="1000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] font-medium text-[#F5F5F7] focus:outline-none focus:border-[#FF453A] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#8E8E93] mb-1 font-mono uppercase text-[11px]">Merchant Restriction (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Only accept Figma.com charges"
              value={merchantLock}
              onChange={(e) => setMerchantLock(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-[8px] text-[#F5F5F7] focus:outline-none focus:border-[#FF453A]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#FF453A] hover:bg-[#E03A30] text-white font-medium rounded-[8px] transition duration-100 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
            >
              <span>Review Guardrails</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-xs text-[#F5F5F7]">
          <div className="p-4 bg-[#FF453A]/10 border border-[#FF453A]/25 rounded-[10px] space-y-2.5">
            <div className="flex items-center gap-2 text-[#FF453A] font-semibold text-sm">
              <Shield className="w-4 h-4" />
              <span>Isolated Burner Guardrails</span>
            </div>
            
            <ul className="space-y-2 text-[#8E8E93] text-[11px]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#34C759] mt-0.5 shrink-0" />
                <span className="text-[#F5F5F7]">
                  <strong>Spend Cap:</strong> Charges above <strong>${limit}.00</strong> will be automatically declined.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#34C759] mt-0.5 shrink-0" />
                <span className="text-[#F5F5F7]">
                  <strong>Expiration:</strong> Card expires in <strong>{durationLabels[duration].text}</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#34C759] mt-0.5 shrink-0" />
                <span className="text-[#F5F5F7]">
                  <strong>Channel Restrictions:</strong> ATM withdrawals and international usage are permanently locked to <strong>OFF</strong>.
                </span>
              </li>
              {merchantLock && (
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#34C759] mt-0.5 shrink-0" />
                  <span className="text-[#F5F5F7]">
                    <strong>Locked Purpose:</strong> Restricted to <em>{merchantLock}</em>.
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between text-[#8E8E93]">
            <span className="font-medium">Selected Network</span>
            <div className="flex gap-2">
              {['VISA', 'Mastercard'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className={`px-3 py-1 rounded-[6px] font-medium text-xs border transition duration-100 ${
                    brand === b ? 'bg-[#0A84FF] text-white border-[#0A84FF]' : 'bg-[#2C2C2E] text-[#8E8E93] border-[#38383A]'
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
              className="py-2 px-3.5 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] border border-[#38383A] font-medium rounded-[8px] transition duration-100 active:scale-[0.98]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmIssue}
              className="flex-1 py-2 bg-[#FF453A] hover:bg-[#E03A30] text-white font-medium rounded-[8px] transition duration-100 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
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
