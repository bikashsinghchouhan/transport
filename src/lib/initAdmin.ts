import bcrypt from 'bcryptjs';
import connectToDatabase from './db';
import Admin from '../models/Admin';

export async function ensureDefaultAdmin() {
  try {
    await connectToDatabase();

    const defaultEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'bikashkrsin2@gmail.com').toLowerCase();
    const defaultAdminId = process.env.DEFAULT_ADMIN_ID || 'Admin@2026';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2026';

    // Check if an admin with this email or adminId already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email: defaultEmail }, { adminId: defaultAdminId }],
    });

    if (!existingAdmin) {
      console.log('No admin found. Seeding default admin user...');
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      const newAdmin = new Admin({
        email: defaultEmail,
        adminId: defaultAdminId,
        password: hashedPassword,
      });

      await newAdmin.save();
      console.log(`Default admin created: ${defaultEmail} / ${defaultAdminId}`);
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
}
