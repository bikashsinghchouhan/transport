import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/db';
import Admin from '@/models/Admin';
import { ensureDefaultAdmin } from '@/lib/initAdmin';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Email or Admin ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await ensureDefaultAdmin();

    const cleanIdentifier = identifier.trim();

    // Find admin by email or adminId
    const admin = await Admin.findOne({
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { adminId: cleanIdentifier },
      ],
    });

    if (!admin) {
      // Return success to avoid user enumeration, or clear message
      return NextResponse.json({
        success: true,
        message: 'If an account exists with that identifier, a password reset link has been sent to the registered email.',
      });
    }

    // Generate random hex token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    admin.resetToken = resetToken;
    admin.resetTokenExpiry = resetTokenExpiry;
    await admin.save();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${resetToken}`;

    // Send email
    const mailResult = await sendPasswordResetEmail(admin.email, resetUrl);

    return NextResponse.json({
      success: true,
      message: `Password reset link sent to ${admin.email}.`,
      emailSent: mailResult.emailSent,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
