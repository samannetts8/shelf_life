'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '../utils/supabase/server';

// Define a return type for the login function
type LoginResult = { error: string } | undefined;

export async function login(
  formData: FormData
): Promise<LoginResult> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  console.log(`Error message: ${JSON.stringify(error)}`);
  if (error) {
    // Return the error instead of redirecting
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/dashboard', 'layout');
  redirect('/dashboard'); // Redirect to dashboard instead of homepage

  // TypeScript requires a return even though redirect prevents this from being reached
  return undefined;
}

// Same pattern for signup
export async function signup(
  formData: FormData
): Promise<LoginResult> {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);
  console.log(`Error message 2: ${JSON.stringify(error)}`);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');

  // TypeScript requires a return even though redirect prevents this from being reached
  return undefined;
}
