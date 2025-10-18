import mongoose, { Schema, Document } from 'mongoose';

export interface IObjectiveProgress {
  objectiveId: string;
  completed: boolean;
  claimed: boolean;
  completedAt?: Date;
}

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
  dailyObjectives: IObjectiveProgress[];
  weeklyObjectives: IObjectiveProgress[];
  dailyQuestSeen: boolean;
  weeklyQuestSeen: boolean;
  dailyNotificationCount: number;
  weeklyNotificationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ObjectiveProgressSchema = new Schema<IObjectiveProgress>({
  objectiveId: { type: String, required: true },
  completed: { type: Boolean, default: false },
  claimed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

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
  dailyObjectives: [ObjectiveProgressSchema],
  weeklyObjectives: [ObjectiveProgressSchema],
  dailyQuestSeen: { type: Boolean, default: true },
  weeklyQuestSeen: { type: Boolean, default: true },
  dailyNotificationCount: { type: Number, default: 0 },
  weeklyNotificationCount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Compound index for efficient queries
QuestProgressSchema.index({ companyId: 1, userId: 1, dateKey: 1 }, { unique: true });

export const QuestProgress = (mongoose.models && mongoose.models.QuestProgress) || mongoose.model<IQuestProgress>('QuestProgress', QuestProgressSchema);
