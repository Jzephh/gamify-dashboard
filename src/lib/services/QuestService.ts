import { QuestProgress, IQuestProgress } from '@/models/QuestProgress';
import connectDB from '@/lib/mongodb';

export class QuestService {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  // Update quest progress for a message
  async updateProgress(userId: string, isSuccessMessage: boolean = false): Promise<{
    dailyProgress?: IQuestProgress;
    weeklyProgress?: IQuestProgress;
    completedQuests?: string[];
  }> {
    try {
      await connectDB();
      const now = new Date();
      const dateKey = this.getDateKey(now);
      const weekKey = this.getWeekKey(now);

      const completedQuests: string[] = [];

      // Update daily progress
      const dailyProgress = await this.updateDailyProgress(userId, dateKey, isSuccessMessage);
      if (dailyProgress) {
        const dailyCompleted = await this.checkDailyCompletion(userId, dateKey);
        completedQuests.push(...dailyCompleted);
      }

      // Update weekly progress
      const weeklyProgress = await this.updateWeeklyProgress(userId, weekKey, isSuccessMessage);
      if (weeklyProgress) {
        const weeklyCompleted = await this.checkWeeklyCompletion(userId, weekKey);
        completedQuests.push(...weeklyCompleted);
      }

      return {
        dailyProgress,
        weeklyProgress,
        completedQuests,
      };
    } catch (error) {
      console.error('Error updating quest progress:', error);
      return {};
    }
  }

  // Update daily quest progress
  private async updateDailyProgress(userId: string, dateKey: string, isSuccessMessage: boolean): Promise<IQuestProgress> {
    const progress = await QuestProgress.findOneAndUpdate(
      { companyId: this.companyId, userId, dateKey, type: 'daily' },
      {
        $inc: { 
          msgCount: 1,
          ...(isSuccessMessage && { successMsgCount: 1 })
        }
      },
      { upsert: true, new: true }
    );

    return progress;
  }

  // Update weekly quest progress
  private async updateWeeklyProgress(userId: string, weekKey: string, isSuccessMessage: boolean): Promise<IQuestProgress> {
    const progress = await QuestProgress.findOneAndUpdate(
      { companyId: this.companyId, userId, dateKey: weekKey, type: 'weekly' },
      {
        $inc: { 
          msgCount: 1,
          ...(isSuccessMessage && { successMsgCount: 1 })
        }
      },
      { upsert: true, new: true }
    );

    return progress;
  }

  // Check daily quest completion
  private async checkDailyCompletion(userId: string, dateKey: string): Promise<string[]> {
    const progress = await QuestProgress.findOne({
      companyId: this.companyId,
      userId,
      dateKey
    });

    if (!progress) return [];

    const completed: string[] = [];

    // Check send 10 messages quest
    if ((progress.dailyQuests?.messages || 0) >= 10 && !progress.dailyCompleted) {
      progress.dailyCompleted = true;
      await progress.save();
      completed.push('daily_send10');
    }

    // Check 1 success message quest
    if ((progress.dailyQuests?.successMessages || 0) >= 1 && !progress.dailyCompleted) {
      progress.dailyCompleted = true;
      await progress.save();
      completed.push('daily_success1');
    }

    return completed;
  }

  // Check weekly quest completion
  private async checkWeeklyCompletion(userId: string, weekKey: string): Promise<string[]> {
    const progress = await QuestProgress.findOne({
      companyId: this.companyId,
      userId,
      weekKey
    });

    if (!progress) return [];

    const completed: string[] = [];

    // Check send 100 messages quest
    if ((progress.weeklyQuests?.messages || 0) >= 100 && !progress.weeklyCompleted) {
      progress.weeklyCompleted = true;
      await progress.save();
      completed.push('weekly_send100');
    }

    // Check 10 success messages quest
    if ((progress.weeklyQuests?.successMessages || 0) >= 10 && !progress.weeklyCompleted) {
      progress.weeklyCompleted = true;
      await progress.save();
      completed.push('weekly_success10');
    }

    return completed;
  }

  // Get user's quest progress
  async getUserProgress(userId: string): Promise<{
    daily: { msgCount: number; successMsgCount: number; completed: Record<string, boolean> };
    weekly: { msgCount: number; successMsgCount: number; completed: Record<string, boolean> };
  }> {
    try {
      await connectDB();
      const now = new Date();
      const dateKey = this.getDateKey(now);

      // Find quest progress document for the current date
      const questDoc = await QuestProgress.findOne({
        companyId: this.companyId,
        userId,
        dateKey
      });

      if (questDoc) {
        return {
          daily: {
            msgCount: questDoc.dailyQuests?.messages || 0,
            successMsgCount: questDoc.dailyQuests?.successMessages || 0,
            completed: {
              send10: (questDoc.dailyQuests?.messages || 0) >= 10,
              success1: (questDoc.dailyQuests?.successMessages || 0) >= 1,
            }
          },
          weekly: {
            msgCount: questDoc.weeklyQuests?.messages || 0,
            successMsgCount: questDoc.weeklyQuests?.successMessages || 0,
            completed: {
              send100: (questDoc.weeklyQuests?.messages || 0) >= 100,
              success10: (questDoc.weeklyQuests?.successMessages || 0) >= 10,
            }
          }
        };
      }

      return {
        daily: { msgCount: 0, successMsgCount: 0, completed: {} },
        weekly: { msgCount: 0, successMsgCount: 0, completed: {} },
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return {
        daily: { msgCount: 0, successMsgCount: 0, completed: {} },
        weekly: { msgCount: 0, successMsgCount: 0, completed: {} },
      };
    }
  }

  // Get date key (YYYY-MM-DD) in New York timezone
  private getDateKey(date: Date): string {
    // Convert to New York timezone for consistent quest dates
    const nyDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    return nyDate.toISOString().split('T')[0];
  }

  // Get week key (YYYY-WW) in New York timezone
  private getWeekKey(date: Date): string {
    // Convert to New York timezone for consistent quest dates
    const nyDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const year = nyDate.getFullYear();
    const week = this.getWeekNumber(nyDate);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  // Get week number of year
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
