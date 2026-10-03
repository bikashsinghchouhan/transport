import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authData = await getAuthAdmin(req);
    if (!authData) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const admin = await Admin.findById(authData.id).select('-password -resetToken -resetTokenExpiry');

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        adminId: admin.adminId,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
