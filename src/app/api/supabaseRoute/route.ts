import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET() {
  try {
    console.log('GET request received');
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('No authenticated user found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log(`Fetching items for user ID: ${user.id}`);

    // Use the actual column names from your database (camelCase)
    const { data, error } = await supabase
      .from('user_ingredients')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error(`Database error: ${error.message}`, error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} items`);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error in GET handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Get the user with getUser instead of getSession
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Delete the item, ensuring it belongs to the current user
    const { error } = await supabase
      .from('user_ingredients') // Use your actual table name
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure the item belongs to this user

    if (error) {
      console.error('Error deleting item:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// In your POST function
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Get the user with getUser instead of getSession
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // IMPORTANT: Don't spread the body - explicitly define only the fields you need
    // with the exact column names that match your database
    const itemToInsert = {
      name: body.name,
      category: body.category,
      quantity: body.quantity,
      unit: body.unit,
      user_id: user.id, // Changed from session.user.id
      // Use the correct column name based on your DB schema
      expiry_date: body.expiry_date || body.expiryDate,
      added_date: new Date().toISOString(),
    };

    console.log('Inserting item:', itemToInsert);

    // Insert with the correct column names
    const { data, error } = await supabase
      .from('user_ingredients')
      .insert(itemToInsert);

    if (error) {
      console.error('Error inserting food item:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || { success: true });
  } catch (error) {
    console.error('Unexpected error in POST handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
