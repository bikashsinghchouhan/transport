import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrip extends Document {
  date: Date;
  driverId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  tripRoute: string;
  customerName: string;
  customerMobile: string;
  totalKm: number;
  tripAmount: number;
  driverReceived: number;
  managerReceived: number;
  pendingAmount: number;

  fuelExpense: number;
  tollExpense: number;
  parkingExpense: number;
  loadingExpense: number;
  repairExpense: number;
  maintenanceExpense: number;
  otherExpense: number;

  totalVehicleExpense: number;
  netBalance: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
  remarks?: string;

  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    date: {
      type: Date,
      required: [true, 'Trip date is required'],
      default: Date.now,
      index: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required'],
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'FleetVehicle',
      required: [true, 'Vehicle is required'],
      index: true,
    },
    tripRoute: {
      type: String,
      required: [true, 'Trip route is required'],
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerMobile: {
      type: String,
      required: [true, 'Customer mobile is required'],
      trim: true,
    },
    totalKm: {
      type: Number,
      required: [true, 'Total KM is required'],
      min: [0, 'Total KM cannot be negative'],
      default: 0,
    },
    tripAmount: {
      type: Number,
      required: [true, 'Trip amount is required'],
      min: [0, 'Trip amount cannot be negative'],
      default: 0,
    },
    driverReceived: {
      type: Number,
      min: [0, 'Driver received cannot be negative'],
      default: 0,
    },
    managerReceived: {
      type: Number,
      min: [0, 'Manager received cannot be negative'],
      default: 0,
    },
    pendingAmount: {
      type: Number,
      min: [0, 'Pending amount cannot be negative'],
      default: 0,
    },

    fuelExpense: {
      type: Number,
      min: 0,
      default: 0,
    },
    tollExpense: {
      type: Number,
      min: 0,
      default: 0,
    },
    parkingExpense: {
      type: Number,
      min: 0,
      default: 0,
    },
    loadingExpense: {
      type: Number,
      min: 0,
      default: 0,
    },
    repairExpense: {
      type: Number,
      min: 0,
      default: 0,
    },
    maintenanceExpense: {
      type: Number,
      min: 0,
      default: 0,
    },
    otherExpense: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalVehicleExpense: {
      type: Number,
      min: 0,
      default: 0,
    },
    netBalance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'PENDING'],
      default: 'PENDING',
      index: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trip: Model<ITrip> =
  mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);

export default Trip;
