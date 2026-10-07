import mongoose, { Schema, Model } from 'mongoose';

export interface IFleetVehicle {
  _id?: string;
  registrationNumber: string;
  model: string;
  vehicleType: string;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'INACTIVE';
  assignedDriverId?: mongoose.Types.ObjectId | null;
  purchaseDate?: Date | null;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const FleetVehicleSchema = new Schema<IFleetVehicle>(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      trim: true,
      default: 'Mini Truck',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'IN_MAINTENANCE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    assignedDriverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    purchaseDate: {
      type: Date,
      default: null,
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

const FleetVehicle: Model<IFleetVehicle> =
  mongoose.models.FleetVehicle ||
  mongoose.model<IFleetVehicle>('FleetVehicle', FleetVehicleSchema);

export default FleetVehicle;
