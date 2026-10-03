import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';
import { ensureDefaultAdmin } from '@/lib/initAdmin';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { loginId, password } = body;

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/Admin ID and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ensureDefaultAdmin();

    const cleanLoginId = loginId.trim();

    // Find admin matching email (case insensitive) OR adminId (exact)
    const admin = await Admin.findOne({
      $or: [
        { email: cleanLoginId.toLowerCase() },
        { adminId: cleanLoginId },
      ],
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid Email/Admin ID or password' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid Email/Admin ID or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = signToken({
      id: admin._id.toString(),
      email: admin.email,
      adminId: admin.adminId,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        adminId: admin.adminId,
      },
    });

    // Set HTTP-only Cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
