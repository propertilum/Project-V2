export const generateCardDetails = () => {
  const randGroup = () => Math.floor(1000 + Math.random() * 9000);
  const last4 = String(randGroup());
  const cardNumber = `•••• •••• •••• ${last4}`;
  const cvv = '•••';

  const currentYear = new Date().getFullYear() % 100;
  const expYear = currentYear + 3 + Math.floor(Math.random() * 2);
  const expMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
  const expDate = `${expMonth}/${expYear}`;

  return { cardNumber, last4, cvv, expDate, isDemo: true };
};

export const getFullCardNumber = (card) => {
  if (card?.fullNumber && !card.fullNumber.includes('•')) return card.fullNumber;
  if (card?.cardNumber && !card.cardNumber.includes('•')) return card.cardNumber;
  const last4 = card?.last4 || (card?.cardNumber ? card.cardNumber.slice(-4) : '4242');
  const prefix = card?.brand === 'Mastercard' ? '5412' : card?.brand === 'AMEX' ? '3782' : '4242';
  return `${prefix} 8820 1934 ${last4}`;
};

export const getCvv = (card) => {
  if (card?.cvv && !card.cvv.includes('•')) return card.cvv;
  const last4Num = parseInt(card?.last4 || '4242', 10) || 4242;
  return ((last4Num * 7) % 900 + 100).toString();
};

