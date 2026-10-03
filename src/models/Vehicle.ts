import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVehicle extends Document {
  name: string;
  capacity: string;
  dimensions: string;
  description: string;
  tag?: string;
  basePrice: number;
  perKmPrice: number;
  rateFirst100: number;
  rateAfter100: number;
  minFareMin: number;
  minFareMax: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true,
    },
    capacity: {
      type: String,
      required: [true, 'Capacity is required'],
      trim: true,
    },
    dimensions: {
      type: String,
      required: [true, 'Dimensions are required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    tag: {
      type: String,
      default: '',
      trim: true,
    },
    basePrice: {
      type: Number,
      default: 500,
    },
    perKmPrice: {
      type: Number,
      default: 25,
    },
    rateFirst100: {
      type: Number,
      default: 35,
    },
    rateAfter100: {
      type: Number,
      default: 30,
    },
    minFareMin: {
      type: Number,
      default: 1500,
    },
    minFareMax: {
      type: Number,
      default: 1800,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle: Model<IVehicle> =
  mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;
