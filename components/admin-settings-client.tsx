"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Button,
  TextField,
} from "@mui/material";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

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
  const [editValues, setEditValues] = useState<Record<string, string>>({});

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
      const vals: Record<string, string> = {};
      for (const s of data.settings) {
        vals[s.setting_key] = s.setting_value;
      }
      setEditValues(vals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function isBoolSetting(key: string) {
    return key.endsWith("_enabled");
  }

  async function handleSave(settingKey: string, newValue: string) {
    try {
      setSaving(settingKey);
      setError(null);

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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, sm: 3, md: 4 }, pb: { xs: 12, lg: 4 } }}>
      <Typography variant="h4" isBold sx={{ mb: 3, color: "#10B981" }}>
        Application Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "grid", gap: 2 }}>
        {settings.map((setting) => {
          const isBool = isBoolSetting(setting.setting_key);
          const isEnabled = setting.setting_value === "true";

          return (
            <Paper
              key={setting.id}
              elevation={0}
              sx={{
                bgcolor: colors.background.secondary,
                border: `1px solid ${colors.divider}`,
                borderRadius: 2,
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "rgba(16,185,129,0.3)",
                  bgcolor: "rgba(16,185,129,0.02)",
                },
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  isBold
                  sx={{
                    fontSize: "1rem",
                    color: colors.text.primary,
                    mb: 0.5,
                    textTransform: "capitalize",
                  }}
                >
                  {setting.setting_key.replace(/_/g, " ")}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: colors.text.secondary,
                  }}
                >
                  {setting.description}
                </Typography>
              </Box>

              {isBool ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={isEnabled}
                      onChange={() => handleSave(setting.setting_key, isEnabled ? "false" : "true")}
                      disabled={saving === setting.setting_key}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#10B981",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#10B981",
                        },
                      }}
                    />
                  }
                  label={isEnabled ? "Enabled" : "Disabled"}
                  sx={{
                    ml: 2,
                    color: isEnabled ? "#10B981" : colors.text.secondary,
                    fontWeight: 600,
                  }}
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={editValues[setting.setting_key] ?? setting.setting_value}
                    onChange={(e) =>
                      setEditValues((prev) => ({ ...prev, [setting.setting_key]: e.target.value }))
                    }
                    disabled={saving === setting.setting_key}
                    sx={{
                      width: 120,
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#252539",
                        borderRadius: "10px",
                        fontSize: "0.875rem",
                        color: "#fff",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.06)" },
                        "&:hover fieldset": { borderColor: "rgba(16,185,129,0.3)" },
                        "&.Mui-focused fieldset": { borderColor: "#10B981" },
                      },
                      "& input": { textAlign: "center" },
                    }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleSave(setting.setting_key, editValues[setting.setting_key] ?? setting.setting_value)}
                    disabled={saving === setting.setting_key || editValues[setting.setting_key] === setting.setting_value}
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      bgcolor: "#10B981",
                      "&:hover": { bgcolor: "#059669" },
                      "&.Mui-disabled": { opacity: 0.4 },
                    }}
                  >
                    Save
                  </Button>
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>

      <Divider sx={{ borderColor: colors.divider, my: 4 }} />

      <Paper
        elevation={0}
        sx={{
          bgcolor: "rgba(16,185,129,0.05)",
          border: `1px solid rgba(16,185,129,0.2)`,
          borderRadius: 2,
          p: 3,
        }}
      >
        <Typography isBold sx={{ color: "#10B981", mb: 1 }}>
          ℹ️ Information
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: colors.text.secondary, lineHeight: 1.7 }}>
          • <strong>VPN Detection</strong>: When disabled, users can access and earn even with VPNs.
          <br />
          • <strong>Country Mismatch Detection</strong>: When disabled, users can access from different countries.
          <br />
          • Changes apply immediately to new transactions.
        </Typography>
      </Paper>
    </Box>
  );
}
