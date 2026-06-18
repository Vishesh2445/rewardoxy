"use client";

import { useState } from "react";

interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  is_broadcast: boolean;
  created_at: string;
}

interface AdminNotificationsClientProps {
  initialNotifications: Notification[];
}

export default function AdminNotificationsClient({ initialNotifications }: AdminNotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;
    if (!isBroadcast && !email.trim()) return;

    setSending(true);
    setFeedback(null);

    const res = await fetch("/api/admin/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        message: message.trim(),
        isBroadcast,
        email: isBroadcast ? undefined : email.trim(),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setFeedback({ type: "success", text: isBroadcast ? "Broadcast sent!" : `Notification sent to ${email}` });
      setTitle("");
      setMessage("");
      setEmail("");
      setNotifications((prev) => [
        {
          id: crypto.randomUUID(),
          user_id: null,
          title: title.trim(),
          message: message.trim(),
          is_broadcast: isBroadcast,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20));
    } else {
      setFeedback({ type: "error", text: data.error || "Failed to send" });
    }

    setSending(false);
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="font-headline-md text-display-lg text-on-surface">Notifications</h2>
        <p className="text-on-surface-variant text-body-md">Send broadcast or targeted notifications to users across the Rewardoxy ecosystem.</p>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left Column: New Notification Form */}
        <div className="lg:col-span-7">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-card-padding h-full">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-on-tertiary-container bg-surface-variant/30 p-2 rounded-lg">campaign</span>
              <h3 className="font-title-sm text-title-sm text-on-surface">New Notification</h3>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Notification Title</label>
                <input
                  className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-on-tertiary-container/20 focus:border-on-tertiary-container outline-none transition-all"
                  placeholder="e.g., Weekly Rewards Update"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Message Content</label>
                <textarea
                  className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-on-tertiary-container/20 focus:border-on-tertiary-container outline-none transition-all resize-none"
                  placeholder="Enter the broadcast message here..."
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Broadcast Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant rounded-lg">
                <div className="flex flex-col">
                  <span className="font-body-md font-semibold text-on-surface">
                    {isBroadcast ? "Broadcast to all users" : "Send to specific user"}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    {isBroadcast ? "Send this message to every registered user account." : "Send to a single user by email."}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBroadcast}
                    onChange={(e) => setIsBroadcast(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-on-tertiary-container"></div>
                </label>
              </div>

              {/* Email input for targeted notification */}
              {!isBroadcast && (
                <div className="space-y-2">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">User Email</label>
                  <input
                    className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-on-tertiary-container/20 focus:border-on-tertiary-container outline-none transition-all"
                    placeholder="user@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`p-3 rounded-lg ${feedback.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                  {feedback.text}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={sending || !title.trim() || !message.trim() || (!isBroadcast && !email.trim())}
                  className="bg-on-tertiary-container text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {sending ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  )}
                  {sending ? "Sending..." : "Send Notification"}
                </button>
                <button
                  type="button"
                  className="px-6 py-3 text-on-surface-variant hover:bg-surface-variant/10 rounded-lg font-semibold transition-all"
                  onClick={() => { setTitle(""); setMessage(""); setEmail(""); }}
                >
                  Clear
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right Column: Recent Activity & Stats */}
        <div className="lg:col-span-5 flex flex-col gap-gutter">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-card-padding">
              <span className="text-label-caps font-label-caps text-on-surface-variant">TOTAL SENT</span>
              <div className="text-display-lg font-display-lg text-on-surface mt-1">{notifications.length}</div>
              <div className="text-body-sm text-secondary flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> This session
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-card-padding">
              <span className="text-label-caps font-label-caps text-on-surface-variant">BROADCASTS</span>
              <div className="text-display-lg font-display-lg text-on-surface mt-1">{notifications.filter(n => n.is_broadcast).length}</div>
              <div className="text-body-sm text-on-tertiary-container flex items-center gap-1 mt-2">
                <span className="material-symbols-outlined text-[14px]">visibility</span> Global
              </div>
            </div>
          </div>

          {/* Recent Notifications Section */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col flex-1">
            <div className="p-card-padding border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-title-sm text-title-sm text-on-surface">Recent Notifications</h3>
            </div>

            {notifications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-gutter text-center space-y-4 min-h-[300px]">
                <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant/30">
                  <span className="material-symbols-outlined text-[48px]">history</span>
                </div>
                <div className="space-y-1">
                  <p className="font-title-sm text-on-surface">No notifications sent yet.</p>
                  <p className="text-body-sm text-on-surface-variant max-w-[240px] mx-auto">Sent broadcasts and targeted messages will appear here for tracking.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant max-h-[400px] overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-card-padding hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        n.is_broadcast ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {n.is_broadcast ? "Broadcast" : "Targeted"}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="font-semibold text-on-surface text-body-sm">{n.title}</p>
                    <p className="text-body-sm text-on-surface-variant truncate">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pro Tip Card */}
          <div className="bg-primary-container text-on-primary rounded-xl p-gutter overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="font-title-sm text-on-tertiary-container mb-2">Pro Tip</h4>
              <p className="text-body-sm text-on-primary-container leading-relaxed">
                Personalized notifications see a <span className="text-on-primary font-bold">45% higher</span> engagement rate compared to general broadcasts. Use segments for better results.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-on-tertiary-container/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </>
  );
}
