"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Card, Button, Input, Select, Switch } from "@/components/ui";
import { User, Bell, Shield, Palette, Save } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "appearance">("profile");

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@realcrm.com",
    phone: "+91 98765 43210",
    role: "ADMIN",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newLeads: true,
    dealUpdates: true,
    taskReminders: true,
    weeklyReport: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });

  const [appearance, setAppearance] = useState({
    theme: "dark",
    compactMode: false,
    timezone: "Asia/Kolkata",
    language: "en",
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification settings updated!");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (security.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password updated successfully!");
      setSecurity({ ...security, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleAppearanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Appearance settings updated!");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "security" as const, label: "Security", icon: Shield },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#f1f5ff]">Settings</h2>
        <p className="text-xs text-[#8892b0]">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-2 border-b border-[#1e2a44] pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-all ${
              activeTab === tab.id
                ? "bg-[#1a2035] text-[#4f8ef7] border-b-2 border-[#4f8ef7]"
                : "text-[#8892b0] hover:text-[#f1f5ff] hover:bg-[#1a2035]/50"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" id="settings-name" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              <Input label="Email" id="settings-email" type="email" value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <Input label="Phone" id="settings-phone" type="tel" value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <Select label="Role" id="settings-role" value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                options={[
                  { value: "ADMIN", label: "Admin" },
                  { value: "MANAGER", label: "Manager" },
                  { value: "AGENT", label: "Agent" },
                ]} />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={loading} leftIcon={<Save size={14} />}>Save Changes</Button>
            </div>
          </form>
        )}

        {activeTab === "notifications" && (
          <form onSubmit={handleNotificationsSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f1f5ff]">Email Notifications</p>
                  <p className="text-xs text-[#4a5a80]">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f1f5ff]">New Leads</p>
                  <p className="text-xs text-[#4a5a80]">Get notified when new leads are assigned</p>
                </div>
                <Switch
                  checked={notifications.newLeads}
                  onChange={(checked) => setNotifications({ ...notifications, newLeads: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f1f5ff]">Deal Updates</p>
                  <p className="text-xs text-[#4a5a80]">Get notified about deal stage changes</p>
                </div>
                <Switch
                  checked={notifications.dealUpdates}
                  onChange={(checked) => setNotifications({ ...notifications, dealUpdates: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f1f5ff]">Task Reminders</p>
                  <p className="text-xs text-[#4a5a80]">Get reminded about upcoming tasks</p>
                </div>
                <Switch
                  checked={notifications.taskReminders}
                  onChange={(checked) => setNotifications({ ...notifications, taskReminders: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f1f5ff]">Weekly Report</p>
                  <p className="text-xs text-[#4a5a80]">Receive weekly performance summary</p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={loading} leftIcon={<Save size={14} />}>Save Changes</Button>
            </div>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleSecuritySubmit} className="space-y-6">
            <div className="space-y-4">
              <Input label="Current Password" id="settings-current-password" type="password"
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} />
              <Input label="New Password" id="settings-new-password" type="password"
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} />
              <Input label="Confirm New Password" id="settings-confirm-password" type="password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-[#1e2a44]">
              <div>
                <p className="text-sm font-medium text-[#f1f5ff]">Two-Factor Authentication</p>
                <p className="text-xs text-[#4a5a80]">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={security.twoFactorEnabled}
                onChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={loading} leftIcon={<Save size={14} />}>Update Password</Button>
            </div>
          </form>
        )}

        {activeTab === "appearance" && (
          <form onSubmit={handleAppearanceSubmit} className="space-y-6">
            <div className="space-y-4">
              <Select label="Theme" id="settings-theme" value={appearance.theme}
                onChange={(e) => setAppearance({ ...appearance, theme: e.target.value })}
                options={[
                  { value: "dark", label: "Dark" },
                  { value: "light", label: "Light" },
                  { value: "system", label: "System" },
                ]} />
              <Select label="Timezone" id="settings-timezone" value={appearance.timezone}
                onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                options={[
                  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
                  { value: "America/New_York", label: "America/New_York (EST)" },
                  { value: "Europe/London", label: "Europe/London (GMT)" },
                  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
                ]} />
              <Select label="Language" id="settings-language" value={appearance.language}
                onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                ]} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#f1f5ff]">Compact Mode</p>
                  <p className="text-xs text-[#4a5a80]">Reduce spacing for more content on screen</p>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={loading} leftIcon={<Save size={14} />}>Save Changes</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}