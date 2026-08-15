const fs = require('fs');

const file = 'app/(client)/dashboard/DashboardClient.tsx';
let content = fs.readFileSync(file, 'utf8');

// The issue is an extra `useEffect(() => {` and missing closing bracket due to regex replacement.
// Let's rewrite the useEffect entirely to be safe.

const newContent = content.replace(/useEffect\(\(\) => \{\n\n  useEffect\(\(\) => \{[\s\S]*?\n    const fetchUserAndOrders = async \(\) => \{/, `
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#8b5cf6', '#ffffff']
      });
      router.replace('/dashboard', undefined);
    }

    const fetchUserAndOrders = async () => {`);

fs.writeFileSync(file, newContent);
