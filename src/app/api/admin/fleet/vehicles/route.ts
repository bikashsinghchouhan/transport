import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FleetVehicle from '@/models/FleetVehicle';
import Driver from '@/models/Driver';
import Trip from '@/models/Trip';
import { getAuthAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const query: Record<string, unknown> = {};
    if (status && ['ACTIVE', 'IN_MAINTENANCE', 'INACTIVE'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { vehicleType: { $regex: search, $options: 'i' } },
      ];
    }

    const vehicles = await FleetVehicle.find(query)
      .populate('assignedDriverId', 'fullName phone licenseNumber')
      .sort({ createdAt: -1 })
      .lean();

    // Compute vehicle financial summary for each vehicle
    const vehicleIds = vehicles.map((v) => v._id);
    const tripAggregates = await Trip.aggregate([
      { $match: { vehicleId: { $in: vehicleIds } } },
      {
        $group: {
          _id: '$vehicleId',
          totalTrips: { $sum: 1 },
          totalKm: { $sum: '$totalKm' },
          totalRevenue: { $sum: '$tripAmount' },
          totalExpenses: { $sum: '$totalVehicleExpense' },
          totalNetProfit: { $sum: '$netBalance' },
          pendingReceivables: { $sum: '$pendingAmount' },
        },
      },
    ]);

    const statsMap = new Map();
    tripAggregates.forEach((item) => {
      statsMap.set(item._id.toString(), item);
    });

    const enrichedVehicles = vehicles.map((v) => {
      const stats = statsMap.get(v._id.toString()) || {
        totalTrips: 0,
        totalKm: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalNetProfit: 0,
        pendingReceivables: 0,
      };
      return {
        ...v,
        stats,
      };
    });

    return NextResponse.json({
      success: true,
      vehicles: enrichedVehicles,
    });
  } catch (error) {
    console.error('Fetch fleet vehicles error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch vehicles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { registrationNumber, model, vehicleType, status, assignedDriverId, purchaseDate, remarks } = body;

    if (!registrationNumber || !model) {
      return NextResponse.json(
        { success: false, error: 'Registration number and model are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const formattedRegNo = registrationNumber.trim().toUpperCase();
    const existing = await FleetVehicle.findOne({ registrationNumber: formattedRegNo });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Vehicle with registration number ${formattedRegNo} already exists` },
        { status: 400 }
      );
    }

    const newVehicle = new FleetVehicle({
      registrationNumber: formattedRegNo,
      model: model.trim(),
      vehicleType: vehicleType ? vehicleType.trim() : 'Mini Truck',
      status: status || 'ACTIVE',
      assignedDriverId: assignedDriverId || null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      remarks: remarks ? remarks.trim() : '',
    });

    await newVehicle.save();

    // If driver is assigned, update driver's assignedVehicleId as well
    if (assignedDriverId) {
      await Driver.findByIdAndUpdate(assignedDriverId, { assignedVehicleId: newVehicle._id });
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle: newVehicle,
    });
  } catch (error) {
    console.error('Create fleet vehicle error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create vehicle' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, registrationNumber, model, vehicleType, status, assignedDriverId, purchaseDate, remarks } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Vehicle ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const vehicle = await FleetVehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ success: false, error: 'Vehicle not found' }, { status: 404 });
    }

    if (registrationNumber) {
      const formattedRegNo = registrationNumber.trim().toUpperCase();
      const duplicate = await FleetVehicle.findOne({
        registrationNumber: formattedRegNo,
        _id: { $ne: id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `Vehicle with number ${formattedRegNo} already exists` },
          { status: 400 }
        );
      }
      vehicle.registrationNumber = formattedRegNo;
    }

    if (model) vehicle.model = model.trim();
    if (vehicleType) vehicle.vehicleType = vehicleType.trim();
    if (status) vehicle.status = status;
    vehicle.remarks = remarks !== undefined ? remarks.trim() : vehicle.remarks;
    if (purchaseDate !== undefined) {
      vehicle.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
    }

    const oldDriverId = vehicle.assignedDriverId?.toString();
    vehicle.assignedDriverId = assignedDriverId || null;

    await vehicle.save();

    // Sync driver assignedVehicleId
    if (oldDriverId && oldDriverId !== assignedDriverId) {
      await Driver.findByIdAndUpdate(oldDriverId, { assignedVehicleId: null });
    }
    if (assignedDriverId) {
      await Driver.findByIdAndUpdate(assignedDriverId, { assignedVehicleId: vehicle._id });
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    console.error('Update fleet vehicle error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Vehicle ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if vehicle has trips
    const tripsCount = await Trip.countDocuments({ vehicleId: id });
    if (tripsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete vehicle with ${tripsCount} recorded trips. Consider setting status to INACTIVE instead.`,
        },
        { status: 400 }
      );
    }

    const vehicle = await FleetVehicle.findById(id);
    if (vehicle && vehicle.assignedDriverId) {
      await Driver.findByIdAndUpdate(vehicle.assignedDriverId, { assignedVehicleId: null });
    }

    await FleetVehicle.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Delete fleet vehicle error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete vehicle' }, { status: 500 });
  }
}
