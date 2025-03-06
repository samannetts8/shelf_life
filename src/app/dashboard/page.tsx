import { redirect } from 'next/navigation';
import { createClient } from '../utils/supabase/server';
import { Fridge } from '../components/fridge';
import { MobileLayout } from '../components/mobile-layout';

export default async function Dashboard() {
  // Server-side auth check
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  // Redirect if not authenticated
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <MobileLayout>
      <Fridge userId={data.user.id} />
    </MobileLayout>
  );
}
