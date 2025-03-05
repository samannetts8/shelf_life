import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';

export async function GET() {
  try {
    // Query all items without user filtering
    const { data, error } = await supabase
      .from('fridge_items')
      .select('*')
      .order('expiry_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      name,
      expiryDate,
      quantity,
      user_id = 'anonymous',
    } = await request.json();

    if (!name || !expiryDate) {
      return NextResponse.json(
        { error: 'Name and expiry date are required' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('fridge_items')
      .insert({
        name,
        expiry_date: expiryDate,
        quantity: quantity || 1,
        user_id, // Using provided user_id or default
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
