import { QuestProgress, IQuestProgress } from '@/models/QuestProgress';
import { Settings } from '@/models/Settings';
import { XPEngine } from './XPEngine';
import connectDB from '@/lib/mongodb';

export class QuestService {
  private companyId: string;
  private xpEngine: XPEngine;

  constructor(companyId: string) {
    this.companyId = companyId;
    this.xpEngine = new XPEngine(companyId);
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
    const settings = await Settings.findOne({ companyId: this.companyId });
    if (!settings) return [];

    const progress = await QuestProgress.findOne({
      companyId: this.companyId,
      userId,
      dateKey,
      type: 'daily'
    });

    if (!progress) return [];

    const completed: string[] = [];

    // Check send 10 messages quest
    if (progress.msgCount >= 10 && !progress.completed.send10) {
      progress.completed.send10 = true;
      await progress.save();
      completed.push('daily_send10');
      
      // Award XP
      await this.xpEngine.awardXP(userId, settings.quest.daily.send10);
    }

    // Check 1 success message quest
    if (progress.successMsgCount >= 1 && !progress.completed.success1) {
      progress.completed.success1 = true;
      await progress.save();
      completed.push('daily_success1');
      
      // Award XP
      await this.xpEngine.awardXP(userId, settings.quest.daily.success1);
    }

    return completed;
  }

  // Check weekly quest completion
  private async checkWeeklyCompletion(userId: string, weekKey: string): Promise<string[]> {
    const settings = await Settings.findOne({ companyId: this.companyId });
    if (!settings) return [];

    const progress = await QuestProgress.findOne({
      companyId: this.companyId,
      userId,
      dateKey: weekKey,
      type: 'weekly'
    });

    if (!progress) return [];

    const completed: string[] = [];

    // Check send 100 messages quest
    if (progress.msgCount >= 100 && !progress.completed.send100) {
      progress.completed.send100 = true;
      await progress.save();
      completed.push('weekly_send100');
      
      // Award XP
      await this.xpEngine.awardXP(userId, settings.quest.weekly.send100);
    }

    // Check 10 success messages quest
    if (progress.successMsgCount >= 10 && !progress.completed.success10) {
      progress.completed.success10 = true;
      await progress.save();
      completed.push('weekly_success10');
      
      // Award XP
      await this.xpEngine.awardXP(userId, settings.quest.weekly.success10);
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
              send10: questDoc.dailyCompleted || false,
              success1: questDoc.dailyCompleted || false,
            }
          },
          weekly: {
            msgCount: questDoc.weeklyQuests?.messages || 0,
            successMsgCount: questDoc.weeklyQuests?.successMessages || 0,
            completed: {
              send100: questDoc.weeklyCompleted || false,
              success10: questDoc.weeklyCompleted || false,
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
    // Convert to New York timezone
    const nyDate = new Date(date.toLocaleString("en-US", {timeZone: "America/New_York"}));
    return nyDate.toISOString().split('T')[0];
  }

  // Get week key (YYYY-WW) in New York timezone
  private getWeekKey(date: Date): string {
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
