import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Trip from '@/models/Trip';
import FleetVehicle from '@/models/FleetVehicle';
import Driver from '@/models/Driver';
import FleetExpense from '@/models/FleetExpense';
import TripPayment from '@/models/TripPayment';
import { getAuthAdmin } from '@/lib/auth';
import { calculateTripFinancials } from '@/lib/fleetCalculations';

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
    const vehicleId = searchParams.get('vehicleId') || '';
    const driverId = searchParams.get('driverId') || '';
    const status = searchParams.get('status') || '';
    const dateRange = searchParams.get('dateRange') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const query: Record<string, unknown> = {};

    if (vehicleId) query.vehicleId = vehicleId;
    if (driverId) query.driverId = driverId;
    if (status && ['PAID', 'PARTIAL', 'PENDING'].includes(status)) {
      query.status = status;
    }

    // Date filtering logic
    const now = new Date();
    if (dateRange === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (dateRange === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const start = new Date(y.getFullYear(), y.getMonth(), y.getDate());
      const end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (dateRange === 'thisWeek') {
      const day = now.getDay() || 7; // Monday = 1
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (dateRange === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (dateRange === 'lastMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const ed = new Date(endDate);
        ed.setHours(23, 59, 59, 999);
        dateFilter.$lte = ed;
      }
      query.date = dateFilter;
    }

    // Text search query
    if (search) {
      // Find matching vehicles and drivers first
      const [matchingVehicles, matchingDrivers] = await Promise.all([
        FleetVehicle.find({ registrationNumber: { $regex: search, $options: 'i' } }).select('_id'),
        Driver.find({ fullName: { $regex: search, $options: 'i' } }).select('_id'),
      ]);

      const vehicleIds = matchingVehicles.map((v) => v._id);
      const driverIds = matchingDrivers.map((d) => d._id);

      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerMobile: { $regex: search, $options: 'i' } },
        { tripRoute: { $regex: search, $options: 'i' } },
        { vehicleId: { $in: vehicleIds } },
        { driverId: { $in: driverIds } },
      ];
    }

    const trips = await Trip.find(query)
      .populate('vehicleId', 'registrationNumber model vehicleType')
      .populate('driverId', 'fullName phone licenseNumber')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      trips,
    });
  } catch (error) {
    console.error('Fetch trips error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      date,
      driverId,
      vehicleId,
      tripRoute,
      customerName,
      customerMobile,
      totalKm,
      tripAmount,
      driverReceived,
      managerReceived,
      fuelExpense,
      tollExpense,
      parkingExpense,
      loadingExpense,
      repairExpense,
      maintenanceExpense,
      otherExpense,
      remarks,
    } = body;

    // Strict validation
    if (!driverId || !vehicleId) {
      return NextResponse.json({ success: false, error: 'Driver and Vehicle are required' }, { status: 400 });
    }
    if (!tripRoute || !customerName || !customerMobile) {
      return NextResponse.json(
        { success: false, error: 'Trip route, customer name, and customer mobile are required' },
        { status: 400 }
      );
    }
    if (Number(totalKm) < 0 || Number(tripAmount) < 0) {
      return NextResponse.json({ success: false, error: 'KM and Trip Amount cannot be negative' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify driver & vehicle existence
    const [driverExists, vehicleExists] = await Promise.all([
      Driver.findById(driverId),
      FleetVehicle.findById(vehicleId),
    ]);

    if (!driverExists) {
      return NextResponse.json({ success: false, error: 'Selected driver does not exist' }, { status: 400 });
    }
    if (!vehicleExists) {
      return NextResponse.json({ success: false, error: 'Selected vehicle does not exist' }, { status: 400 });
    }

    // Server-authoritative calculation
    const calc = calculateTripFinancials({
      tripAmount,
      driverReceived,
      managerReceived,
      fuelExpense,
      tollExpense,
      parkingExpense,
      loadingExpense,
      repairExpense,
      maintenanceExpense,
      otherExpense,
      totalKm,
    });

    const tripDate = date ? new Date(date) : new Date();

    const newTrip = new Trip({
      date: tripDate,
      driverId,
      vehicleId,
      tripRoute: tripRoute.trim(),
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      totalKm: calc.totalKm,
      tripAmount: calc.tripAmount,
      driverReceived: calc.driverReceived,
      managerReceived: calc.managerReceived,
      pendingAmount: calc.pendingAmount,
      fuelExpense: calc.fuelExpense,
      tollExpense: calc.tollExpense,
      parkingExpense: calc.parkingExpense,
      loadingExpense: calc.loadingExpense,
      repairExpense: calc.repairExpense,
      maintenanceExpense: calc.maintenanceExpense,
      otherExpense: calc.otherExpense,
      totalVehicleExpense: calc.totalVehicleExpense,
      netBalance: calc.netBalance,
      status: calc.status,
      remarks: remarks ? remarks.trim() : '',
    });

    await newTrip.save();

    // Create traceable FleetExpense entries if expenses were logged with the trip
    const expenseEntries = [
      { category: 'Fuel', amount: calc.fuelExpense },
      { category: 'Toll', amount: calc.tollExpense },
      { category: 'Parking', amount: calc.parkingExpense },
      { category: 'Loading', amount: calc.loadingExpense },
      { category: 'Repair', amount: calc.repairExpense },
      { category: 'Maintenance', amount: calc.maintenanceExpense },
      { category: 'Other', amount: calc.otherExpense },
    ].filter((e) => e.amount > 0);

    if (expenseEntries.length > 0) {
      const expensesToInsert = expenseEntries.map((e) => ({
        vehicleId,
        driverId,
        tripId: newTrip._id,
        date: tripDate,
        category: e.category,
        amount: e.amount,
        remarks: `Trip expense: ${tripRoute}`,
      }));
      await FleetExpense.insertMany(expensesToInsert);
    }

    // If driver or manager received money upfront, create an initial payment transaction log
    if (calc.driverReceived > 0) {
      await TripPayment.create({
        tripId: newTrip._id,
        date: tripDate,
        amount: calc.driverReceived,
        paymentMode: 'CASH',
        collectedBy: 'DRIVER',
        remarks: 'Collected by driver upon trip booking/completion',
      });
    }
    if (calc.managerReceived > 0) {
      await TripPayment.create({
        tripId: newTrip._id,
        date: tripDate,
        amount: calc.managerReceived,
        paymentMode: 'CASH',
        collectedBy: 'MANAGER',
        remarks: 'Received directly by manager',
      });
    }

    const populatedTrip = await Trip.findById(newTrip._id)
      .populate('vehicleId', 'registrationNumber model vehicleType')
      .populate('driverId', 'fullName phone licenseNumber');

    return NextResponse.json({
      success: true,
      message: 'Trip recorded successfully',
      trip: populatedTrip,
    });
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record trip' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Trip ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    // Merge financial fields and calculate authoritative totals
    const merged = {
      tripAmount: updates.tripAmount !== undefined ? updates.tripAmount : trip.tripAmount,
      driverReceived: updates.driverReceived !== undefined ? updates.driverReceived : trip.driverReceived,
      managerReceived: updates.managerReceived !== undefined ? updates.managerReceived : trip.managerReceived,
      fuelExpense: updates.fuelExpense !== undefined ? updates.fuelExpense : trip.fuelExpense,
      tollExpense: updates.tollExpense !== undefined ? updates.tollExpense : trip.tollExpense,
      parkingExpense: updates.parkingExpense !== undefined ? updates.parkingExpense : trip.parkingExpense,
      loadingExpense: updates.loadingExpense !== undefined ? updates.loadingExpense : trip.loadingExpense,
      repairExpense: updates.repairExpense !== undefined ? updates.repairExpense : trip.repairExpense,
      maintenanceExpense: updates.maintenanceExpense !== undefined ? updates.maintenanceExpense : trip.maintenanceExpense,
      otherExpense: updates.otherExpense !== undefined ? updates.otherExpense : trip.otherExpense,
      totalKm: updates.totalKm !== undefined ? updates.totalKm : trip.totalKm,
    };

    const calc = calculateTripFinancials(merged);

    if (updates.date) trip.date = new Date(updates.date);
    if (updates.driverId) trip.driverId = updates.driverId;
    if (updates.vehicleId) trip.vehicleId = updates.vehicleId;
    if (updates.tripRoute) trip.tripRoute = updates.tripRoute.trim();
    if (updates.customerName) trip.customerName = updates.customerName.trim();
    if (updates.customerMobile) trip.customerMobile = updates.customerMobile.trim();
    if (updates.remarks !== undefined) trip.remarks = updates.remarks.trim();

    trip.totalKm = calc.totalKm;
    trip.tripAmount = calc.tripAmount;
    trip.driverReceived = calc.driverReceived;
    trip.managerReceived = calc.managerReceived;
    trip.pendingAmount = calc.pendingAmount;
    trip.fuelExpense = calc.fuelExpense;
    trip.tollExpense = calc.tollExpense;
    trip.parkingExpense = calc.parkingExpense;
    trip.loadingExpense = calc.loadingExpense;
    trip.repairExpense = calc.repairExpense;
    trip.maintenanceExpense = calc.maintenanceExpense;
    trip.otherExpense = calc.otherExpense;
    trip.totalVehicleExpense = calc.totalVehicleExpense;
    trip.netBalance = calc.netBalance;
    trip.status = calc.status;

    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'registrationNumber model vehicleType')
      .populate('driverId', 'fullName phone licenseNumber');

    return NextResponse.json({
      success: true,
      message: 'Trip updated successfully',
      trip: populatedTrip,
    });
  } catch (error) {
    console.error('Update trip error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update trip' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Trip ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    await Promise.all([
      Trip.findByIdAndDelete(id),
      FleetExpense.deleteMany({ tripId: id }),
      TripPayment.deleteMany({ tripId: id }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    console.error('Delete trip error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete trip' }, { status: 500 });
  }
}
