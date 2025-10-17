import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  companyId: string;
  timezone: string;
  successChannelIds: string[];
  streakChannelId?: string;
  powerRoles: { [level: number]: string };
  apexRoleId?: string;
  xp: {
    perMessage: number;
    successBonus: number;
    cooldownSeconds: number;
  };
  quest: {
    daily: {
      send10: number;
      success1: number;
    };
    weekly: {
      send100: number;
      success10: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  companyId: { type: String, required: true, unique: true },
  timezone: { type: String, default: 'America/New_York' },
  successChannelIds: [String],
  streakChannelId: String,
  powerRoles: { type: Map, of: String },
  apexRoleId: String,
  xp: {
    perMessage: { type: Number, default: 5 },
    successBonus: { type: Number, default: 10 },
    cooldownSeconds: { type: Number, default: 30 },
  },
  quest: {
    daily: {
      send10: { type: Number, default: 15 },
      success1: { type: Number, default: 10 },
    },
    weekly: {
      send100: { type: Number, default: 50 },
      success10: { type: Number, default: 50 },
    },
  },
}, {
  timestamps: true,
});

export const Settings = (mongoose.models && mongoose.models.Settings) || mongoose.model<ISettings>('Settings', SettingsSchema);
