import { createAdminClient } from "@/lib/supabase/admin"
import { isAdmin } from "./actions"
import { AdminDashboardClient } from "./AdminDashboardClient"
import { PinLoginClient } from "./PinLoginClient"

export default async function AdminPage() {
  const isAuthorized = await isAdmin()

  if (!isAuthorized) {
    return <PinLoginClient />
  }

  // Fetch all orders using Admin Client (bypasses RLS)
  const adminClient = createAdminClient()
  const { data: orders } = await adminClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  // Calculate Metrics
  const metrics = {
    totalUsdRevenue: 0,
    totalPkrRevenue: 0,
    totalInrRevenue: 0,
    estimatedTotalUsd: 0,
    pendingJobs: 0,
    completedJobs: 0
  }

  if (orders) {
    orders.forEach(order => {
      if (order.status === 'completed') metrics.completedJobs++;
      if (order.status === 'pending') metrics.pendingJobs++;

      // Calculate revenue from completed or processing (paid) orders
      if (order.status !== 'failed') {
         if (order.currency === 'USD') metrics.totalUsdRevenue += order.amount_paid;
         if (order.currency === 'PKR') metrics.totalPkrRevenue += order.amount_paid;
         if (order.currency === 'INR') metrics.totalInrRevenue += order.amount_paid;
      }
    });
  }

  // Estimate total USD
  // Using rough exchange rates provided: $1 = 280 PKR, $1 = 85 INR
  const estimatedPkrToUsd = metrics.totalPkrRevenue / 280;
  const estimatedInrToUsd = metrics.totalInrRevenue / 85;
  metrics.estimatedTotalUsd = metrics.totalUsdRevenue + estimatedPkrToUsd + estimatedInrToUsd;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
         <header>
            <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Admin Command Center</h1>
            <p className="text-slate-400 mt-1">Manage orders, fulfill deliverable uploads, and monitor revenue.</p>
         </header>

         <AdminDashboardClient initialOrders={orders || []} metrics={metrics} />
      </div>
    </div>
  )
}
