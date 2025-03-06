import { vi, describe, it, expect } from 'vitest';
import { login, signup } from '../src/app/login/actions';  // Adjust import path
import { createClient } from '../src/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Mock the dependencies
vi.mock('../utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Auth Functions', () => {
  
  it('should call revalidatePath and redirect on successful login', async () => {
    // Mocking the response of createClient and signInWithPassword
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    createClient.mockResolvedValue(mockSupabase);

    // Mock formData for login
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password123');

    await login(formData);

    // Check that revalidatePath and redirect were called
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard', 'layout');
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should return an error when login fails', async () => {
    // Mocking the response of createClient and signInWithPassword
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: { message: 'Invalid credentials' } }),
      },
    };
    createClient.mockResolvedValue(mockSupabase);

    // Mock formData for login
    const formData = new FormData();
    formData.append('email', 'wrong@example.com');
    formData.append('password', 'wrongpassword');

    const result = await login(formData);

    // Ensure the error was returned
    expect(result).toEqual({ error: 'Invalid credentials' });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should call revalidatePath and redirect on successful signup', async () => {
    // Mocking the response of createClient and signUp
    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    createClient.mockResolvedValue(mockSupabase);

    // Mock formData for signup
    const formData = new FormData();
    formData.append('email', 'newuser@example.com');
    formData.append('password', 'newpassword123');

    await signup(formData);

    // Check that revalidatePath and redirect were called
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('should redirect to error page when signup fails', async () => {
    // Mocking the response of createClient 
