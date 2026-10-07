import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Driver from '@/models/Driver';
import FleetVehicle from '@/models/FleetVehicle';
import Trip from '@/models/Trip';
import DriverAttendance from '@/models/DriverAttendance';
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
    if (status && ['ACTIVE', 'INACTIVE'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const drivers = await Driver.find(query)
      .populate('assignedVehicleId', 'registrationNumber model vehicleType')
      .sort({ createdAt: -1 })
      .lean();

    const driverIds = drivers.map((d) => d._id);

    // Aggregate trips and collection for each driver
    const tripAggregates = await Trip.aggregate([
      { $match: { driverId: { $in: driverIds } } },
      {
        $group: {
          _id: '$driverId',
          totalTrips: { $sum: 1 },
          totalKm: { $sum: '$totalKm' },
          totalRevenue: { $sum: '$tripAmount' },
          driverCollected: { $sum: '$driverReceived' },
          managerCollected: { $sum: '$managerReceived' },
        },
      },
    ]);

    // Aggregate attendance counts
    const attendanceAggregates = await DriverAttendance.aggregate([
      { $match: { driverId: { $in: driverIds } } },
      {
        $group: {
          _id: '$driverId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ['$attendance', 'PRESENT'] }, 1, 0] },
          },
        },
      },
    ]);

    const tripMap = new Map();
    tripAggregates.forEach((item) => tripMap.set(item._id.toString(), item));

    const attMap = new Map();
    attendanceAggregates.forEach((item) => attMap.set(item._id.toString(), item));

    const enrichedDrivers = drivers.map((d) => {
      const tripStats = tripMap.get(d._id.toString()) || {
        totalTrips: 0,
        totalKm: 0,
        totalRevenue: 0,
        driverCollected: 0,
        managerCollected: 0,
      };
      const attStats = attMap.get(d._id.toString()) || {
        totalDays: 0,
        presentDays: 0,
      };
      return {
        ...d,
        stats: {
          ...tripStats,
          ...attStats,
        },
      };
    });

    return NextResponse.json({
      success: true,
      drivers: enrichedDrivers,
    });
  } catch (error) {
    console.error('Fetch drivers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch drivers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, licenseNumber, licenseExpiryDate, assignedVehicleId, status, remarks } = body;

    if (!fullName || !phone || !licenseNumber) {
      return NextResponse.json(
        { success: false, error: 'Full name, phone, and license number are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const formattedLicense = licenseNumber.trim().toUpperCase();
    const existing = await Driver.findOne({ licenseNumber: formattedLicense });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Driver with license ${formattedLicense} already exists` },
        { status: 400 }
      );
    }

    const newDriver = new Driver({
      fullName: fullName.trim(),
      phone: phone.trim(),
      licenseNumber: formattedLicense,
      licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : null,
      assignedVehicleId: assignedVehicleId || null,
      status: status || 'ACTIVE',
      remarks: remarks ? remarks.trim() : '',
    });

    await newDriver.save();

    // If assigned to a vehicle, update that vehicle's assignedDriverId
    if (assignedVehicleId) {
      await FleetVehicle.findByIdAndUpdate(assignedVehicleId, { assignedDriverId: newDriver._id });
    }

    return NextResponse.json({
      success: true,
      message: 'Driver added successfully',
      driver: newDriver,
    });
  } catch (error) {
    console.error('Create driver error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create driver' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, fullName, phone, licenseNumber, licenseExpiryDate, assignedVehicleId, status, remarks } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Driver ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const driver = await Driver.findById(id);
    if (!driver) {
      return NextResponse.json({ success: false, error: 'Driver not found' }, { status: 404 });
    }

    if (licenseNumber) {
      const formattedLicense = licenseNumber.trim().toUpperCase();
      const duplicate = await Driver.findOne({
        licenseNumber: formattedLicense,
        _id: { $ne: id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `License ${formattedLicense} is already used by another driver` },
          { status: 400 }
        );
      }
      driver.licenseNumber = formattedLicense;
    }

    if (fullName) driver.fullName = fullName.trim();
    if (phone) driver.phone = phone.trim();
    if (status) driver.status = status;
    driver.remarks = remarks !== undefined ? remarks.trim() : driver.remarks;
    if (licenseExpiryDate !== undefined) {
      driver.licenseExpiryDate = licenseExpiryDate ? new Date(licenseExpiryDate) : null;
    }

    const oldVehicleId = driver.assignedVehicleId?.toString();
    driver.assignedVehicleId = assignedVehicleId || null;

    await driver.save();

    // Sync FleetVehicle assignedDriverId
    if (oldVehicleId && oldVehicleId !== assignedVehicleId) {
      await FleetVehicle.findByIdAndUpdate(oldVehicleId, { assignedDriverId: null });
    }
    if (assignedVehicleId) {
      await FleetVehicle.findByIdAndUpdate(assignedVehicleId, { assignedDriverId: driver._id });
    }

    return NextResponse.json({
      success: true,
      message: 'Driver updated successfully',
      driver,
    });
  } catch (error) {
    console.error('Update driver error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update driver' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Driver ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const tripsCount = await Trip.countDocuments({ driverId: id });
    if (tripsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete driver with ${tripsCount} recorded trips. Consider setting status to INACTIVE instead.`,
        },
        { status: 400 }
      );
    }

    const driver = await Driver.findById(id);
    if (driver && driver.assignedVehicleId) {
      await FleetVehicle.findByIdAndUpdate(driver.assignedVehicleId, { assignedDriverId: null });
    }

    await Driver.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error) {
    console.error('Delete driver error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete driver' }, { status: 500 });
  }
}
