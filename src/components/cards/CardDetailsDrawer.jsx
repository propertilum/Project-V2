import { useState } from 'react';
import { 
  Sliders, Lock, Unlock, Eye, EyeOff, Copy, Trash2, Flame, AlertCircle
} from 'lucide-react';
import Modal from '../ui/Modal';
import CardPreview from './CardPreview';
import Badge from '../ui/Badge';
import { CARD_TYPES } from '../../data/constants';
import { formatRelativeTime } from '../../utils/formatters';

export default function CardDetailsDrawer({
  isOpen,
  onClose,
  card,
  onUpdateCard,
  onDeleteCard,
  onCopy,
}) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [labelName, setLabelName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!card) return null;

  const isBankCard = card.source === 'bank_connection';
  const isVirtual = card.source === 'cardhub_issuer';
  const cardType = CARD_TYPES[card.type] || CARD_TYPES.main;

  const handleStartEdit = () => {
    setLabelName(card.label);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (labelName.trim()) {
      onUpdateCard(card.id, { label: labelName.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowSensitive(false);
        setShowCVV(false);
        setConfirmDelete(false);
        onClose();
      }}
      title={card.label}
      subtitle={`${isBankCard ? 'Linked Bank Card' : cardType.name} • ${card.brand} ending in ${card.last4 || (card.cardNumber ? card.cardNumber.slice(-4) : '4242')}`}
      icon={Sliders}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 text-xs">
        {/* Source Badge & Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2">
            <Badge variant={isBankCard ? 'monitoring' : isVirtual ? 'enforced' : 'demo'} size="xs">
              {isBankCard ? 'Linked Bank Card' : isVirtual ? 'CardHub Virtual Issuer' : 'Demo Card'}
            </Badge>
            <span className="text-slate-400 font-mono text-[11px]">
              {card.institution || 'Direct Provider'}
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            {card.lastSyncedAt ? `Synced ${formatRelativeTime(card.lastSyncedAt)}` : 'Live'}
          </span>
        </div>

        {/* Card Canvas */}
        <div className="max-w-sm mx-auto">
          <CardPreview card={card} showNumber={showSensitive} showCVV={showCVV} />
          
          <div className="grid grid-cols-4 gap-2 mt-3">
            <button
              onClick={() => onCopy(card.cardNumber, 'Card Number')}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              {showSensitive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showSensitive ? 'Hide' : 'Reveal'}</span>
            </button>
            <button
              onClick={() => setShowCVV(!showCVV)}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{showCVV ? 'Hide CVV' : 'CVV'}</span>
            </button>

            {/* Freeze button: disabled if bank card */}
            {!isBankCard ? (
              <button
                onClick={() => onUpdateCard(card.id, { isLocked: !card.isLocked })}
                className={`py-2 px-2 font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  card.isLocked
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-slate-800 hover:bg-rose-950/60 text-slate-200 border border-slate-700'
                }`}
              >
                {card.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{card.isLocked ? 'Unfreeze' : 'Freeze'}</span>
              </button>
            ) : (
              <button
                disabled
                title="Bank cards cannot be frozen remotely by CardHub."
                className="py-2 px-2 font-bold rounded-xl bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed flex items-center justify-center gap-1 text-[10px]"
              >
                <Lock className="w-3 h-3 text-slate-600" />
                <span>Bank Freeze N/A</span>
              </button>
            )}
          </div>
        </div>

        {/* Bank Card Notice */}
        {isBankCard && (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong>Bank Card Protection Notice:</strong> CardHub is connected in read-only monitoring mode. If your card is lost or stolen, please freeze it directly in your bank&apos;s mobile app or telephone banking.
            </div>
          </div>
        )}

        {/* Card Name Edit */}
        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex-1 mr-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block font-mono">Card Nickname</span>
            {isEditingName ? (
              <input
                type="text"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
                className="mt-1 w-full p-2 bg-[#161B22] border border-[#262B33] rounded-lg text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            ) : (
              <span className="text-sm font-bold text-white">{card.label}</span>
            )}
          </div>
          <div>
            {isEditingName ? (
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
              >
                Save
              </button>
            ) : (
              <button
                onClick={handleStartEdit}
                className="text-indigo-400 hover:text-indigo-300 font-bold text-xs"
              >
                Rename
              </button>
            )}
          </div>
        </div>

        {/* Spend Boundaries */}
        <div className="space-y-4 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              {isBankCard ? 'Monitoring Alert Threshold' : 'Hardware Spending Boundary'}
            </span>
            <span className="font-mono text-indigo-400 font-bold">${card.monthlyLimit} Monthly</span>
          </div>

          {isBankCard && (
            <div className="text-[10px] text-slate-400 leading-tight">
              Adjusting this sets the threshold for CardHub security alerts. It does not alter your bank&apos;s actual credit line.
            </div>
          )}

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span>Monthly Allocation</span>
              <span className="font-bold text-slate-200">${card.monthlyLimit}</span>
            </div>
            <input
              type="range"
              min="50"
              max="10000"
              step="50"
              value={card.monthlyLimit}
              onChange={(e) => onUpdateCard(card.id, { monthlyLimit: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span>Per-Transaction Max Authorization</span>
              <span className="font-bold text-slate-200">${card.perTxLimit || Math.round(card.monthlyLimit * 0.6)}</span>
            </div>
            <input
              type="range"
              min="10"
              max={card.monthlyLimit}
              step="25"
              value={card.perTxLimit || Math.round(card.monthlyLimit * 0.6)}
              onChange={(e) => onUpdateCard(card.id, { perTxLimit: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Granular Channel Controls */}
        <div className="space-y-3">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block font-mono">
            Channel Safeguards
          </span>

          <div className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Online Payments</div>
              <div className="text-[11px] text-slate-400">Allow this card to be used for web checkouts and API charges.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={card.allowOnline}
                onChange={(e) => onUpdateCard(card.id, { allowOnline: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">International Usage</div>
              <div className="text-[11px] text-slate-400">Enable foreign currency authorizations with 0% FX fees.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={card.allowInternational}
                onChange={(e) => onUpdateCard(card.id, { allowInternational: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="p-3.5 bg-[#161B22] rounded-xl border border-[#262B33] flex items-center justify-between">
            <div>
              <div className="font-bold text-white">ATM &amp; Cash Withdrawals</div>
              <div className="text-[11px] text-slate-400">Allow physical cash withdrawals at ATM terminals.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={card.allowATM}
                onChange={(e) => onUpdateCard(card.id, { allowATM: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Burner / Deletion Actions */}
        <div className="pt-4 border-t border-[#262B33] flex items-center justify-between">
          {card.isBurner ? (
            <button
              onClick={() => onUpdateCard(card.id, { isBurned: true, isLocked: true })}
              disabled={card.isBurned}
              className="py-2.5 px-4 bg-rose-950/30 text-rose-300 hover:bg-rose-950/50 border border-rose-800 font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>{card.isBurned ? 'Token Already Burned' : 'Destroy / Burn Token Now'}</span>
            </button>
          ) : (
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">Permanently delete?</span>
                  <button
                    onClick={() => { onDeleteCard(card.id); onClose(); }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg font-bold border border-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-slate-400 hover:text-rose-400 transition flex items-center gap-1.5 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Terminate Virtual Card</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
