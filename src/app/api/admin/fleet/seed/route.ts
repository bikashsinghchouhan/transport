import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import FleetVehicle from '@/models/FleetVehicle';
import Driver from '@/models/Driver';
import Trip from '@/models/Trip';
import DriverAttendance from '@/models/DriverAttendance';
import FleetExpense from '@/models/FleetExpense';
import TripPayment from '@/models/TripPayment';
import { getAuthAdmin } from '@/lib/auth';
import { calculateTripFinancials } from '@/lib/fleetCalculations';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check if fleet vehicles already exist
    const vehicleCount = await FleetVehicle.countDocuments();
    if (vehicleCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Fleet already contains data. Skipped re-seeding.',
      });
    }

    // 1. Create Starter Drivers
    const driver1 = await Driver.create({
      fullName: 'Rameshwar Mahato',
      phone: '7654722708',
      licenseNumber: 'JH0120190038411',
      licenseExpiryDate: new Date('2028-12-31'),
      status: 'ACTIVE',
      remarks: 'Senior driver, 8+ years experience, expert in long-distance heavy routes.',
    });

    const driver2 = await Driver.create({
      fullName: 'Sunil Kumar Soren',
      phone: '9835129482',
      licenseNumber: 'JH0520210081290',
      licenseExpiryDate: new Date('2029-06-15'),
      status: 'ACTIVE',
      remarks: 'Local intra-city logistics and swift house-shifting specialist.',
    });

    const driver3 = await Driver.create({
      fullName: 'Md. Imran Ansari',
      phone: '9123456789',
      licenseNumber: 'WB0220200054321',
      licenseExpiryDate: new Date('2027-04-10'),
      status: 'ACTIVE',
      remarks: 'Interstate commercial transport driver (Ranchi - Kolkata corridor).',
    });

    const driver4 = await Driver.create({
      fullName: 'Vikash Oraon',
      phone: '8789012345',
      licenseNumber: 'JH0120220011928',
      licenseExpiryDate: new Date('2030-01-20'),
      status: 'ACTIVE',
      remarks: 'Reliable and punctual, assigned to 3-wheeler / mini pickup.',
    });

    // 2. Create Starter Fleet Vehicles
    const vehicle1 = await FleetVehicle.create({
      registrationNumber: 'JH 01 AX 1024',
      model: 'Tata Ace Gold (Chota Hathi)',
      vehicleType: 'Mini Truck',
      status: 'ACTIVE',
      assignedDriverId: driver1._id,
      purchaseDate: new Date('2022-03-15'),
      remarks: 'Fitted with GPS tracking and high-grade tarp cover.',
    });

    const vehicle2 = await FleetVehicle.create({
      registrationNumber: 'JH 05 BC 8842',
      model: 'Mahindra Bolero Maxi Truck Plus',
      vehicleType: 'Pickup 1.3T',
      status: 'ACTIVE',
      assignedDriverId: driver2._id,
      purchaseDate: new Date('2023-01-10'),
      remarks: 'Regular monthly servicing done. Excellent mileage.',
    });

    const vehicle3 = await FleetVehicle.create({
      registrationNumber: 'WB 02 CZ 3311',
      model: 'Eicher Pro 2049 (14 Ft Container)',
      vehicleType: 'Container Truck',
      status: 'ACTIVE',
      assignedDriverId: driver3._id,
      purchaseDate: new Date('2021-08-20'),
      remarks: 'Heavy cargo & waterproof shifting container.',
    });

    const vehicle4 = await FleetVehicle.create({
      registrationNumber: 'JH 01 ET 6690',
      model: 'Piaggio Ape Extra LDX',
      vehicleType: '3-Wheeler Loader',
      status: 'ACTIVE',
      assignedDriverId: driver4._id,
      purchaseDate: new Date('2023-11-05'),
      remarks: 'Compact local marketplace delivery loader.',
    });

    // Update driver vehicle references
    await Driver.findByIdAndUpdate(driver1._id, { assignedVehicleId: vehicle1._id });
    await Driver.findByIdAndUpdate(driver2._id, { assignedVehicleId: vehicle2._id });
    await Driver.findByIdAndUpdate(driver3._id, { assignedVehicleId: vehicle3._id });
    await Driver.findByIdAndUpdate(driver4._id, { assignedVehicleId: vehicle4._id });

    // 3. Create Sample Historical Trips
    const sampleTrips = [
      {
        daysAgo: 1,
        driverId: driver1._id,
        vehicleId: vehicle1._id,
        tripRoute: 'Ranchi (Kanke) → Jamshedpur (Bistupur)',
        customerName: 'Prabhat Electricals Ltd',
        customerMobile: '9431102834',
        totalKm: 135,
        tripAmount: 6500,
        driverReceived: 3500,
        managerReceived: 3000,
        fuelExpense: 1400,
        tollExpense: 180,
        parkingExpense: 50,
        loadingExpense: 300,
        repairExpense: 0,
        maintenanceExpense: 0,
        otherExpense: 70,
        remarks: 'Delivered industrial wiring boxes on time.',
      },
      {
        daysAgo: 2,
        driverId: driver2._id,
        vehicleId: vehicle2._id,
        tripRoute: 'Ranchi (Doranda) → Ramgarh Cantt',
        customerName: 'Anand Kumar Singh',
        customerMobile: '9835012345',
        totalKm: 55,
        tripAmount: 3800,
        driverReceived: 1800,
        managerReceived: 1000,
        fuelExpense: 650,
        tollExpense: 90,
        parkingExpense: 0,
        loadingExpense: 200,
        repairExpense: 0,
        maintenanceExpense: 0,
        otherExpense: 0,
        remarks: 'Household shifting (1 BHK). ₹1,000 pending on unloading.',
      },
      {
        daysAgo: 3,
        driverId: driver3._id,
        vehicleId: vehicle3._id,
        tripRoute: 'Ranchi (Namkum) → Bokaro Steel City',
        customerName: 'Steel City Fabricators',
        customerMobile: '9304123456',
        totalKm: 120,
        tripAmount: 11500,
        driverReceived: 5000,
        managerReceived: 4500,
        fuelExpense: 2400,
        tollExpense: 240,
        parkingExpense: 100,
        loadingExpense: 600,
        repairExpense: 0,
        maintenanceExpense: 0,
        otherExpense: 150,
        remarks: 'Heavy steel frames delivered safely with container truck.',
      },
      {
        daysAgo: 5,
        driverId: driver4._id,
        vehicleId: vehicle4._id,
        tripRoute: 'Main Road Daily Market → Harmu Housing Colony',
        customerName: 'Gupta Kirana Stores',
        customerMobile: '7004129876',
        totalKm: 18,
        tripAmount: 1200,
        driverReceived: 1200,
        managerReceived: 0,
        fuelExpense: 220,
        tollExpense: 0,
        parkingExpense: 20,
        loadingExpense: 100,
        repairExpense: 0,
        maintenanceExpense: 0,
        otherExpense: 0,
        remarks: 'FMCG goods intra-city distribution.',
      },
      {
        daysAgo: 7,
        driverId: driver1._id,
        vehicleId: vehicle1._id,
        tripRoute: 'Ranchi → Hazaribagh Bus Stand',
        customerName: 'Jharkhand Pharma Distributors',
        customerMobile: '9122334455',
        totalKm: 98,
        tripAmount: 4800,
        driverReceived: 2000,
        managerReceived: 1800,
        fuelExpense: 1100,
        tollExpense: 120,
        parkingExpense: 30,
        loadingExpense: 150,
        repairExpense: 0,
        maintenanceExpense: 0,
        otherExpense: 50,
        remarks: 'Medical supplies box delivery.',
      },
      {
        daysAgo: 10,
        driverId: driver3._id,
        vehicleId: vehicle3._id,
        tripRoute: 'Ranchi Industrial Area → Kolkata (Dankuni)',
        customerName: 'Eastern Logistics Hub',
        customerMobile: '9830099887',
        totalKm: 420,
        tripAmount: 28500,
        driverReceived: 12000,
        managerReceived: 10000,
        fuelExpense: 7200,
        tollExpense: 880,
        parkingExpense: 200,
        loadingExpense: 1200,
        repairExpense: 500,
        maintenanceExpense: 0,
        otherExpense: 300,
        remarks: 'Interstate high-value container trip.',
      },
    ];

    for (const t of sampleTrips) {
      const tripDate = new Date();
      tripDate.setDate(tripDate.getDate() - t.daysAgo);

      const calc = calculateTripFinancials({
        tripAmount: t.tripAmount,
        driverReceived: t.driverReceived,
        managerReceived: t.managerReceived,
        fuelExpense: t.fuelExpense,
        tollExpense: t.tollExpense,
        parkingExpense: t.parkingExpense,
        loadingExpense: t.loadingExpense,
        repairExpense: t.repairExpense,
        maintenanceExpense: t.maintenanceExpense,
        otherExpense: t.otherExpense,
        totalKm: t.totalKm,
      });

      const newTrip = await Trip.create({
        date: tripDate,
        driverId: t.driverId,
        vehicleId: t.vehicleId,
        tripRoute: t.tripRoute,
        customerName: t.customerName,
        customerMobile: t.customerMobile,
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
        remarks: t.remarks,
      });

      // Record payments
      if (calc.driverReceived > 0) {
        await TripPayment.create({
          tripId: newTrip._id,
          date: tripDate,
          amount: calc.driverReceived,
          paymentMode: 'CASH',
          collectedBy: 'DRIVER',
          remarks: 'Driver advance cash collection',
        });
      }
      if (calc.managerReceived > 0) {
        await TripPayment.create({
          tripId: newTrip._id,
          date: tripDate,
          amount: calc.managerReceived,
          paymentMode: 'UPI',
          collectedBy: 'MANAGER',
          remarks: 'Direct UPI transfer to manager',
        });
      }
    }

    // 4. Create sample attendance for today and yesterday
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await DriverAttendance.create([
      {
        date: todayStr,
        driverId: driver1._id,
        vehicleId: vehicle1._id,
        attendance: 'PRESENT',
        dutyStartTime: '08:00',
        dutyEndTime: '18:30',
        totalDutyHours: 10.5,
        signatureVerified: true,
        remarks: 'Reported on time at Kanke hub',
      },
      {
        date: todayStr,
        driverId: driver2._id,
        vehicleId: vehicle2._id,
        attendance: 'PRESENT',
        dutyStartTime: '08:30',
        dutyEndTime: '17:30',
        totalDutyHours: 9.0,
        signatureVerified: true,
        remarks: 'Duty performed normally',
      },
      {
        date: todayStr,
        driverId: driver3._id,
        vehicleId: vehicle3._id,
        attendance: 'PRESENT',
        dutyStartTime: '07:00',
        dutyEndTime: '20:00',
        totalDutyHours: 13.0,
        signatureVerified: true,
        remarks: 'Long haul route',
      },
      {
        date: todayStr,
        driverId: driver4._id,
        vehicleId: vehicle4._id,
        attendance: 'HALF_DAY',
        dutyStartTime: '09:00',
        dutyEndTime: '13:00',
        totalDutyHours: 4.0,
        signatureVerified: false,
        remarks: 'Personal urgent work in 2nd half',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Demo fleet vehicles, drivers, trips, and attendance successfully initialized!',
    });
  } catch (error) {
    console.error('Seed fleet error:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed demo fleet' }, { status: 500 });
  }
}
