import mongoose, { Schema, Document } from 'mongoose';

export interface ILevelUpNotification extends Document {
  companyId: string;
  userId: string;
  level: number;
  xp: number;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LevelUpNotificationSchema = new Schema<ILevelUpNotification>({
  companyId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  level: { type: Number, required: true },
  xp: { type: Number, required: true },
  seen: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Compound index for efficient queries
LevelUpNotificationSchema.index({ companyId: 1, userId: 1, seen: 1 });
LevelUpNotificationSchema.index({ companyId: 1, userId: 1, createdAt: -1 });

export const LevelUpNotification = (mongoose.models && mongoose.models.LevelUpNotification) || mongoose.model<ILevelUpNotification>('LevelUpNotification', LevelUpNotificationSchema);
