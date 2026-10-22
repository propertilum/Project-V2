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
