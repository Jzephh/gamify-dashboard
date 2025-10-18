import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestProgress extends Document {
  companyId: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD
  weekKey: string; // YYYY-WW
  dailyQuests: {
    messages: number;
    successMessages: number;
  };
  weeklyQuests: {
    messages: number;
    successMessages: number;
  };
  dailyCompleted: boolean;
  weeklyCompleted: boolean;
  dailyClaimed: {
    send10: boolean;
    success1: boolean;
  };
  weeklyClaimed: {
    send100: boolean;
    success10: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestProgressSchema = new Schema<IQuestProgress>({
  companyId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  dateKey: { type: String, required: true },
  weekKey: { type: String, required: true },
  dailyQuests: {
    messages: { type: Number, default: 0 },
    successMessages: { type: Number, default: 0 },
  },
  weeklyQuests: {
    messages: { type: Number, default: 0 },
    successMessages: { type: Number, default: 0 },
  },
  dailyCompleted: { type: Boolean, default: false },
  weeklyCompleted: { type: Boolean, default: false },
  dailyClaimed: {
    send10: { type: Boolean, default: false },
    success1: { type: Boolean, default: false },
  },
  weeklyClaimed: {
    send100: { type: Boolean, default: false },
    success10: { type: Boolean, default: false },
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
QuestProgressSchema.index({ companyId: 1, userId: 1, dateKey: 1 }, { unique: true });

export const QuestProgress = (mongoose.models && mongoose.models.QuestProgress) || mongoose.model<IQuestProgress>('QuestProgress', QuestProgressSchema);
