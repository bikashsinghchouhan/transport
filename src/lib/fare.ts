// Single source of truth for transport fares. Used by the on-page Estimator and
// the server-rendered price tables. Covered by src/lib/fare.test.ts.

export interface FareRates {
  /** ₹ per km for the first 100 km of the one-way trip. */
  rateFirst100: number;
  /** ₹ per km for every km after the first 100. */
  rateAfter100: number;
  /** Minimum fare range for the whole booking. */
  minFareMin: number;
  minFareMax: number;
}

export interface FareResult {
  distanceKm: number;
  /** Tiered per-km price for pickup (A) to drop (B). */
  oneWayFare: number;
  /** The van also drives back from B to A, so the one-way price is doubled. */
  roundTripFare: number;
  /** Estimate range shown to the customer, rounded to ₹100. */
  fareMin: number;
  fareMax: number;
}

export const TIER_BREAK_KM = 100;
export const ROUND_TRIP_MULTIPLIER = 2;

export function oneWayDistanceFare(distanceKm: number, rates: FareRates): number {
  const firstKm = Math.min(distanceKm, TIER_BREAK_KM);
  const extraKm = Math.max(distanceKm - TIER_BREAK_KM, 0);
  return firstKm * rates.rateFirst100 + extraKm * rates.rateAfter100;
}

export function calculateFare(distanceKm: number, rates: FareRates): FareResult {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new RangeError(`Invalid distance: ${distanceKm}`);
  }

  const oneWayFare = oneWayDistanceFare(distanceKm, rates);
  // Double AFTER the tiered calculation: price(A->B) x 2, not price(2 x distance).
  const roundTripFare = oneWayFare * ROUND_TRIP_MULTIPLIER;

  // Range of about ±3.5% (at least ₹150), rounded to the nearest ₹100.
  const variance = Math.max(150, Math.round((roundTripFare * 0.035) / 50) * 50);
  const rawMin = Math.round((roundTripFare - variance) / 100) * 100;
  const rawMax = Math.round((roundTripFare + variance) / 100) * 100;

  // Never quote below the vehicle's minimum fare.
  const fareMin = Math.max(rawMin, rates.minFareMin);
  const fareMax = Math.max(rawMax, rates.minFareMax, fareMin);

  return { distanceKm, oneWayFare, roundTripFare, fareMin, fareMax };
}
