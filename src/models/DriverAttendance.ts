import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriverAttendance extends Document {
  date: string; // YYYY-MM-DD
  driverId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId | null;
  attendance: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
  dutyStartTime?: string;
  dutyEndTime?: string;
  totalDutyHours: number;
  signatureVerified: boolean;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverAttendanceSchema = new Schema<IDriverAttendance>(
  {
    date: {
      type: String,
      required: [true, 'Attendance date string (YYYY-MM-DD) is required'],
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
      default: null,
    },
    attendance: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'],
      default: 'PRESENT',
      required: true,
    },
    dutyStartTime: {
      type: String,
      default: '',
    },
    dutyEndTime: {
      type: String,
      default: '',
    },
    totalDutyHours: {
      type: Number,
      default: 0,
    },
    signatureVerified: {
      type: Boolean,
      default: false,
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

// Compound index to ensure uniqueness for driver + date
DriverAttendanceSchema.index({ driverId: 1, date: 1 }, { unique: true });

const DriverAttendance: Model<IDriverAttendance> =
  mongoose.models.DriverAttendance ||
  mongoose.model<IDriverAttendance>('DriverAttendance', DriverAttendanceSchema);

export default DriverAttendance;
