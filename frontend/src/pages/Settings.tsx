import React, { useContext, useEffect, useMemo, useState } from "react";
import { Save, Lock, Bell, Building2 } from "lucide-react";
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PageHeader from '../components/ui/PageHeader';
import client from "../api/client";
import { AuthContext } from "../context/AuthContext";

type InstitutionSettings = {
  institutionName: string;
  emailDomain: string;
  contactEmail: string;
  academicYearStart: number;
  academicYearEnd: number;
  updatedAt?: string;
};

type NotificationPreferences = {
  email: boolean;
  inApp: boolean;
  sms: boolean;
};

const Settings: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const tabs = useMemo(
    () => [
      { key: 'general', label: 'General', icon: Building2 },
      { key: 'security', label: 'Security', icon: Lock },
      { key: 'notifications', label: 'Notifications', icon: Bell },
    ] as const,
    []
  );
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['key']>('general');

  const toast = (type: "success" | "error", message: string) => {
    window.dispatchEvent(
      new CustomEvent("ui-toast", { detail: { type, message } })
    );
  };

  const [general, setGeneral] = useState<InstitutionSettings>({
    institutionName: "",
    emailDomain: "",
    contactEmail: "",
    academicYearStart: new Date().getFullYear(),
    academicYearEnd: new Date().getFullYear() + 1,
  });
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    email: true,
    inApp: true,
    sms: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    setLoadingGeneral(true);
    client
      .get("/settings", { ui: { silent: true } } as any)
      .then((res) => {
        if (!active) return;
        setGeneral(res.data);
      })
      .catch(() => {
        // global error already displayed by interceptor
      })
      .finally(() => {
        if (!active) return;
        setLoadingGeneral(false);
      });

    setLoadingPrefs(true);
    client
      .get("/auth/preferences", { ui: { silent: true } } as any)
      .then((res) => {
        if (!active) return;
        setPrefs(res.data.notificationPreferences || prefs);
      })
      .catch(() => {
        // global error already displayed by interceptor
      })
      .finally(() => {
        if (!active) return;
        setLoadingPrefs(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canEditInstitution = user?.role === "admin";

  const saveGeneral = async () => {
    if (!canEditInstitution) {
      toast("error", "Only admins can update institution settings");
      return;
    }
    setSaving(true);
    try {
      const res = await client.put("/settings", general);
      setGeneral(res.data);
      toast("success", "Institution settings saved");
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const res = await client.put("/auth/preferences", {
        notificationPreferences: prefs,
      });
      setPrefs(res.data.notificationPreferences || prefs);
      toast("success", "Notification preferences saved");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!security.currentPassword || !security.newPassword) {
      toast("error", "Enter your current and new password");
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      toast("error", "New password and confirmation do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await client.put("/auth/change-password", {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      auth?.login(res.data.token, {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast("success", "Password updated");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your institution preferences and account policies."
      />
      
      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-2 p-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={[
                  'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-slate-200/70 dark:border-slate-800/70 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-900/60 border border-transparent',
                ].join(' ')}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'general' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Institution Name"
                  value={general.institutionName}
                  disabled={!canEditInstitution}
                  placeholder={loadingGeneral ? "Loading..." : "Institution name"}
                  onChange={(e) => setGeneral((s) => ({ ...s, institutionName: e.target.value }))}
                />
                <Input
                  label="Email Domain"
                  value={general.emailDomain}
                  disabled={!canEditInstitution}
                  placeholder={loadingGeneral ? "Loading..." : "@example.edu"}
                  onChange={(e) => setGeneral((s) => ({ ...s, emailDomain: e.target.value }))}
                />
                <Input
                  label="Contact Email"
                  type="email"
                  value={general.contactEmail}
                  disabled={!canEditInstitution}
                  placeholder={loadingGeneral ? "Loading..." : "admin@example.edu"}
                  onChange={(e) => setGeneral((s) => ({ ...s, contactEmail: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Academic Year Start"
                    type="number"
                    value={String(general.academicYearStart ?? "")}
                    disabled={!canEditInstitution}
                    onChange={(e) =>
                      setGeneral((s) => ({ ...s, academicYearStart: Number(e.target.value) }))
                    }
                  />
                  <Input
                    label="Academic Year End"
                    type="number"
                    value={String(general.academicYearEnd ?? "")}
                    disabled={!canEditInstitution}
                    onChange={(e) =>
                      setGeneral((s) => ({ ...s, academicYearEnd: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
                <Button
                  onClick={saveGeneral}
                  leftIcon={<Save size={18} />}
                  variant="primary"
                  disabled={saving || loadingGeneral || !canEditInstitution}
                >
                  Save changes
                </Button>
              </div>
            </>
          ) : null}

          {activeTab === "security" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Current password"
                  type="password"
                  value={security.currentPassword}
                  onChange={(e) => setSecurity((s) => ({ ...s, currentPassword: e.target.value }))}
                />
                <div className="hidden md:block" />
                <Input
                  label="New password"
                  type="password"
                  value={security.newPassword}
                  onChange={(e) => setSecurity((s) => ({ ...s, newPassword: e.target.value }))}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) =>
                    setSecurity((s) => ({ ...s, confirmPassword: e.target.value }))
                  }
                />
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
                <Button
                  onClick={changePassword}
                  leftIcon={<Save size={18} />}
                  variant="primary"
                  disabled={saving}
                >
                  Update password
                </Button>
              </div>
            </div>
          ) : null}

          {activeTab === "notifications" ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                    checked={Boolean(prefs.email)}
                    disabled={loadingPrefs}
                    onChange={(e) => setPrefs((s) => ({ ...s, email: e.target.checked }))}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Email notifications
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Receive important updates via email.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                    checked={Boolean(prefs.inApp)}
                    disabled={loadingPrefs}
                    onChange={(e) => setPrefs((s) => ({ ...s, inApp: e.target.checked }))}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      In-app notifications
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Show notifications inside the dashboard.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                    checked={Boolean(prefs.sms)}
                    disabled={loadingPrefs}
                    onChange={(e) => setPrefs((s) => ({ ...s, sms: e.target.checked }))}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      SMS notifications
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Optional SMS alerts (if enabled by the institution).
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
                <Button
                  onClick={savePreferences}
                  leftIcon={<Save size={18} />}
                  variant="primary"
                  disabled={saving || loadingPrefs}
                >
                  Save preferences
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default Settings;
