import mongoose, { Schema, Document } from 'mongoose';
import {
  DEFAULT_OFFICE_ADDRESS,
  DEFAULT_OFFICE_MAP_URL,
  DEFAULT_OFFICE_MAP_EMBED_URL,
} from '@/utils/mapUtils';

export interface ISiteConfig extends Document {
  phone: string;
  whatsapp: string;
  address: string;
  email: string;
  officeMapUrl: string;
  officeMapEmbedUrl: string;
  updatedAt: Date;
}

const SiteConfigSchema: Schema = new Schema(
  {
    phone: { type: String, required: true, default: '7654722708' },
    whatsapp: { type: String, required: true, default: '917654722708' },
    address: { type: String, required: true, default: DEFAULT_OFFICE_ADDRESS },
    email: { type: String, default: 'support@b2transport.in' },
    officeMapUrl: {
      type: String,
      default: DEFAULT_OFFICE_MAP_URL,
    },
    officeMapEmbedUrl: {
      type: String,
      default: DEFAULT_OFFICE_MAP_EMBED_URL,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteConfig || mongoose.model<ISiteConfig>('SiteConfig', SiteConfigSchema);
