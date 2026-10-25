import connectToDatabase from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import { calculateFare } from '@/lib/fare';

export interface VehicleRate {
  name: string;
  capacity: string;
  dimensions: string;
  description: string;
  rateFirst100: number;
  rateAfter100: number;
  minFareMin: number;
  minFareMax: number;
}

// Fallback used only if the database is unreachable. Mirrors the live admin
// rates as of 2026-10-25; the database (admin > Rates) is the source of truth.
const FALLBACK_VEHICLES: VehicleRate[] = [
  {
    name: '3-Wheeler Loader',
    capacity: '500 kg',
    dimensions: '5.5 ft x 4.0 ft x 4.0 ft',
    description: 'Small boxes, luggage, a single bed, fridge or wardrobe.',
    rateFirst100: 25, rateAfter100: 20, minFareMin: 900, minFareMax: 1200,
  },
  {
    name: 'Tata Ace / Chota Hathi',
    capacity: '750 kg',
    dimensions: '7 ft x 4.8 ft x 4.8 ft',
    description: '1 RK or 1 BHK shifting, PG and student luggage, a few large items.',
    rateFirst100: 32, rateAfter100: 26, minFareMin: 1200, minFareMax: 1500,
  },
  {
    name: 'Mahindra Pickup',
    capacity: '1300 kg (1.3 Tons)',
    dimensions: '8 ft x 5.0 ft x 5.0 ft',
    description: '1-2 BHK house shifting, bulky furniture and appliances.',
    rateFirst100: 25, rateAfter100: 20, minFareMin: 1500, minFareMax: 1800,
  },
  {
    name: '14 Ft Container Truck',
    capacity: '3500 kg (3.5 Tons)',
    dimensions: '14 ft x 6.0 ft x 6.5 ft',
    description: 'Full 2-3 BHK home shifting and office relocation.',
    rateFirst100: 48, rateAfter100: 40, minFareMin: 2000, minFareMax: 2400,
  },
];

// Server-only: active vehicles in admin display order, with a safe fallback.
export async function getActiveVehicleRates(): Promise<VehicleRate[]> {
  try {
    await connectToDatabase();
    const docs = await Vehicle.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 }).lean();
    const rates = docs.map((v) => ({
      name: String(v.name),
      capacity: String(v.capacity),
      dimensions: String(v.dimensions),
      description: String(v.description),
      rateFirst100: Number(v.rateFirst100) || 0,
      rateAfter100: Number(v.rateAfter100) || 0,
      minFareMin: Number(v.minFareMin) || 0,
      minFareMax: Number(v.minFareMax) || 0,
    }));
    // Never publish a ₹0 price: skip vehicles whose rates were not set in admin.
    const priced = rates.filter((v) => v.rateFirst100 > 0 && v.rateAfter100 > 0 && v.minFareMin > 0 && v.minFareMax > 0);
    return priced.length ? priced : FALLBACK_VEHICLES;
  } catch (err) {
    console.error('Vehicle rates: using fallback', err);
    return FALLBACK_VEHICLES;
  }
}

// Same formula as the on-page Estimator, including the van's return trip.
export function estimateFareRange(distKm: number, v: VehicleRate): { min: number; max: number } {
  const { fareMin, fareMax } = calculateFare(distKm, v);
  return { min: fareMin, max: fareMax };
}

export function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}
