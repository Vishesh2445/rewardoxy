"use client";

interface AdminDashboardClientProps {
  totalUsers: number;
  totalCoins: number;
  pendingWithdrawals: number;
  totalCompletions: number;
  bannedUsers: number;
}

export default function AdminDashboardClient({
  totalUsers,
  totalCoins,
  pendingWithdrawals,
  totalCompletions,
  bannedUsers,
}: AdminDashboardClientProps) {
  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: "group", color: "bg-surface-container text-on-tertiary-container", trend: "+12.5%", trendColor: "text-secondary" },
    { label: "Coins Circ.", value: totalCoins.toLocaleString(), icon: "payments", color: "bg-secondary-container/20 text-secondary", trend: "Active ecosystem value", trendColor: "text-on-surface-variant" },
    { label: "Pending W.", value: String(pendingWithdrawals), icon: "pending_actions", color: "bg-error-container text-on-error-container", trend: "Requires Attention", trendColor: "text-error" },
    { label: "Completions", value: totalCompletions.toLocaleString(), icon: "task_alt", color: "bg-surface-container text-on-tertiary-container", trend: "Successful tasks", trendColor: "text-on-surface-variant" },
    { label: "Banned Users", value: String(bannedUsers), icon: "block", color: "bg-surface-container-low text-outline", trend: bannedUsers === 0 ? "Clean status" : `${bannedUsers} banned`, trendColor: bannedUsers === 0 ? "text-secondary" : "text-error" },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="font-headline-md text-headline-md text-on-surface">Admin Dashboard</h2>
        <p className="text-on-surface-variant font-body-md">Overview of platform activity and key performance metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-outline-variant p-card-padding rounded-xl hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{s.label}</span>
              <span className={`material-symbols-outlined ${s.color} p-1.5 rounded-lg`}>{s.icon}</span>
            </div>
            <div className="font-display-lg text-display-lg text-on-surface font-data-mono">{s.value}</div>
            <div className={`flex items-center gap-1 mt-2 ${s.trendColor} font-body-sm`}>
              {s.trend === "+12.5%" && <span className="material-symbols-outlined text-sm">trending_up</span>}
              <span>{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Grid Section */}
      <div className="grid grid-cols-12 gap-6">
        {/* Platform Activity Chart Placeholder */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant p-card-padding rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-title-sm text-title-sm text-on-surface">Platform Activity</h3>
              <p className="text-on-surface-variant text-body-sm">User engagements and rewards over time</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-body-sm bg-surface-container-high rounded-full font-semibold">Weekly</button>
              <button className="px-3 py-1 text-body-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">Monthly</button>
            </div>
          </div>
          <div className="h-[300px] w-full relative overflow-hidden rounded bg-surface-container-low flex items-end px-4 gap-4">
            {[40, 60, 35, 80, 50, 70, 95, 65, 40, 75, 85, 55].map((h, i) => (
              <div key={i} className="flex-1 bg-on-tertiary-container/20 rounded-t transition-all hover:bg-on-tertiary-container/30" style={{ height: `${h}%` }} />
            ))}
            <div className="absolute inset-0 flex flex-col justify-between py-6 pointer-events-none">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-outline-variant/30 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-card-padding rounded-xl flex flex-col">
          <h3 className="font-title-sm text-title-sm text-on-surface mb-6">Recent Activity</h3>
          <div className="flex-1 space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-sm">add_task</span>
              </div>
              <div>
                <p className="text-body-md font-semibold text-on-surface">User @alex_v completed Survey</p>
                <p className="text-body-sm text-on-surface-variant">Earned 50.00 Coins</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-tertiary-container shrink-0">
                <span className="material-symbols-outlined text-sm">person_add</span>
              </div>
              <div>
                <p className="text-body-md font-semibold text-on-surface">New User Registration</p>
                <p className="text-body-sm text-on-surface-variant">15m ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error shrink-0">
                <span className="material-symbols-outlined text-sm">priority_high</span>
              </div>
              <div>
                <p className="text-body-md font-semibold text-on-surface">Withdrawal Request</p>
                <p className="text-body-sm text-on-surface-variant">45m ago</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 text-body-sm font-semibold text-on-tertiary-container border border-on-tertiary-container/20 rounded hover:bg-surface-variant/10 transition-colors">
            View Full Audit Log
          </button>
        </div>
      </div>
    </>
  );
}
