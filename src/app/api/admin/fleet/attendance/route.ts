import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import DriverAttendance from '@/models/DriverAttendance';
import Driver from '@/models/Driver';
import { getAuthAdmin } from '@/lib/auth';
import { calculateDutyHours } from '@/lib/fleetCalculations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date'); // YYYY-MM-DD
    const driverId = searchParams.get('driverId');

    const todayStr = new Date().toISOString().split('T')[0];
    const targetDate = dateParam || todayStr;

    // Fetch all active drivers
    const drivers = await Driver.find({ status: 'ACTIVE' })
      .populate('assignedVehicleId', 'registrationNumber model vehicleType')
      .sort({ fullName: 1 })
      .lean();

    // Query attendance records for the date
    const attendanceQuery: Record<string, unknown> = { date: targetDate };
    if (driverId) attendanceQuery.driverId = driverId;

    const attendances = await DriverAttendance.find(attendanceQuery)
      .populate('driverId', 'fullName phone licenseNumber')
      .populate('vehicleId', 'registrationNumber model')
      .lean();

    const attendanceMap = new Map();
    attendances.forEach((att) => {
      const dId = att.driverId?._id ? att.driverId._id.toString() : att.driverId?.toString();
      attendanceMap.set(dId, att);
    });

    // Merge drivers with attendance status for the selected date
    const roster = drivers.map((driver) => {
      const existing = attendanceMap.get(driver._id.toString());
      return {
        driver: {
          _id: driver._id,
          fullName: driver.fullName,
          phone: driver.phone,
          licenseNumber: driver.licenseNumber,
          assignedVehicle: driver.assignedVehicleId,
        },
        attendanceRecord: existing || null,
        status: existing ? existing.attendance : 'ABSENT',
        dutyStartTime: existing ? existing.dutyStartTime || '' : '',
        dutyEndTime: existing ? existing.dutyEndTime || '' : '',
        totalDutyHours: existing ? existing.totalDutyHours || 0 : 0,
        remarks: existing ? existing.remarks || '' : '',
      };
    });

    return NextResponse.json({
      success: true,
      date: targetDate,
      roster,
      summary: {
        totalDrivers: drivers.length,
        present: roster.filter((r) => r.status === 'PRESENT').length,
        absent: roster.filter((r) => r.status === 'ABSENT').length,
        halfDay: roster.filter((r) => r.status === 'HALF_DAY').length,
        leave: roster.filter((r) => r.status === 'LEAVE').length,
      },
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { driverId, date, attendance, dutyStartTime, dutyEndTime, remarks, vehicleId } = body;

    if (!driverId || !date) {
      return NextResponse.json({ success: false, error: 'Driver and Date are required' }, { status: 400 });
    }

    await connectToDatabase();

    const totalDutyHours = calculateDutyHours(dutyStartTime, dutyEndTime);

    // Upsert to enforce unique driver + date record
    const updated = await DriverAttendance.findOneAndUpdate(
      { driverId, date },
      {
        driverId,
        date,
        attendance: attendance || 'PRESENT',
        dutyStartTime: dutyStartTime || '',
        dutyEndTime: dutyEndTime || '',
        totalDutyHours,
        vehicleId: vehicleId || null,
        remarks: remarks || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      attendance: updated,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record attendance' }, { status: 500 });
  }
}
