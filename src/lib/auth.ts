import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_admin_jwt_key_2026_b2transport';

export function signToken(payload: { id: string; email: string; adminId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: string; email: string; adminId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; adminId: string };
  } catch (error) {
    return null;
  }
}

export async function getAuthAdmin(req?: Request) {
  let token: string | null = null;

  // 1. Try from Authorization header
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // 2. Try from Cookies if no token in header
  if (!token) {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get('admin_token');
    if (cookieToken) {
      token = cookieToken.value;
    }
  }

  if (!token) return null;

  return verifyToken(token);
}

export const getAdminFromRequest = getAuthAdmin;
