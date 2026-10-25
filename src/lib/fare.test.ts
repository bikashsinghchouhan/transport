import { describe, expect, it } from 'vitest';
import { calculateFare, oneWayDistanceFare, type FareRates } from './fare';

// Live admin rates as of 2026-10-25.
const tataAce: FareRates = { rateFirst100: 32, rateAfter100: 26, minFareMin: 1200, minFareMax: 1500 };
const pickup: FareRates = { rateFirst100: 25, rateAfter100: 20, minFareMin: 1500, minFareMax: 1800 };
const threeWheeler: FareRates = { rateFirst100: 25, rateAfter100: 20, minFareMin: 900, minFareMax: 1200 };
const truck14ft: FareRates = { rateFirst100: 48, rateAfter100: 40, minFareMin: 2000, minFareMax: 2400 };
const allVehicles = [tataAce, pickup, threeWheeler, truck14ft];

describe('oneWayDistanceFare (tiered per-km price for A to B)', () => {
  it('charges the first-100-km rate for trips up to 100 km', () => {
    expect(oneWayDistanceFare(50, tataAce)).toBe(1600); // 50 x 32
    expect(oneWayDistanceFare(100, tataAce)).toBe(3200); // 100 x 32
  });

  it('charges the lower rate only for km beyond 100', () => {
    expect(oneWayDistanceFare(101, tataAce)).toBe(3226); // 3200 + 1 x 26
    expect(oneWayDistanceFare(150, tataAce)).toBe(4500); // 3200 + 50 x 26
    expect(oneWayDistanceFare(250, truck14ft)).toBe(10800); // 100 x 48 + 150 x 40
  });

  it('is 0 for a 0 km trip', () => {
    expect(oneWayDistanceFare(0, tataAce)).toBe(0);
  });
});

describe('calculateFare (van goes A to B and returns, so the price is doubled)', () => {
  it('doubles the per-km price for a 100 km trip (user example)', () => {
    const fare = calculateFare(100, tataAce);
    expect(fare.oneWayFare).toBe(3200);
    expect(fare.roundTripFare).toBe(6400); // 3200 x 2
  });

  it('doubles after the tiered calculation, not by doubling the distance', () => {
    // 150 km: (3200 + 50 x 26) x 2 = 9000.
    // Doubling distance first would give 3200 + 200 x 26 = 8400, which is wrong.
    expect(calculateFare(150, tataAce).roundTripFare).toBe(9000);
  });

  it('builds the estimate range around the round-trip price', () => {
    // 6400 -> variance max(150, round(6400 x 0.035 / 50) x 50) = 200
    expect(calculateFare(100, tataAce)).toMatchObject({ fareMin: 6200, fareMax: 6600 });
    // 9000 -> variance round(315 / 50) x 50 = 300
    expect(calculateFare(150, tataAce)).toMatchObject({ fareMin: 8700, fareMax: 9300 });
    // 250 km 14 ft truck: 10800 x 2 = 21600 -> variance round(756 / 50) x 50 = 750
    expect(calculateFare(250, truck14ft)).toMatchObject({ roundTripFare: 21600, fareMin: 20900, fareMax: 22400 });
  });

  it('never goes below the vehicle minimum fare on short trips', () => {
    // 10 km: 320 x 2 = 640, below the minimum.
    expect(calculateFare(10, tataAce)).toMatchObject({ roundTripFare: 640, fareMin: 1200, fareMax: 1500 });
    // 20 km: 1280 -> raw range 1100..1400, floored to 1200..1500.
    expect(calculateFare(20, tataAce)).toMatchObject({ fareMin: 1200, fareMax: 1500 });
    expect(calculateFare(0, truck14ft)).toMatchObject({ roundTripFare: 0, fareMin: 2000, fareMax: 2400 });
  });

  it('lets the round-trip price rise above the minimum once it is larger', () => {
    // 25 km: 800 x 2 = 1600 -> range 1500..1800 (minimum is 1200..1500).
    expect(calculateFare(25, tataAce)).toMatchObject({ roundTripFare: 1600, fareMin: 1500, fareMax: 1800 });
  });

  it('returns whole-rupee prices rounded to the nearest 100', () => {
    for (const v of allVehicles) {
      for (let km = 0; km <= 1000; km += 7) {
        const { fareMin, fareMax } = calculateFare(km, v);
        expect(Number.isInteger(fareMin)).toBe(true);
        expect(Number.isInteger(fareMax)).toBe(true);
        if (fareMin !== v.minFareMin) expect(fareMin % 100).toBe(0);
        if (fareMax !== v.minFareMax) expect(fareMax % 100).toBe(0);
      }
    }
  });

  it('always keeps min <= round-trip-based max and never decreases with distance', () => {
    for (const v of allVehicles) {
      let previousMax = 0;
      for (let km = 0; km <= 1000; km++) {
        const fare = calculateFare(km, v);
        expect(fare.roundTripFare).toBe(fare.oneWayFare * 2);
        expect(fare.fareMin).toBeLessThanOrEqual(fare.fareMax);
        expect(fare.fareMin).toBeGreaterThanOrEqual(v.minFareMin);
        expect(fare.fareMax).toBeGreaterThanOrEqual(previousMax);
        previousMax = fare.fareMax;
      }
    }
  });

  it('keeps min <= max even if admin minimums are entered the wrong way round', () => {
    const bad: FareRates = { rateFirst100: 30, rateAfter100: 25, minFareMin: 2000, minFareMax: 1500 };
    const fare = calculateFare(10, bad);
    expect(fare.fareMin).toBeLessThanOrEqual(fare.fareMax);
  });

  it('rejects invalid distances', () => {
    expect(() => calculateFare(-1, tataAce)).toThrow(RangeError);
    expect(() => calculateFare(Number.NaN, tataAce)).toThrow(RangeError);
    expect(() => calculateFare(Number.POSITIVE_INFINITY, tataAce)).toThrow(RangeError);
  });
});
