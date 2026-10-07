import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriver extends Document {
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiryDate?: Date | null;
  assignedVehicleId?: mongoose.Types.ObjectId | null;
  status: 'ACTIVE' | 'INACTIVE';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    fullName: {
      type: String,
      required: [true, 'Driver full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Driver phone number is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Driving license number is required'],
      trim: true,
      uppercase: true,
    },
    licenseExpiryDate: {
      type: Date,
      default: null,
    },
    assignedVehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'FleetVehicle',
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
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

const Driver: Model<IDriver> =
  mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);

export default Driver;
