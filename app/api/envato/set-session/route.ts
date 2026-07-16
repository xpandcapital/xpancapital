import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { session } = await request.json();
    if (!session?.trim()) {
      return NextResponse.json({ success: false, error: 'Cookie vacía' }, { status: 400 });
    }

    await supabase.from('api_keys').upsert(
      { key_name: 'envato_elements_session', key_value: session.trim() },
      { onConflict: 'key_name' }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

