"use client";

import { useState } from "react";
import { MobileLayout } from "../components/mobile-layout";
import ClientLayout from "../ClientLayout";
import styles from "./settings.module.css";
import { useAuth } from "../hooks/use-auth";
import { useRouter } from "next/navigation";

function SettingsContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [expiryReminders, setExpiryReminders] = useState(1); // Days before expiry
  const [measurementSystem, setMeasurementSystem] = useState("metric");
  const [theme, setTheme] = useState("light");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    // Simulate saving settings
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Here you would normally save to database
    // const { error } = await supabase.from('user_settings').upsert({
    //   user_id: user.id,
    //   notifications,
    //   expiry_reminders: expiryReminders,
    //   measurement_system: measurementSystem,
    //   theme
    // });

    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // Implement account deletion logic
      alert("Account deletion would happen here");
    }
  };

  return (
    <MobileLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>Settings</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.accountInfo}>
            <div className={styles.avatar}>
              {user?.email?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className={styles.accountDetails}>
              <p className={styles.email}>{user?.email}</p>
              <p className={styles.memberSince}>
                Member since{" "}
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications</h2>

          <div className={styles.setting}>
            <label htmlFor="notifications" className={styles.settingLabel}>
              Enable notifications
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                id="notifications"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.setting}>
            <label htmlFor="expiryReminders" className={styles.settingLabel}>
              Expiry reminders
            </label>
            <select
              id="expiryReminders"
              value={expiryReminders}
              onChange={(e) => setExpiryReminders(Number(e.target.value))}
              className={styles.select}
              disabled={!notifications}
            >
              <option value="0">On expiry date</option>
              <option value="1">1 day before</option>
              <option value="2">2 days before</option>
              <option value="3">3 days before</option>
              <option value="5">5 days before</option>
              <option value="7">1 week before</option>
            </select>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferences</h2>

          <div className={styles.setting}>
            <label htmlFor="measurementSystem" className={styles.settingLabel}>
              Measurement system
            </label>
            <select
              id="measurementSystem"
              value={measurementSystem}
              onChange={(e) => setMeasurementSystem(e.target.value)}
              className={styles.select}
            >
              <option value="metric">Metric (g, ml)</option>
              <option value="imperial">Imperial (oz, fl oz)</option>
            </select>
          </div>

          <div className={styles.setting}>
            <label htmlFor="theme" className={styles.settingLabel}>
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className={styles.select}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System default</option>
            </select>
          </div>
        </section>

        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Management</h2>

          <button
            className={styles.actionButton}
            onClick={() => alert("Data would be exported here")}
          >
            Export My Data
          </button>

          <button
            className={styles.actionButton}
            onClick={() =>
              confirm("Clear all food items from your account?") &&
              alert("Data would be cleared here")
            }
          >
            Clear Food Items
          </button>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account Actions</h2>

          <button
            className={`${styles.actionButton} ${styles.logoutButton}`}
            onClick={handleLogout}
          >
            Log Out
          </button>

          <button
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </section>

        <div className={styles.about}>
          <p className={styles.version}>Shelf-Life v1.0.0</p>
          <p className={styles.copyright}>© 2025 School of Code</p>
        </div>
      </div>
    </MobileLayout>
  );
}

export default function SettingsPage() {
  return (
    <ClientLayout>
      <SettingsContent />
    </ClientLayout>
  );
}
