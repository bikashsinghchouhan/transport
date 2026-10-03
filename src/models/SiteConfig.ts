import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteConfig extends Document {
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
  updatedAt: Date;
}

const SiteConfigSchema: Schema = new Schema(
  {
    phone: { type: String, required: true, default: '7654722708' },
    whatsapp: { type: String, required: true, default: '917654722708' },
    address: { type: String, required: true, default: 'Ranchi, Jharkhand (HQ)' },
    email: { type: String, default: 'support@b2transport.in' },
  },
  { timestamps: true }
);

export default mongoose.models.SiteConfig || mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
