import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestProgress extends Document {
  companyId: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD for daily, YYYY-WW for weekly
  type: 'daily' | 'weekly';
  msgCount: number;
  successMsgCount: number;
  completed: {
    send10?: boolean;
    success1?: boolean;
    send100?: boolean;
    success10?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestProgressSchema = new Schema<IQuestProgress>({
  companyId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  dateKey: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly'], required: true },
  msgCount: { type: Number, default: 0 },
  successMsgCount: { type: Number, default: 0 },
  completed: {
    send10: Boolean,
    success1: Boolean,
    send100: Boolean,
    success10: Boolean,
  },
}, {
  timestamps: true,
});

// Compound index for efficient queries
QuestProgressSchema.index({ companyId: 1, userId: 1, dateKey: 1, type: 1 }, { unique: true });

export const QuestProgress = (mongoose.models && mongoose.models.QuestProgress) || mongoose.model<IQuestProgress>('QuestProgress', QuestProgressSchema);
