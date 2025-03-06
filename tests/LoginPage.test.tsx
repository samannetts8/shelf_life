import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../src/app/login/page';  // Adjust the import path if necessary
import { login, signup } from '../src/app/login/actions';  // Adjust the import path if necessary

// Mock the login and signup functions
vi.mock('./actions', () => ({
  login: vi.fn(),
  signup: vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();  // Clear previous mocks before each test
  });

  it('renders the login form correctly', () => {
    render(<LoginPage />);

    // Check if the form fields and buttons are in the document
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('calls login function with correct form data when login button is clicked', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    login.mockImplementation(mockLogin);  // Override login mock for this test

    render(<LoginPage />);

    // Simulate user input for email and password
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // Simulate login button click
    fireEvent.click(screen.getByText(/log in/i));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(expect.any(FormData)));
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('displays an error message when login fails', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ error: 'Invalid credentials' });
    login.mockImplementation(mockLogin);  // Override login mock for this test

    render(<LoginPage />);

    // Simulate user input for email and password
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });

    // Simulate login button click
    fireEvent.click(screen.getByText(/log in/i));

    // Check if the error message is displayed
    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());
  });

  it('calls signup function with correct form data when signup button is clicked', async () => {
    const mockSignup = vi.fn().mockResolvedValue(undefined);
    signup.mockImplementation(mockSignup);  // Override signup mock for this test

    render(<LoginPage />);

    // Simulate user input for email and password
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'newpassword123' } });

    // Simulate signup button click
    fireEvent.click(screen.getByText(/sign up/i));

    await waitFor(() => expect(mockSignup).toHaveBeenCalledWith(expect.any(FormData)));
    expect(mockSignup).toHaveBeenCalledTimes(1);
  });

  it('displays an error message when signup fails', async () => {
    const mockSignup = vi.fn().mockResolvedValue({ error: 'Signup failed' });
    signup.mockImplementation(mockSignup);  // Override signup mock for this test

    render(<LoginPage />);

    // Simulate user input for email and password
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'failpassword' } });

    // Simulate signup button click
    fireEvent.click(screen.getByText(/sign up/i));

    // Check if the error message is displayed
    await waitFor(() => expect(screen.getByText(/signup failed/i)).toBeInTheDocument());
  });

  it('disables buttons while loading', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    login.mockImplementation(mockLogin);

    render(<LoginPage />);

    // Check if login button is initially enabled
    const loginButton = screen.getByText(/log in/i);
    expect(loginButton).not.toBeDisabled();

    // Simulate user input and login button click
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Ensure the login button is disabled during the loading state
    expect(loginButton).toBeDisabled();
  });
});
