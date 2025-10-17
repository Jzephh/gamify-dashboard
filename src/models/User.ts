import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  companyId: string;
  userId: string;
  username: string;
  name: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  points: number;
  lastMessageAt?: Date;
  badges: {
    bronze: boolean;
    silver: boolean;
    gold: boolean;
    platinum: boolean;
    apex: boolean;
  };
  roles: string[];
  stats: {
    messages: number;
    successMessages: number;
    voiceMinutes: number;
  };
  levelUpSeen?: boolean; // Track if user has seen level up modal
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  companyId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  avatarUrl: String,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  points: { type: Number, default: 0 },
  lastMessageAt: Date,
  badges: {
    bronze: { type: Boolean, default: false },
    silver: { type: Boolean, default: false },
    gold: { type: Boolean, default: false },
    platinum: { type: Boolean, default: false },
    apex: { type: Boolean, default: false },
  },
  roles: [String],
  stats: {
    messages: { type: Number, default: 0 },
    successMessages: { type: Number, default: 0 },
    voiceMinutes: { type: Number, default: 0 },
  },
  levelUpSeen: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Compound index for efficient queries
UserSchema.index({ companyId: 1, userId: 1 }, { unique: true });
UserSchema.index({ companyId: 1, level: -1, xp: -1 }); // For leaderboard

export const User = (mongoose.models && mongoose.models.User) || mongoose.model<IUser>('User', UserSchema);
