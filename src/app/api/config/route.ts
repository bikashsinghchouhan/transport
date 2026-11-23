import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SiteConfig from '@/models/SiteConfig';
import { getAuthAdmin } from '@/lib/auth';
import {
  parseGoogleMapInput,
  DEFAULT_OFFICE_ADDRESS,
  DEFAULT_OFFICE_MAP_URL,
  DEFAULT_OFFICE_MAP_EMBED_URL,
} from '@/utils/mapUtils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({
        phone: '7654722708',
        whatsapp: '917654722708',
        address: DEFAULT_OFFICE_ADDRESS,
        email: 'support@b2transport.in',
        officeMapUrl: DEFAULT_OFFICE_MAP_URL,
        officeMapEmbedUrl: DEFAULT_OFFICE_MAP_EMBED_URL,
      });
    } else {
      let needsSave = false;
      if (
        !config.officeMapUrl ||
        config.officeMapUrl.includes('Morabadi%2C') ||
        config.officeMapUrl.includes('23.3965') ||
        config.officeMapUrl.includes('FcbqCfVYzuLFaLSv6')
      ) {
        config.officeMapUrl = DEFAULT_OFFICE_MAP_URL;
        needsSave = true;
      }
      if (
        !config.officeMapEmbedUrl ||
        config.officeMapEmbedUrl.includes('Morabadi%2C') ||
        config.officeMapEmbedUrl.includes('23.3965') ||
        !config.officeMapEmbedUrl.includes('B2+Transport+Office')
      ) {
        config.officeMapEmbedUrl = DEFAULT_OFFICE_MAP_EMBED_URL;
        needsSave = true;
      }
      if (
        config.address === 'Morabadi, Ranchi, Jharkhand 834008' ||
        config.address === 'Ranchi, Jharkhand (HQ)'
      ) {
        config.address = DEFAULT_OFFICE_ADDRESS;
        needsSave = true;
      }
      if (needsSave) {
        await config.save();
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        phone: config.phone || '7654722708',
        whatsapp: config.whatsapp || '917654722708',
        address: config.address || DEFAULT_OFFICE_ADDRESS,
        email: config.email || 'support@b2transport.in',
        officeMapUrl: config.officeMapUrl || DEFAULT_OFFICE_MAP_URL,
        officeMapEmbedUrl: config.officeMapEmbedUrl || DEFAULT_OFFICE_MAP_EMBED_URL,
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
          address: DEFAULT_OFFICE_ADDRESS,
          email: 'support@b2transport.in',
          officeMapUrl: DEFAULT_OFFICE_MAP_URL,
          officeMapEmbedUrl: DEFAULT_OFFICE_MAP_EMBED_URL,
        },
      },
      { status: 500 }
    );
  }
}

async function handleUpdateConfig(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const { phone, whatsapp, address, email, officeMapUrl, officeMapEmbedUrl } = body;

    if (!phone || !whatsapp || !address) {
      return NextResponse.json(
        { success: false, error: 'Phone, WhatsApp, and Address are required' },
        { status: 400 }
      );
    }

    const cleanAddress = address.trim();
    let finalMapUrl = officeMapUrl ? officeMapUrl.trim() : '';
    let finalEmbedUrl = officeMapEmbedUrl ? officeMapEmbedUrl.trim() : '';

    if (finalMapUrl) {
      const parsed = parseGoogleMapInput(finalMapUrl, cleanAddress);
      if (!finalEmbedUrl) {
        finalEmbedUrl = parsed.embedUrl;
      }
    } else if (!finalEmbedUrl) {
      const parsed = parseGoogleMapInput(cleanAddress, cleanAddress);
      finalMapUrl = parsed.mapUrl;
      finalEmbedUrl = parsed.embedUrl;
    }

    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig({
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        address: cleanAddress,
        email: email ? email.trim() : 'support@b2transport.in',
        officeMapUrl: finalMapUrl || DEFAULT_OFFICE_MAP_URL,
        officeMapEmbedUrl: finalEmbedUrl || DEFAULT_OFFICE_MAP_EMBED_URL,
      });
    } else {
      config.phone = phone.trim();
      config.whatsapp = whatsapp.trim();
      config.address = cleanAddress;
      if (email) config.email = email.trim();
      if (finalMapUrl) config.officeMapUrl = finalMapUrl;
      if (finalEmbedUrl) config.officeMapEmbedUrl = finalEmbedUrl;
    }

    await config.save();

    return NextResponse.json({
      success: true,
      message: 'Contact & Office Settings updated successfully!',
      config: {
        phone: config.phone,
        whatsapp: config.whatsapp,
        address: config.address,
        email: config.email,
        officeMapUrl: config.officeMapUrl || DEFAULT_OFFICE_MAP_URL,
        officeMapEmbedUrl: config.officeMapEmbedUrl || DEFAULT_OFFICE_MAP_EMBED_URL,
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

export async function PUT(req: NextRequest) {
  return handleUpdateConfig(req);
}

export async function POST(req: NextRequest) {
  return handleUpdateConfig(req);
}
