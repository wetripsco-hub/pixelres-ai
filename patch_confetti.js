const fs = require('fs');

const file = 'app/(client)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// Insert confetti trigger in useEffect
const useEffectStr = `
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#8b5cf6', '#ffffff']
      });
      // Optionally remove the query param so it doesn't fire again on refresh
      router.replace('/dashboard', undefined);
    }

    const fetchUserAndOrders = async () => {`;

content = content.replace('    const fetchUserAndOrders = async () => {', useEffectStr);

fs.writeFileSync(file, content);
