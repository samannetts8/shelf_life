import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../src/app/components/login-form'; // Update the import path
import { useAuth } from '../src/app/hooks/use-auth';

vi.mock('../hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginForm Component', () => {
  let mockLogin, mockRegister;

  beforeEach(() => {
    mockLogin = vi.fn();
    mockRegister = vi.fn();
    useAuth.mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      isLoading: false,
    });
  });

  it('renders login form correctly', () => {
    render(<LoginForm isSignUp={false} onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('renders signup form correctly', () => {
    render(<LoginForm isSignUp={true} onSuccess={vi.fn()} />);
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it('calls login function on form submission', async () => {
    const onSuccessMock = vi.fn();
    render(<LoginForm isSignUp={false} onSuccess={onSuccessMock} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/sign in/i));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123'));
  });

  it('calls register function on signup', async () => {
    const onSuccessMock = vi.fn();
    render(<LoginForm isSignUp={true} onSuccess={onSuccessMock} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'newpassword' } });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith('newuser@example.com', 'newpassword'));
  });

  it('displays error message when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    render(<LoginForm isSignUp={false} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText(/sign in/i));

    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());
  });

  it('shows success message and calls onSuccess after signup', async () => {
    const onSuccessMock = vi.fn();
    render(<LoginForm isSignUp={true} onSuccess={onSuccessMock} />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/create account/i));

    await waitFor(() => expect(screen.getByText(/account created!/i)).toBeInTheDocument());
    await waitFor(() => expect(onSuccessMock).toHaveBeenCalled(), { timeout: 2000 });
  });
});
