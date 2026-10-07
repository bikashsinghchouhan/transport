/**
 * Authoritative financial and operational calculations for Fleet Management
 */

export interface TripFinancialInput {
  tripAmount?: number | string;
  driverReceived?: number | string;
  managerReceived?: number | string;
  fuelExpense?: number | string;
  tollExpense?: number | string;
  parkingExpense?: number | string;
  loadingExpense?: number | string;
  repairExpense?: number | string;
  maintenanceExpense?: number | string;
  otherExpense?: number | string;
  totalKm?: number | string;
}

export interface TripFinancialResult {
  tripAmount: number;
  driverReceived: number;
  managerReceived: number;
  totalCollected: number;
  pendingAmount: number;
  fuelExpense: number;
  tollExpense: number;
  parkingExpense: number;
  loadingExpense: number;
  repairExpense: number;
  maintenanceExpense: number;
  otherExpense: number;
  totalKm: number;
  totalVehicleExpense: number;
  netBalance: number;
  collectionEfficiency: number;
  fuelCostPerKm: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
}

export function sanitizeNonNegative(val: unknown): number {
  const num = Number(val);
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100) / 100;
}

export function calculateTripFinancials(input: TripFinancialInput): TripFinancialResult {
  const tripAmount = sanitizeNonNegative(input.tripAmount);
  const driverReceived = sanitizeNonNegative(input.driverReceived);
  const managerReceived = sanitizeNonNegative(input.managerReceived);
  const totalCollected = Math.round((driverReceived + managerReceived) * 100) / 100;

  // Never allow negative pending amount
  const pendingAmount = Math.max(0, Math.round((tripAmount - totalCollected) * 100) / 100);

  const fuelExpense = sanitizeNonNegative(input.fuelExpense);
  const tollExpense = sanitizeNonNegative(input.tollExpense);
  const parkingExpense = sanitizeNonNegative(input.parkingExpense);
  const loadingExpense = sanitizeNonNegative(input.loadingExpense);
  const repairExpense = sanitizeNonNegative(input.repairExpense);
  const maintenanceExpense = sanitizeNonNegative(input.maintenanceExpense);
  const otherExpense = sanitizeNonNegative(input.otherExpense);

  const totalVehicleExpense = Math.round(
    (fuelExpense +
      tollExpense +
      parkingExpense +
      loadingExpense +
      repairExpense +
      maintenanceExpense +
      otherExpense) *
      100
  ) / 100;

  const netBalance = Math.round((tripAmount - totalVehicleExpense) * 100) / 100;

  // Handle division by zero safely
  const collectionEfficiency =
    tripAmount > 0 ? Math.round((totalCollected / tripAmount) * 1000) / 10 : 0;

  const totalKm = sanitizeNonNegative(input.totalKm);
  const fuelCostPerKm =
    totalKm > 0 ? Math.round((fuelExpense / totalKm) * 100) / 100 : 0;

  let status: 'PAID' | 'PARTIAL' | 'PENDING' = 'PENDING';
  if (tripAmount > 0 && totalCollected >= tripAmount) {
    status = 'PAID';
  } else if (totalCollected > 0) {
    status = 'PARTIAL';
  }

  return {
    tripAmount,
    driverReceived,
    managerReceived,
    totalCollected,
    pendingAmount,
    fuelExpense,
    tollExpense,
    parkingExpense,
    loadingExpense,
    repairExpense,
    maintenanceExpense,
    otherExpense,
    totalKm,
    totalVehicleExpense,
    netBalance,
    collectionEfficiency,
    fuelCostPerKm,
    status,
  };
}

export function calculateDutyHours(startTime?: string, endTime?: string): number {
  if (!startTime || !endTime) return 0;
  try {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;

    let startMins = sh * 60 + sm;
    let endMins = eh * 60 + em;

    if (endMins < startMins) {
      // Shift spanned across midnight
      endMins += 24 * 60;
    }

    const diff = (endMins - startMins) / 60;
    return Math.max(0, Math.round(diff * 10) / 10);
  } catch {
    return 0;
  }
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
