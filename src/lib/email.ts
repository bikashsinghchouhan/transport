import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  const host = process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '587', 10);
  const user = process.env.MAIL_USER || process.env.SMTP_USER || '';
  const pass = process.env.MAIL_PASS || process.env.SMTP_PASS || '';

  console.log(`[PASSWORD RESET LINK] Target: ${toEmail} | Link: ${resetUrl}`);

  if (user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      const mailOptions = {
        from: `"b2 Transport Admin" <${user}>`,
        to: toEmail,
        subject: 'Password Reset Request - b2 Transport Admin Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #e2e8f0; padding: 30px; border-radius: 12px; border: 1px solid #1e293b;">
            <h2 style="color: #38bdf8; font-size: 24px; margin-bottom: 16px; text-align: center;">b2 Transport - Admin Password Reset</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">You requested a password reset for your Admin account.</p>
            <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Click the button below to set a new password. This link is valid for 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #94a3b8;">If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center;">Direct Link: <a href="${resetUrl}" style="color: #38bdf8;">${resetUrl}</a></p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Password reset email successfully sent to ${toEmail}`);
      return { success: true, emailSent: true };
    } catch (err) {
      console.error('Failed to send email via Nodemailer:', err);
      return { success: true, emailSent: false, error: (err as Error).message };
    }
  }

  return { success: true, emailSent: false, note: 'MAIL_PASS not configured' };
}
