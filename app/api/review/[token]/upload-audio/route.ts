import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    const deliveryId = form.get('deliveryId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bucket = 'comments-audio';
    const filename = file.name || `${Date.now()}.webm`;
    const path = `${deliveryId ?? 'unknown'}/${Date.now()}-${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const publicData = await supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path as string);

    if (!publicData || !publicData.data?.publicUrl) {
      return NextResponse.json({ error: 'failed to get public url' }, { status: 500 });
    }

    return NextResponse.json({ publicUrl: publicData.data.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
