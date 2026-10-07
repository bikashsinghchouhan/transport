import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Trip from '@/models/Trip';
import FleetVehicle from '@/models/FleetVehicle';
import Driver from '@/models/Driver';
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
    const reportType = searchParams.get('type') || 'vehicle'; // 'vehicle' | 'driver' | 'daily' | 'monthly'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const matchQuery: Record<string, unknown> = {};
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const ed = new Date(endDate);
        ed.setHours(23, 59, 59, 999);
        dateFilter.$lte = ed;
      }
      matchQuery.date = dateFilter;
    }

    if (reportType === 'vehicle') {
      const agg = await Trip.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$vehicleId',
            trips: { $sum: 1 },
            totalKm: { $sum: '$totalKm' },
            revenue: { $sum: '$tripAmount' },
            expenses: { $sum: '$totalVehicleExpense' },
            profit: { $sum: '$netBalance' },
            pending: { $sum: '$pendingAmount' },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      const populated = await FleetVehicle.populate(agg, {
        path: '_id',
        select: 'registrationNumber model vehicleType',
      });

      const report = (populated as any[]).map((item: any) => ({
        id: item._id?._id || item._id,
        vehicle: item._id?.registrationNumber || 'Unknown Vehicle',
        model: item._id?.model || '',
        vehicleType: item._id?.vehicleType || '',
        trips: item.trips,
        totalKm: item.totalKm,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.profit,
        pending: item.pending,
      }));

      return NextResponse.json({ success: true, type: 'vehicle', report });
    }

    if (reportType === 'driver') {
      const agg = await Trip.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$driverId',
            trips: { $sum: 1 },
            totalKm: { $sum: '$totalKm' },
            revenue: { $sum: '$tripAmount' },
            driverCollected: { $sum: '$driverReceived' },
            managerCollected: { $sum: '$managerReceived' },
            expenses: { $sum: '$totalVehicleExpense' },
          },
        },
        { $sort: { trips: -1 } },
      ]);

      const populated = await Driver.populate(agg, {
        path: '_id',
        select: 'fullName phone licenseNumber',
      });

      // Attendance present count
      const attendanceAgg = await DriverAttendance.aggregate([
        {
          $group: {
            _id: '$driverId',
            presentDays: {
              $sum: { $cond: [{ $eq: ['$attendance', 'PRESENT'] }, 1, 0] },
            },
          },
        },
      ]);
      const attMap = new Map();
      attendanceAgg.forEach((a) => attMap.set(a._id.toString(), a.presentDays));

      const report = (populated as any[]).map((item: any) => {
        const dId = item._id?._id ? item._id._id.toString() : item._id ? item._id.toString() : '';
        return {
          id: dId,
          driver: item._id?.fullName || 'Unknown Driver',
          phone: item._id?.phone || '',
          licenseNumber: item._id?.licenseNumber || '',
          trips: item.trips,
          attendance: attMap.get(dId) || 0,
          totalKm: item.totalKm,
          revenue: item.revenue,
          collection: item.driverCollected + item.managerCollected,
          driverCollected: item.driverCollected,
        };
      });

      return NextResponse.json({ success: true, type: 'driver', report });
    }

    if (reportType === 'daily') {
      const agg = await Trip.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            trips: { $sum: 1 },
            totalKm: { $sum: '$totalKm' },
            revenue: { $sum: '$tripAmount' },
            expenses: { $sum: '$totalVehicleExpense' },
            profit: { $sum: '$netBalance' },
            pending: { $sum: '$pendingAmount' },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      const report = agg.map((item) => ({
        date: item._id,
        trips: item.trips,
        totalKm: item.totalKm,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.profit,
        pending: item.pending,
      }));

      return NextResponse.json({ success: true, type: 'daily', report });
    }

    if (reportType === 'monthly') {
      const agg = await Trip.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
            trips: { $sum: 1 },
            totalKm: { $sum: '$totalKm' },
            revenue: { $sum: '$tripAmount' },
            expenses: { $sum: '$totalVehicleExpense' },
            profit: { $sum: '$netBalance' },
            pending: { $sum: '$pendingAmount' },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      const report = agg.map((item) => ({
        month: item._id,
        trips: item.trips,
        totalKm: item.totalKm,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.profit,
        pending: item.pending,
      }));

      return NextResponse.json({ success: true, type: 'monthly', report });
    }

    return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
  } catch (error) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 });
  }
}
