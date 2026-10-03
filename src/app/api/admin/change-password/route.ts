import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAuthAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const authAdmin = await getAuthAdmin(req);
    if (!authAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const admin = await Admin.findById(authAdmin.id);

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Admin account not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
