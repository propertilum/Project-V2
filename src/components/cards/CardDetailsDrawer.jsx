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
      <div className="space-y-5 text-xs">
        {/* Source Badge & Connection Status */}
        <div className="flex flex-wrap items-center justify-between p-3 rounded-[8px] bg-[#2C2C2E]/60 border border-[#38383A] gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <Badge variant={isBankCard ? 'monitoring' : isVirtual ? 'enforced' : 'demo'} size="xs">
              {isBankCard ? 'Linked Bank Card' : isVirtual ? 'CardHub Virtual Issuer' : 'Demo Card'}
            </Badge>
            {card.institution && card.institution !== 'CardHub Virtual Issuer' && (
              <span className="text-[#8E8E93] font-mono text-[11px] truncate">
                {card.institution}
              </span>
            )}
          </div>

          <span className="text-[11px] text-[#8E8E93] font-mono shrink-0">
            {card.lastSyncedAt ? `Synced ${formatRelativeTime(card.lastSyncedAt)}` : 'Live'}
          </span>
        </div>

        {/* Card Canvas */}
        <div className="max-w-md mx-auto">
          <CardPreview card={card} showNumber={showSensitive} showCVV={showCVV} />
          
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-3.5 text-[11px] sm:text-xs">
            <button
              onClick={() => onCopy(card.cardNumber, 'Card Number')}
              className="py-2 px-1 sm:px-2 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => setShowSensitive(!showSensitive)}
              className="py-2 px-1 sm:px-2 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1 sm:gap-1.5"
            >
              {showSensitive ? <EyeOff className="w-3.5 h-3.5 shrink-0" /> : <Eye className="w-3.5 h-3.5 shrink-0" />}
              <span>{showSensitive ? 'Hide' : 'Reveal'}</span>
            </button>
            <button
              onClick={() => setShowCVV(!showCVV)}
              className="py-2 px-1 sm:px-2 bg-[#2C2C2E] hover:bg-[#38383A] text-[#F5F5F7] font-medium rounded-[8px] border border-[#38383A] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#0A84FF] shrink-0" />
              <span>{showCVV ? 'Hide' : 'CVV'}</span>
            </button>

            {/* Freeze button: disabled if bank card */}
            {!isBankCard ? (
              <button
                onClick={() => onUpdateCard(card.id, { isLocked: !card.isLocked })}
                className={`py-2 px-1 sm:px-2 font-medium rounded-[8px] transition duration-100 active:scale-[0.98] flex items-center justify-center gap-1 sm:gap-1.5 ${
                  card.isLocked
                    ? 'bg-[#34C759] text-white hover:bg-[#28B04C]'
                    : 'bg-[#2C2C2E] hover:bg-[#FF453A]/20 text-[#FF453A] border border-[#38383A]'
                }`}
              >
                {card.isLocked ? <Unlock className="w-3.5 h-3.5 shrink-0" /> : <Lock className="w-3.5 h-3.5 shrink-0" />}
                <span>{card.isLocked ? 'Unfreeze' : 'Freeze'}</span>
              </button>
            ) : (
              <button
                disabled
                title="Bank cards cannot be frozen remotely by CardHub."
                className="py-2 px-1 sm:px-2 font-medium rounded-[8px] bg-[#1C1C1E] text-[#636366] border border-[#38383A] cursor-not-allowed flex items-center justify-center gap-1 text-[11px]"
              >
                <Lock className="w-3 h-3 text-[#636366] shrink-0" />
                <span>N/A</span>
              </button>
            )}
          </div>
        </div>

        {/* Bank Card Notice */}
        {isBankCard && (
          <div className="p-3.5 rounded-[8px] bg-[#FF9F0A]/10 border border-[#FF9F0A]/30 text-[#FF9F0A] text-[11px] leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#FF9F0A] mt-0.5" />
            <div>
              <strong>Bank Card Protection Notice:</strong> CardHub is connected in read-only monitoring mode. If your card is lost or stolen, please freeze it directly in your bank&apos;s mobile app or telephone banking.
            </div>
          </div>
        )}

        {/* Card Name Edit */}
        <div className="p-3.5 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between">
          <div className="flex-1 mr-3">
            <span className="text-[10px] text-[#8E8E93] uppercase font-semibold tracking-wider block font-mono">Card Nickname</span>
            {isEditingName ? (
              <input
                type="text"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
                className="mt-1 w-full p-2 bg-[#1C1C1E] border border-[#38383A] rounded-[8px] text-xs font-semibold text-[#F5F5F7] focus:outline-none focus:border-[#0A84FF]"
              />
            ) : (
              <span className="text-sm font-semibold text-[#F5F5F7]">{card.label}</span>
            )}
          </div>
          <div>
            {isEditingName ? (
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 bg-[#0A84FF] hover:bg-[#0077ED] text-white rounded-[8px] font-medium"
              >
                Save
              </button>
            ) : (
              <button
                onClick={handleStartEdit}
                className="text-[#0A84FF] hover:underline font-medium text-xs"
              >
                Rename
              </button>
            )}
          </div>
        </div>

        {/* Spend Boundaries */}
        <div className="space-y-4 p-4 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A]">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#F5F5F7] uppercase tracking-wider text-[11px] font-mono">
              {isBankCard ? 'Monitoring Alert Threshold' : 'Hardware Spending Boundary'}
            </span>
            <span className="font-mono text-[#0A84FF] font-semibold">${card.monthlyLimit} Monthly</span>
          </div>

          {isBankCard && (
            <div className="text-[10px] text-[#8E8E93] leading-tight">
              Adjusting this sets the threshold for CardHub security alerts. It does not alter your bank&apos;s actual credit line.
            </div>
          )}

          <div>
            <div className="flex justify-between text-[#8E8E93] mb-1 text-[11px]">
              <span>Monthly Allocation</span>
              <span className="font-semibold text-[#F5F5F7] font-mono">${card.monthlyLimit}</span>
            </div>
            <input
              type="range"
              min="50"
              max="10000"
              step="50"
              value={card.monthlyLimit}
              onChange={(e) => onUpdateCard(card.id, { monthlyLimit: parseFloat(e.target.value) })}
              className="w-full accent-[#0A84FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[#8E8E93] mb-1 text-[11px]">
              <span>Per-Transaction Max Authorization</span>
              <span className="font-semibold text-[#F5F5F7] font-mono">${card.perTxLimit || Math.round(card.monthlyLimit * 0.6)}</span>
            </div>
            <input
              type="range"
              min="10"
              max={card.monthlyLimit}
              step="25"
              value={card.perTxLimit || Math.round(card.monthlyLimit * 0.6)}
              onChange={(e) => onUpdateCard(card.id, { perTxLimit: parseFloat(e.target.value) })}
              className="w-full accent-[#0A84FF] cursor-pointer"
            />
          </div>
        </div>

        {/* Granular Channel Controls */}
        <div className="space-y-2.5">
          <span className="font-semibold text-[#8E8E93] uppercase tracking-wider text-[11px] block font-mono">
            Channel Safeguards
          </span>

          <div className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between">
            <div>
              <div className="font-medium text-[#F5F5F7]">Online Payments</div>
              <div className="text-[11px] text-[#8E8E93]">Allow this card to be used for web checkouts and API charges.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={card.allowOnline}
                onChange={(e) => onUpdateCard(card.id, { allowOnline: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A84FF]"></div>
            </label>
          </div>

          <div className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between">
            <div>
              <div className="font-medium text-[#F5F5F7]">International Usage</div>
              <div className="text-[11px] text-[#8E8E93]">Enable foreign currency authorizations with 0% FX fees.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={card.allowInternational}
                onChange={(e) => onUpdateCard(card.id, { allowInternational: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A84FF]"></div>
            </label>
          </div>

          <div className="p-3 bg-[#2C2C2E]/60 rounded-[8px] border border-[#38383A] flex items-center justify-between">
            <div>
              <div className="font-medium text-[#F5F5F7]">ATM &amp; Cash Withdrawals</div>
              <div className="text-[11px] text-[#8E8E93]">Allow physical cash withdrawals at ATM terminals.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={card.allowATM}
                onChange={(e) => onUpdateCard(card.id, { allowATM: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#38383A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0A84FF]"></div>
            </label>
          </div>
        </div>

        {/* Burner / Deletion Actions */}
        <div className="pt-4 border-t border-[#38383A] flex flex-wrap items-center justify-between gap-3">
          {card.isBurner ? (
            <button
              onClick={() => onUpdateCard(card.id, { isBurned: true, isLocked: true })}
              disabled={card.isBurned}
              className="py-2 px-3.5 bg-[#FF453A]/15 text-[#FF453A] hover:bg-[#FF453A]/25 border border-[#FF453A]/30 font-medium rounded-[8px] transition duration-100 active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-40 text-xs"
            >
              <Flame className="w-4 h-4 text-[#FF453A]" />
              <span>{card.isBurned ? 'Token Already Burned' : 'Destroy Token'}</span>
            </button>
          ) : (
            <div>
              {confirmDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#FF453A] font-medium text-xs">Permanently delete?</span>
                  <button
                    onClick={() => { onDeleteCard(card.id); onClose(); }}
                    className="px-3 py-1.5 bg-[#FF453A] hover:bg-[#E03A30] text-white rounded-[8px] font-medium text-xs"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 bg-[#2C2C2E] text-[#F5F5F7] hover:bg-[#38383A] rounded-[8px] font-medium border border-[#38383A] text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-[#8E8E93] hover:text-[#FF453A] transition flex items-center gap-1.5 font-medium text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Terminate Virtual Card</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0A84FF] hover:bg-[#0077ED] text-white font-medium rounded-[8px] transition duration-100 active:scale-[0.98] shadow-sm ml-auto text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
