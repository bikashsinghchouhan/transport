import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITripPayment extends Document {
  tripId: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
  collectedBy: 'DRIVER' | 'MANAGER';
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TripPaymentSchema = new Schema<ITripPayment>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip ID is required'],
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than zero'],
    },
    paymentMode: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'],
      default: 'CASH',
    },
    collectedBy: {
      type: String,
      enum: ['DRIVER', 'MANAGER'],
      default: 'MANAGER',
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

const TripPayment: Model<ITripPayment> =
  mongoose.models.TripPayment ||
  mongoose.model<ITripPayment>('TripPayment', TripPaymentSchema);

export default TripPayment;
