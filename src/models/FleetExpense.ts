import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFleetExpense extends Document {
  vehicleId: mongoose.Types.ObjectId;
  tripId?: mongoose.Types.ObjectId | null;
  driverId?: mongoose.Types.ObjectId | null;
  date: Date;
  category: 'Fuel' | 'Toll' | 'Parking' | 'Loading' | 'Repair' | 'Maintenance' | 'Other';
  amount: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FleetExpenseSchema = new Schema<IFleetExpense>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'FleetVehicle',
      required: [true, 'Vehicle is required'],
      index: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
      index: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    category: {
      type: String,
      enum: ['Fuel', 'Toll', 'Parking', 'Loading', 'Repair', 'Maintenance', 'Other'],
      required: [true, 'Expense category is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Expense amount cannot be negative'],
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

const FleetExpense: Model<IFleetExpense> =
  mongoose.models.FleetExpense ||
  mongoose.model<IFleetExpense>('FleetExpense', FleetExpenseSchema);

export default FleetExpense;
