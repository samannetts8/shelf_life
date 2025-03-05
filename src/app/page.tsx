import SupabaseTestPage from "./supatest";
import styles from "./page.module.css";
import LoginPage from "./login/page";

export default function Home() {
  return (
    <div className={styles.page}>
      <SupabaseTestPage />
      <LoginPage />
    </div>
  );
}
