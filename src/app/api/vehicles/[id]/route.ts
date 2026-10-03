import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import { getAuthAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authAdmin = await getAuthAdmin(req);
    if (!authAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const updateData: Record<string, any> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.tag !== undefined) updateData.tag = body.tag;
    if (body.basePrice !== undefined) updateData.basePrice = Number(body.basePrice) || 0;
    if (body.perKmPrice !== undefined) updateData.perKmPrice = Number(body.perKmPrice) || 0;
    if (body.rateFirst100 !== undefined) updateData.rateFirst100 = Number(body.rateFirst100) || 0;
    if (body.rateAfter100 !== undefined) updateData.rateAfter100 = Number(body.rateAfter100) || 0;
    if (body.minFareMin !== undefined) updateData.minFareMin = Number(body.minFareMin) || 0;
    if (body.minFareMax !== undefined) updateData.minFareMax = Number(body.minFareMax) || 0;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
    if (body.displayOrder !== undefined && !isNaN(Number(body.displayOrder))) {
      updateData.displayOrder = Number(body.displayOrder);
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedVehicle) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authAdmin = await getAuthAdmin(req);
    if (!authAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
