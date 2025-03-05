'use client';

import { useState } from 'react';
import { login, signup } from './actions';
import styles from './page.module.css';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (formData: FormData) => {
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  const handleSignup = async (formData: FormData) => {
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div>
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.form}>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          name="password"
          type="password"
          required
        />
        <button className={styles.button} formAction={handleLogin}>
          Log in
        </button>
        <button className={styles.button} formAction={handleSignup}>
          Sign up
        </button>
      </form>
    </div>
  );
}
