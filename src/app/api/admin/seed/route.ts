import { NextResponse } from 'next/server';
import { ensureDefaultAdmin } from '@/lib/initAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDefaultAdmin();
    return NextResponse.json({
      success: true,
      message: 'Default admin seeded in MongoDB successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
