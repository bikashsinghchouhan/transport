import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FleetExpense from '@/models/FleetExpense';
import FleetVehicle from '@/models/FleetVehicle';
import Driver from '@/models/Driver';
import { getAuthAdmin } from '@/lib/auth';
import { sanitizeNonNegative } from '@/lib/fleetCalculations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');
    const driverId = searchParams.get('driverId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: Record<string, unknown> = {};
    if (vehicleId) query.vehicleId = vehicleId;
    if (driverId) query.driverId = driverId;
    if (category) query.category = category;

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const ed = new Date(endDate);
        ed.setHours(23, 59, 59, 999);
        dateFilter.$lte = ed;
      }
      query.date = dateFilter;
    }

    const expenses = await FleetExpense.find(query)
      .populate('vehicleId', 'registrationNumber model')
      .populate('driverId', 'fullName phone')
      .populate('tripId', 'tripRoute customerName')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return NextResponse.json({
      success: true,
      expenses,
      totalAmount,
    });
  } catch (error) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vehicleId, driverId, tripId, date, category, amount, remarks } = body;

    if (!vehicleId || !category) {
      return NextResponse.json({ success: false, error: 'Vehicle and Category are required' }, { status: 400 });
    }

    const validCategories = ['Fuel', 'Toll', 'Parking', 'Loading', 'Repair', 'Maintenance', 'Other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ success: false, error: 'Invalid expense category' }, { status: 400 });
    }

    const sanitizedAmount = sanitizeNonNegative(amount);
    if (sanitizedAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be greater than zero' }, { status: 400 });
    }

    await connectToDatabase();

    const newExpense = new FleetExpense({
      vehicleId,
      driverId: driverId || null,
      tripId: tripId || null,
      date: date ? new Date(date) : new Date(),
      category,
      amount: sanitizedAmount,
      remarks: remarks ? remarks.trim() : '',
    });

    await newExpense.save();

    const populated = await FleetExpense.findById(newExpense._id)
      .populate('vehicleId', 'registrationNumber model')
      .populate('driverId', 'fullName phone');

    return NextResponse.json({
      success: true,
      message: 'Expense recorded successfully',
      expense: populated,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create expense' }, { status: 500 });
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
      return NextResponse.json({ success: false, error: 'Expense ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    await FleetExpense.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete expense' }, { status: 500 });
  }
}
