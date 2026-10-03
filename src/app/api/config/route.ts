import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SiteConfig from '@/models/SiteConfig';
import { getAuthAdmin } from '@/lib/auth';

// Dynamic route to serve and update site contact configuration
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({
        phone: '7654722708',
        whatsapp: '917654722708',
        address: 'Ranchi, Jharkhand (HQ)',
        email: 'support@b2transport.in',
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        phone: config.phone,
        whatsapp: config.whatsapp,
        address: config.address,
        email: config.email,
        updatedAt: config.updatedAt,
      },
    });
  } catch (err: any) {
    console.error('Fetch config error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch site configuration',
        config: {
          phone: '7654722708',
          whatsapp: '917654722708',
          address: 'Ranchi, Jharkhand (HQ)',
          email: 'support@b2transport.in',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const { phone, whatsapp, address, email } = body;

    if (!phone || !whatsapp || !address) {
      return NextResponse.json(
        { success: false, error: 'Phone, WhatsApp, and Address are required' },
        { status: 400 }
      );
    }

    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig({ phone, whatsapp, address, email });
    } else {
      config.phone = phone.trim();
      config.whatsapp = whatsapp.trim();
      config.address = address.trim();
      if (email) config.email = email.trim();
    }

    await config.save();

    return NextResponse.json({
      success: true,
      message: 'Contact & Site Settings updated successfully!',
      config: {
        phone: config.phone,
        whatsapp: config.whatsapp,
        address: config.address,
        email: config.email,
        updatedAt: config.updatedAt,
      },
    });
  } catch (err: any) {
    console.error('Update config error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
