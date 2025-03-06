import { redirect } from 'next/navigation';
import { createClient } from '../utils/supabase/server';
import { AddItemForm } from '../components/add-item-form'; // Update this path
import { MobileLayout } from '../components/mobile-layout';

export default async function AddItemPage() {
  // Server-side auth check
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  // Redirect if not authenticated
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <MobileLayout>
      <AddItemForm userId={data.user.id} />
    </MobileLayout>
  );
}
