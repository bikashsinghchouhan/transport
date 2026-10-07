import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Trip from '@/models/Trip';
import FleetVehicle from '@/models/FleetVehicle';
import Driver from '@/models/Driver';
import { getAuthAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Overall Aggregates
    const overallAgg = await Trip.aggregate([
      {
        $group: {
          _id: null,
          totalTrips: { $sum: 1 },
          totalKm: { $sum: '$totalKm' },
          grossRevenue: { $sum: '$tripAmount' },
          driverReceived: { $sum: '$driverReceived' },
          managerReceived: { $sum: '$managerReceived' },
          pendingReceivables: { $sum: '$pendingAmount' },
          totalExpenses: { $sum: '$totalVehicleExpense' },
          netProfit: { $sum: '$netBalance' },
          totalFuelExpense: { $sum: '$fuelExpense' },
          totalTollExpense: { $sum: '$tollExpense' },
          totalParkingExpense: { $sum: '$parkingExpense' },
          totalLoadingExpense: { $sum: '$loadingExpense' },
          totalRepairExpense: { $sum: '$repairExpense' },
          totalMaintenanceExpense: { $sum: '$maintenanceExpense' },
          totalOtherExpense: { $sum: '$otherExpense' },
        },
      },
    ]);

    const stats = overallAgg[0] || {
      totalTrips: 0,
      totalKm: 0,
      grossRevenue: 0,
      driverReceived: 0,
      managerReceived: 0,
      pendingReceivables: 0,
      totalExpenses: 0,
      netProfit: 0,
      totalFuelExpense: 0,
      totalTollExpense: 0,
      totalParkingExpense: 0,
      totalLoadingExpense: 0,
      totalRepairExpense: 0,
      totalMaintenanceExpense: 0,
      totalOtherExpense: 0,
    };

    const totalCollected = stats.driverReceived + stats.managerReceived;
    const collectionEfficiency =
      stats.grossRevenue > 0
        ? Math.round((totalCollected / stats.grossRevenue) * 1000) / 10
        : 0;

    const fuelCostPerKm =
      stats.totalKm > 0
        ? Math.round((stats.totalFuelExpense / stats.totalKm) * 100) / 100
        : 0;

    const avgRevenuePerTrip =
      stats.totalTrips > 0
        ? Math.round(stats.grossRevenue / stats.totalTrips)
        : 0;

    const avgProfitPerTrip =
      stats.totalTrips > 0
        ? Math.round(stats.netProfit / stats.totalTrips)
        : 0;

    // 2. Trend: Last 14 days daily revenue and expenses
    const now = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 13);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const trendAgg = await Trip.aggregate([
      { $match: { date: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          revenue: { $sum: '$tripAmount' },
          expense: { $sum: '$totalVehicleExpense' },
          trips: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build continuous 14-day array
    const trendMap = new Map();
    trendAgg.forEach((t) => trendMap.set(t._id, t));

    const trend14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const match = trendMap.get(dateStr);
      trend14Days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: match ? match.revenue : 0,
        expense: match ? match.expense : 0,
        trips: match ? match.trips : 0,
      });
    }

    // 3. Expense Breakdown by Category
    const expenseBreakdown = [
      { category: 'Fuel', amount: stats.totalFuelExpense, color: '#f59e0b' },
      { category: 'Toll', amount: stats.totalTollExpense, color: '#38bdf8' },
      { category: 'Parking', amount: stats.totalParkingExpense, color: '#a855f7' },
      { category: 'Loading', amount: stats.totalLoadingExpense, color: '#ec4899' },
      { category: 'Repair', amount: stats.totalRepairExpense, color: '#ef4444' },
      { category: 'Maintenance', amount: stats.totalMaintenanceExpense, color: '#f97316' },
      { category: 'Other', amount: stats.totalOtherExpense, color: '#64748b' },
    ];

    // 4. Vehicle Performance Comparison
    const vehicleComparison = await Trip.aggregate([
      {
        $group: {
          _id: '$vehicleId',
          trips: { $sum: 1 },
          totalKm: { $sum: '$totalKm' },
          revenue: { $sum: '$tripAmount' },
          expense: { $sum: '$totalVehicleExpense' },
          profit: { $sum: '$netBalance' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    const populatedVehicles = await FleetVehicle.populate(vehicleComparison, {
      path: '_id',
      select: 'registrationNumber model vehicleType',
    });

    const formattedVehiclePerf = (populatedVehicles as any[]).map((vp: any) => ({
      vehicleId: vp._id?._id || vp._id,
      registrationNumber: vp._id?.registrationNumber || 'Unknown',
      model: vp._id?.model || '',
      vehicleType: vp._id?.vehicleType || '',
      trips: vp.trips,
      totalKm: vp.totalKm,
      revenue: vp.revenue,
      expense: vp.expense,
      profit: vp.profit,
    }));

    // 5. Pending collections quick highlights
    const pendingTrips = await Trip.find({ pendingAmount: { $gt: 0 } })
      .populate('vehicleId', 'registrationNumber model')
      .populate('driverId', 'fullName phone')
      .sort({ pendingAmount: -1 })
      .limit(5)
      .lean();

    const pendingCount = await Trip.countDocuments({ pendingAmount: { $gt: 0 } });
    const totalVehiclesCount = await FleetVehicle.countDocuments();
    const totalDriversCount = await Driver.countDocuments();

    return NextResponse.json({
      success: true,
      kpis: {
        totalTrips: stats.totalTrips,
        totalKm: stats.totalKm,
        grossRevenue: stats.grossRevenue,
        totalExpenses: stats.totalExpenses,
        netProfit: stats.netProfit,
        pendingReceivables: stats.pendingReceivables,
        totalVehicles: totalVehiclesCount,
        totalDrivers: totalDriversCount,
      },
      performance: {
        fuelCostPerKm,
        collectionEfficiency,
        avgRevenuePerTrip,
        avgProfitPerTrip,
      },
      charts: {
        trend14Days,
        expenseBreakdown,
        vehiclePerformance: formattedVehiclePerf,
      },
      pendingReceivablesSummary: {
        totalAmount: stats.pendingReceivables,
        pendingCount,
        recentPending: pendingTrips,
      },
    });
  } catch (error) {
    console.error('Fetch fleet stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
