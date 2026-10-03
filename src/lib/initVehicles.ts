import connectToDatabase from './db';
import Vehicle from '../models/Vehicle';

export const DEFAULT_VEHICLES = [
  {
    name: 'Tata Ace / Chota Hathi',
    capacity: '750 kg',
    dimensions: '7 ft x 4.8 ft x 4.8 ft',
    description: 'Best for narrow streets, local shop deliveries, shifting a single bed, fridge, or wardrobe.',
    tag: 'Most Popular',
    basePrice: 500,
    perKmPrice: 25,
    rateFirst100: 32,
    rateAfter100: 26,
    minFareMin: 1200,
    minFareMax: 1500,
    isActive: true,
    displayOrder: 1,
  },
  {
    name: 'Mahindra Pickup 1.3T',
    capacity: '1300 kg (1.3 Tons)',
    dimensions: '8 ft x 5.0 ft x 5.0 ft',
    description: 'Ideal for 1-2 BHK house shifting, bulky furniture, appliances, and commercial goods.',
    tag: 'Best Value',
    basePrice: 800,
    perKmPrice: 35,
    rateFirst100: 35,
    rateAfter100: 30,
    minFareMin: 1500,
    minFareMax: 1800,
    isActive: true,
    displayOrder: 2,
  },
  {
    name: '3-Wheeler Loader',
    capacity: '500 kg',
    dimensions: '5.5 ft x 4.0 ft x 4.0 ft',
    description: 'Quick & economical intra-city transport for small boxes, luggage, and shop inventory.',
    tag: 'Quick Delivery',
    basePrice: 350,
    perKmPrice: 20,
    rateFirst100: 25,
    rateAfter100: 20,
    minFareMin: 900,
    minFareMax: 1200,
    isActive: true,
    displayOrder: 3,
  },
  {
    name: '14 Ft Container Truck',
    capacity: '3500 kg (3.5 Tons)',
    dimensions: '14 ft x 6.0 ft x 6.5 ft',
    description: 'Waterproof & heavy-duty transport for full 2-3 BHK home shifting, office relocation, and machinery.',
    tag: 'Heavy Shifting',
    basePrice: 1500,
    perKmPrice: 50,
    rateFirst100: 48,
    rateAfter100: 40,
    minFareMin: 2000,
    minFareMax: 2400,
    isActive: true,
    displayOrder: 4,
  },
];

export async function ensureDefaultVehicles() {
  try {
    await connectToDatabase();

    const count = await Vehicle.countDocuments();
    if (count === 0) {
      console.log('Seeding default vehicle fleet into database...');
      await Vehicle.insertMany(DEFAULT_VEHICLES);
    }
  } catch (error) {
    console.error('Error seeding default vehicles:', error);
  }
}
