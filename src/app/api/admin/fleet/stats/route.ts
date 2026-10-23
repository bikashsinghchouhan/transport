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

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const dateRange = searchParams.get('dateRange') || '';

    // Date filtering logic (Start date inclusive, End date EXCLUSIVE)
    const matchStage: Record<string, any> = {};
    let startObj: Date | null = null;
    let endObj: Date | null = null;

    const now = new Date();

    if (dateRange === 'today') {
      startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    } else if (dateRange === 'yesterday') {
      startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      endObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (dateRange === 'thisWeek') {
      const day = now.getDay() || 7; // Monday = 1
      startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1, 0, 0, 0, 0);
      endObj = new Date(startObj.getFullYear(), startObj.getMonth(), startObj.getDate() + 7, 0, 0, 0, 0);
    } else if (dateRange === 'thisMonth') {
      startObj = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endObj = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    } else if (dateRange === 'lastMonth') {
      startObj = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endObj = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else if (startDate || endDate) {
      if (startDate) {
        const [sY, sM, sD] = startDate.split('-').map(Number);
        if (!isNaN(sY) && !isNaN(sM) && !isNaN(sD)) {
          startObj = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
        }
      }
      if (endDate) {
        const [eY, eM, eD] = endDate.split('-').map(Number);
        if (!isNaN(eY) && !isNaN(eM) && !isNaN(eD)) {
          // Rule: Start date is INCLUDED, End date is EXCLUDED ($lt)
          endObj = new Date(eY, eM - 1, eD, 0, 0, 0, 0);
        }
      }
    }

    if (startObj || endObj) {
      const dateFilter: Record<string, Date> = {};
      if (startObj) dateFilter.$gte = startObj;
      if (endObj) dateFilter.$lt = endObj; // Strictly less than end date
      matchStage.date = dateFilter;
    }

    // 1. Overall Aggregates with date filter
    const overallPipeline: any[] = [];
    if (matchStage.date) {
      overallPipeline.push({ $match: matchStage });
    }
    overallPipeline.push({
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
    });

    const overallAgg = await Trip.aggregate(overallPipeline);

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

    // 2. Trend: Revenue & Expenses over time
    const trendMatch: Record<string, any> = {};
    if (matchStage.date) {
      trendMatch.date = matchStage.date;
    } else {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(now.getDate() - 13);
      fourteenDaysAgo.setHours(0, 0, 0, 0);
      trendMatch.date = { $gte: fourteenDaysAgo };
    }

    const trendAgg = await Trip.aggregate([
      { $match: trendMatch },
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

    const trendMap = new Map();
    trendAgg.forEach((t) => trendMap.set(t._id, t));

    const trendDays: Array<{ date: string; label: string; revenue: number; expense: number; trips: number }> = [];

    if (startObj && endObj) {
      // Generate days between startObj and endObj (exclusive of endObj, capped at 60 days to prevent oversized response)
      const cur = new Date(startObj);
      const maxDays = 60;
      let count = 0;
      while (cur < endObj && count < maxDays) {
        const dateStr = cur.toISOString().split('T')[0];
        const match = trendMap.get(dateStr);
        trendDays.push({
          date: dateStr,
          label: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: match ? match.revenue : 0,
          expense: match ? match.expense : 0,
          trips: match ? match.trips : 0,
        });
        cur.setDate(cur.getDate() + 1);
        count++;
      }
    } else {
      // Default: Last 14 days
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const match = trendMap.get(dateStr);
        trendDays.push({
          date: dateStr,
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: match ? match.revenue : 0,
          expense: match ? match.expense : 0,
          trips: match ? match.trips : 0,
        });
      }
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
    const vehiclePipeline: any[] = [];
    if (matchStage.date) {
      vehiclePipeline.push({ $match: matchStage });
    }
    vehiclePipeline.push(
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
      { $limit: 10 }
    );

    const vehicleComparison = await Trip.aggregate(vehiclePipeline);

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
    const pendingQuery: Record<string, any> = { pendingAmount: { $gt: 0 } };
    if (matchStage.date) {
      pendingQuery.date = matchStage.date;
    }

    const pendingTrips = await Trip.find(pendingQuery)
      .populate('vehicleId', 'registrationNumber model')
      .populate('driverId', 'fullName phone')
      .sort({ pendingAmount: -1 })
      .limit(5)
      .lean();

    const pendingCount = await Trip.countDocuments(pendingQuery);
    const totalVehiclesCount = await FleetVehicle.countDocuments();
    const totalDriversCount = await Driver.countDocuments();

    const formatDateForDisplay = (d: Date | null) => {
      if (!d) return null;
      return d.toISOString().split('T')[0];
    };

    return NextResponse.json({
      success: true,
      filter: {
        startDate: startDate || formatDateForDisplay(startObj),
        endDate: endDate || formatDateForDisplay(endObj),
        dateRange: dateRange || 'all',
        isFiltered: Boolean(startObj || endObj),
      },
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
        trend14Days: trendDays,
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
