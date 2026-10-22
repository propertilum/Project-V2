export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCardNumberMasked = (cardNumber, show = false) => {
  if (!cardNumber) return '•••• •••• •••• ••••';
  if (show) return cardNumber;
  const clean = cardNumber.replace(/\s+/g, '');
  const last4 = clean.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recently';
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};
