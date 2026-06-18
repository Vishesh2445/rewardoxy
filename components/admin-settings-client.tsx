"use client";

import { useState, useEffect } from "react";

interface Setting {
  id: number;
  setting_key: string;
  setting_value: string;
  description: string;
}

export default function AdminSettingsClient() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch settings");
        return;
      }

      setSettings(data.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(settingKey: string, currentValue: string) {
    try {
      setSaving(settingKey);
      setError(null);
      const newValue = currentValue === "true" ? "false" : "true";

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setting_key: settingKey, setting_value: newValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update setting");
        return;
      }

      setSettings((prev) =>
        prev.map((s) =>
          s.setting_key === settingKey
            ? { ...s, setting_value: newValue }
            : s
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="material-symbols-outlined animate-spin text-on-tertiary-container text-[40px]">refresh</span>
      </div>
    );
  }

  const getSettingIcon = (key: string) => {
    if (key.includes("vpn")) return "vpn_lock";
    if (key.includes("country") || key.includes("mismatch")) return "public";
    return "settings";
  };

  return (
    <>
      {/* Page Header */}
      <header className="mb-section-gap">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Application Settings</h2>
        <p className="text-on-surface-variant text-body-sm">Configure global reward platform security and validation rules.</p>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Bento Grid Layout for Settings */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Security Column */}
        <div className="md:col-span-8 space-y-gutter">
          {settings.map((setting) => {
            const isEnabled = setting.setting_value === "true";
            const icon = getSettingIcon(setting.setting_key);

            return (
              <div
                key={setting.id}
                className="bg-white p-card-padding border border-outline-variant rounded-xl flex items-center justify-between hover:bg-surface-container-lowest transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-surface-container rounded-lg group-hover:bg-on-tertiary-container/10 transition-colors">
                    <span className="material-symbols-outlined text-on-tertiary-container">{icon}</span>
                  </div>
                  <div>
                    <h3 className="font-title-sm text-title-sm text-on-surface">{setting.setting_key.replace(/_/g, " ")}</h3>
                    <p className="text-on-surface-variant text-body-sm mt-1">{setting.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-body-sm font-semibold uppercase tracking-wider ${isEnabled ? "text-on-tertiary-container" : "text-on-surface-variant"}`}>
                    {isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(setting.setting_key, setting.setting_value)}
                      disabled={saving === setting.setting_key}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-on-tertiary-container disabled:opacity-50"></div>
                  </label>
                </div>
              </div>
            );
          })}

          {/* Platform Status Card */}
          <div className="relative h-64 overflow-hidden rounded-xl border border-outline-variant bg-primary-container">
            <div className="relative z-10 p-gutter h-full flex flex-col justify-end bg-gradient-to-t from-primary-container to-transparent">
              <p className="text-on-tertiary-container font-semibold uppercase tracking-widest text-[10px] mb-2">Platform Status</p>
              <h4 className="text-white font-display-lg text-display-lg">
                {settings.some(s => s.setting_value === "true")
                  ? "Real-time validation is currently active."
                  : "Real-time validation is currently inactive."}
              </h4>
            </div>
          </div>
        </div>

        {/* Info Box Column */}
        <div className="md:col-span-4">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-card-padding h-full space-y-6">
            <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
              <span className="material-symbols-outlined text-on-tertiary-container">info</span>
              <h3 className="font-title-sm text-title-sm text-on-surface">Information</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="font-semibold text-on-surface text-body-md">VPN Detection:</p>
                <p className="text-on-surface-variant text-body-sm leading-relaxed">
                  When disabled, users can access and earn even with VPNs, which might increase the risk of fraudulent activities or multi-accounting from single locations.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-on-surface text-body-md">Country Mismatch:</p>
                <p className="text-on-surface-variant text-body-sm leading-relaxed">
                  When disabled, users can access from different countries without triggering security alerts.
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary-container/10 border border-secondary-container/20 rounded-lg">
                <span className="material-symbols-outlined text-secondary">bolt</span>
                <p className="text-secondary font-semibold text-body-sm">
                  Changes apply immediately to new transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
