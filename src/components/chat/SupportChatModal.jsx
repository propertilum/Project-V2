import { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

export default function SupportChatModal({ isOpen, onClose, walletBalance }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I am your CardHub Financial Security Assistant. I can assist you with card controls, burner issuance, freezing authorizations, or managing your $${walletBalance.toFixed(2)} balance. How can I help today?`,
    },
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'How do burner cards work?',
    'Freeze all active cards',
    'How to change monthly limit?',
    'Subscription protection details',
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      let reply = "Our security core has evaluated your query. You can manage card boundaries and individual channel toggles directly from the Cards tab.";
      const lower = query.toLowerCase();

      if (lower.includes('burner') || lower.includes('disposable') || lower.includes('temporary')) {
        reply = "Burner cards generate disposable 16-digit PANs with strict auto-expiration (e.g. 1 hour to 7 days). Once used or expired, any future recurring charges from rogue merchants will be completely blocked.";
      } else if (lower.includes('freeze') || lower.includes('lock') || lower.includes('panic')) {
        reply = "You can immediately trigger 'Panic Freeze All' in the Security Console or click Freeze on any card. All pending and subsequent authorization webhooks will be declined with code 51.";
      } else if (lower.includes('limit') || lower.includes('spend')) {
        reply = "Spending boundaries can be calibrated under Card Controls. You can set both a Monthly Cap (e.g. $5,000) and a Per-Transaction Max Authorization to prevent oversized charges.";
      } else if (lower.includes('subscription') || lower.includes('recurring')) {
        reply = "CardHub's Subscription Intelligence detects recurring billing patterns (like AWS, OpenAI, GitHub, Netflix) and tracks upcoming charges so you can pause or replace cards before renewals.";
      } else if (lower.includes('balance') || lower.includes('top up') || lower.includes('deposit')) {
        reply = `Your current balance is $${walletBalance.toFixed(2)}. Click '+ Top Up' in the header to fund your wallet instantly via card, wire, or crypto.`;
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-[#1C1C1E] rounded-[16px] shadow-2xl border border-[#38383A] overflow-hidden flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-[#2C2C2E]/80 text-white p-3.5 flex justify-between items-center border-b border-[#38383A]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-[8px] bg-[#0A84FF]/15 border border-[#0A84FF]/30 flex items-center justify-center text-[#0A84FF]">
            <Sparkles className="w-4 h-4 text-[#0A84FF]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[13px] text-white">CardHub Assistant</span>
              <span className="w-1.5 h-1.5 bg-[#34C759] rounded-full"></span>
            </div>
            <span className="text-[10px] text-[#8E8E93] font-mono">Security Telemetry</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#8E8E93] hover:text-white p-1 rounded-[6px] hover:bg-[#38383A] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#1C1C1E] text-[12px]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`p-3 rounded-[12px] max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0A84FF] text-white rounded-br-sm'
                  : 'bg-[#2C2C2E] border border-[#38383A] text-[#F5F5F7] rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-[#2C2C2E]/50 border-t border-[#38383A] flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="shrink-0 text-[10px] bg-[#2C2C2E] hover:bg-[#38383A] text-[#8E8E93] hover:text-[#F5F5F7] font-medium px-2.5 py-1 rounded-full transition border border-[#38383A]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 border-t border-[#38383A] bg-[#2C2C2E]/80 flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask anything about cards &amp; limits..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#1C1C1E] text-[12px] px-3 py-2 rounded-[8px] border border-[#38383A] focus:outline-none focus:border-[#0A84FF] focus:ring-1 focus:ring-[#0A84FF] text-white placeholder-[#8E8E93]"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] disabled:opacity-40 text-white rounded-[8px] transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
