'use client';
import { useState } from 'react';
import { login, signup } from './actions';
import styles from './page.module.css';

// Define the type for auth results
type AuthResult = { error: string } | undefined;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const result: AuthResult = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleSignup = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const result: AuthResult = await signup(formData);
    if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
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
        <button
          className={styles.button}
          formAction={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
        <button
          className={styles.button}
          formAction={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
    </div>
  );
}
