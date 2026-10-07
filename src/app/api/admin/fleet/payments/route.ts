import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Trip from '@/models/Trip';
import TripPayment from '@/models/TripPayment';
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
    const tripId = searchParams.get('tripId');

    if (tripId) {
      // Return payment history for a specific trip
      const payments = await TripPayment.find({ tripId }).sort({ date: -1 });
      return NextResponse.json({ success: true, payments });
    }

    // Return all trips with pending payments
    const pendingTrips = await Trip.find({ pendingAmount: { $gt: 0 } })
      .populate('vehicleId', 'registrationNumber model')
      .populate('driverId', 'fullName phone')
      .sort({ pendingAmount: -1, date: -1 })
      .lean();

    const totalPendingAmount = pendingTrips.reduce((sum, t) => sum + (t.pendingAmount || 0), 0);
    const uniqueCustomers = new Set(pendingTrips.map((t) => t.customerMobile || t.customerName)).size;

    return NextResponse.json({
      success: true,
      pendingTrips,
      totalPendingAmount,
      totalPendingTrips: pendingTrips.length,
      uniqueCustomers,
    });
  } catch (error) {
    console.error('Fetch pending payments error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pending payments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tripId, amount, paymentMode, collectedBy, remarks, date } = body;

    if (!tripId) {
      return NextResponse.json({ success: false, error: 'Trip ID is required' }, { status: 400 });
    }

    const payAmount = sanitizeNonNegative(amount);
    if (payAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Payment amount must be greater than zero' }, { status: 400 });
    }

    await connectToDatabase();

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    // Business rule: prevent overpayment beyond pending amount unless necessary
    if (payAmount > trip.pendingAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment amount (₹${payAmount}) cannot exceed pending amount (₹${trip.pendingAmount})`,
        },
        { status: 400 }
      );
    }

    // 1. Record the payment transaction
    const newPayment = new TripPayment({
      tripId,
      date: date ? new Date(date) : new Date(),
      amount: payAmount,
      paymentMode: paymentMode || 'CASH',
      collectedBy: collectedBy || 'MANAGER',
      remarks: remarks ? remarks.trim() : '',
    });
    await newPayment.save();

    // 2. Authoritatively update Trip collected and pending amounts
    if (collectedBy === 'DRIVER') {
      trip.driverReceived = Math.round((trip.driverReceived + payAmount) * 100) / 100;
    } else {
      trip.managerReceived = Math.round((trip.managerReceived + payAmount) * 100) / 100;
    }

    const totalCollected = trip.driverReceived + trip.managerReceived;
    trip.pendingAmount = Math.max(0, Math.round((trip.tripAmount - totalCollected) * 100) / 100);

    if (totalCollected >= trip.tripAmount && trip.tripAmount > 0) {
      trip.status = 'PAID';
    } else if (totalCollected > 0) {
      trip.status = 'PARTIAL';
    } else {
      trip.status = 'PENDING';
    }

    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicleId', 'registrationNumber model')
      .populate('driverId', 'fullName phone');

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${payAmount} recorded successfully`,
      trip: populatedTrip,
      payment: newPayment,
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 });
  }
}
