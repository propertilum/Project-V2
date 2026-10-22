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
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-[#111418] rounded-2xl shadow-2xl border border-[#262B33] overflow-hidden flex flex-col h-[500px] animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="bg-[#14181F] text-white p-4 flex justify-between items-center border-b border-[#262B33]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs">CardHub Security Assistant</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Telemetry AI Agent</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B0D10] text-xs">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-[#171B21] border border-[#262B33] text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-[#14181F] border-t border-[#1F242C] flex gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="shrink-0 text-[10px] bg-slate-900 hover:bg-indigo-950/60 hover:text-indigo-300 text-slate-300 font-medium px-2.5 py-1 rounded-full transition border border-[#262B33]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 border-t border-[#262B33] bg-[#14181F] flex gap-2"
      >
        <input
          type="text"
          placeholder="Ask anything about cards & limits..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-[#262B33] focus:outline-none focus:border-indigo-500 text-white"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
