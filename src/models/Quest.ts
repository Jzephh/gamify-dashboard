import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestObjective {
  id: string;
  title: string;
  description: string;
  messageCount: number;
  successMessageCount: number;
  xpReward: number;
  order: number; // Sequential order (1, 2, 3, etc.)
}

export interface IQuest extends Document {
  companyId: string;
  questId: string; // 'daily_quest', 'weekly_quest'
  questType: 'daily' | 'weekly';
  title: string;
  description: string;
  objectives: IQuestObjective[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestObjectiveSchema = new Schema<IQuestObjective>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  messageCount: { type: Number, required: true, default: 0 },
  successMessageCount: { type: Number, required: true, default: 0 },
  xpReward: { type: Number, required: true, default: 0 },
  order: { type: Number, required: true },
});

const QuestSchema = new Schema<IQuest>({
  companyId: { type: String, required: true, index: true },
  questId: { type: String, required: true, unique: true },
  questType: { type: String, required: true, enum: ['daily', 'weekly'] },
  title: { type: String, required: true },
  description: { type: String, required: true },
  objectives: [QuestObjectiveSchema],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Compound index for efficient queries
QuestSchema.index({ companyId: 1, questId: 1 }, { unique: true });

export const Quest = (mongoose.models && mongoose.models.Quest) || mongoose.model<IQuest>('Quest', QuestSchema);
