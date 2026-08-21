import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { isAdmin } from "./actions"
import { AdminDashboardClient } from "./AdminDashboardClient"
import { PinLoginClient } from "./PinLoginClient"
import { getPricingSettings } from "@/lib/pricing-store"

export default async function AdminPage() {
  const isAuthorized = await isAdmin()

  if (!isAuthorized) {
    return <PinLoginClient />
  }

  // Get current user email (if logged in via Supabase)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = user?.email || process.env.ADMIN_EMAIL || "wetrips.co@gmail.com"

  // Fetch all orders using Admin Client (bypasses RLS)
  const adminClient = createAdminClient()
  const { data: orders } = await adminClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch current pricing settings using resilient store
  const initialPricing = await getPricingSettings()

  // Calculate Metrics
  const metrics = {
    totalUsdRevenue: 0,
    totalPkrRevenue: 0,
    totalInrRevenue: 0,
    estimatedTotalUsd: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalOrders: 0,
  }

  if (orders) {
    metrics.totalOrders = orders.length
    orders.forEach(order => {
      if (order.status === 'completed') metrics.completedJobs++;
      if (order.status === 'pending' || order.status === 'processing') metrics.pendingJobs++;

      if (order.status !== 'failed') {
        if (order.currency === 'USD') metrics.totalUsdRevenue += order.amount_paid;
        if (order.currency === 'PKR') metrics.totalPkrRevenue += order.amount_paid;
        if (order.currency === 'INR') metrics.totalInrRevenue += order.amount_paid;
      }
    });
  }

  const estimatedPkrToUsd = metrics.totalPkrRevenue / 280;
  const estimatedInrToUsd = metrics.totalInrRevenue / 85;
  metrics.estimatedTotalUsd = metrics.totalUsdRevenue + estimatedPkrToUsd + estimatedInrToUsd;

  return (
    <AdminDashboardClient
      initialOrders={orders || []}
      metrics={metrics}
      initialPricing={initialPricing}
      adminEmail={adminEmail}
    />
  )
}
