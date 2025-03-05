"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "../utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: userData } = await supabase.auth.signInWithPassword(
    data
  );
  console.log(`Error message: ${JSON.stringify(error)}`);
  if (error) {
    // Return the error instead of redirecting
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard"); // Redirect to dashboard instead of homepage
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(data);
  console.log(`Error message 2: ${JSON.stringify(error)}`);
  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
