import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import { ensureDefaultVehicles } from '@/lib/initVehicles';
import { getAuthAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    await ensureDefaultVehicles();

    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('all') === 'true';

    const query = includeInactive ? {} : { isActive: true };
    const vehicles = await Vehicle.find(query).sort({ displayOrder: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error('Fetch vehicles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authAdmin = await getAuthAdmin(req);
    if (!authAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      capacity,
      dimensions,
      description,
      tag,
      basePrice,
      perKmPrice,
      rateFirst100,
      rateAfter100,
      minFareMin,
      minFareMax,
      isActive,
      displayOrder,
    } = body;

    if (!name || !capacity || !dimensions || !description) {
      return NextResponse.json(
        { success: false, error: 'Name, Capacity, Dimensions, and Description are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newVehicle = new Vehicle({
      name: name.trim(),
      capacity: capacity.trim(),
      dimensions: dimensions.trim(),
      description: description.trim(),
      tag: tag ? tag.trim() : '',
      basePrice: Number(basePrice) || 500,
      perKmPrice: Number(perKmPrice) || 25,
      rateFirst100: Number(rateFirst100) || 35,
      rateAfter100: Number(rateAfter100) || 30,
      minFareMin: Number(minFareMin) || 1500,
      minFareMax: Number(minFareMax) || 1800,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: Number(displayOrder) || 0,
    });

    await newVehicle.save();

    return NextResponse.json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle: newVehicle,
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
