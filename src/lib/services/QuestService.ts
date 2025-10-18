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
    let questCompleted = false;

    // Check send 10 messages quest
    if ((progress.dailyQuests?.messages || 0) >= 10 && !progress.dailyCompleted) {
      progress.dailyCompleted = true;
      questCompleted = true;
      completed.push('daily_send10');
    }

    // Check 1 success message quest
    if ((progress.dailyQuests?.successMessages || 0) >= 1 && !progress.dailyCompleted) {
      progress.dailyCompleted = true;
      questCompleted = true;
      completed.push('daily_success1');
    }

    // Mark daily quests as unseen if any quest was completed
    if (questCompleted) {
      progress.dailyQuestSeen = false;
    }

    await progress.save();
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
    let questCompleted = false;

    // Check send 100 messages quest
    if ((progress.weeklyQuests?.messages || 0) >= 100 && !progress.weeklyCompleted) {
      progress.weeklyCompleted = true;
      questCompleted = true;
      completed.push('weekly_send100');
    }

    // Check 10 success messages quest
    if ((progress.weeklyQuests?.successMessages || 0) >= 10 && !progress.weeklyCompleted) {
      progress.weeklyCompleted = true;
      questCompleted = true;
      completed.push('weekly_success10');
    }

    // Mark weekly quests as unseen if any quest was completed
    if (questCompleted) {
      progress.weeklyQuestSeen = false;
    }

    await progress.save();
    return completed;
  }

  // Claim a quest
  async claimQuest(userId: string, questId: string): Promise<{
    success: boolean;
    error?: string;
    xp: number;
  }> {
    try {
      await connectDB();
      const now = new Date();
      const dateKey = this.getDateKey(now);
      const weekKey = this.getWeekKey(now);

      // Define quest XP rewards
      const questRewards: Record<string, number> = {
        'send10': 15,
        'success1': 10,
        'send100': 50,
        'success10': 50,
      };

      const xp = questRewards[questId] || 0;
      if (xp === 0) {
        return { success: false, error: 'Invalid quest ID', xp: 0 };
      }

      // Determine if it's a daily or weekly quest
      const isDailyQuest = ['send10', 'success1'].includes(questId);
      const key = isDailyQuest ? dateKey : weekKey;

      // Find the quest progress document
      const questDoc = await QuestProgress.findOne({
        companyId: this.companyId,
        userId,
        dateKey: key
      });

      if (!questDoc) {
        return { success: false, error: 'Quest progress not found', xp: 0 };
      }

      // Check if quest is completed
      let isCompleted = false;
      if (isDailyQuest) {
        if (questId === 'send10') {
          isCompleted = (questDoc.dailyQuests?.messages || 0) >= 10;
        } else if (questId === 'success1') {
          isCompleted = (questDoc.dailyQuests?.successMessages || 0) >= 1;
        }
      } else {
        if (questId === 'send100') {
          isCompleted = (questDoc.weeklyQuests?.messages || 0) >= 100;
        } else if (questId === 'success10') {
          isCompleted = (questDoc.weeklyQuests?.successMessages || 0) >= 10;
        }
      }

      if (!isCompleted) {
        return { success: false, error: 'Quest not completed yet', xp: 0 };
      }

      // Check if already claimed
      const claimedField = isDailyQuest ? 'dailyClaimed' : 'weeklyClaimed';
      const claimedData = questDoc[claimedField as keyof typeof questDoc] as { [key: string]: boolean } | undefined;
      
      if (claimedData && claimedData[questId]) {
        return { success: false, error: 'Quest already claimed', xp: 0 };
      }

      // Mark as claimed
      const updateField = `${claimedField}.${questId}`;
      await QuestProgress.findOneAndUpdate(
        { companyId: this.companyId, userId, dateKey: key },
        { $set: { [updateField]: true } }
      );

      return { success: true, xp };
    } catch (error) {
      console.error('Error claiming quest:', error);
      return { success: false, error: 'Internal server error', xp: 0 };
    }
  }

  // Get user's quest progress
  async getUserProgress(userId: string): Promise<{
    daily: { msgCount: number; successMsgCount: number; completed: Record<string, boolean>; claimed: Record<string, boolean>; questSeen: boolean };
    weekly: { msgCount: number; successMsgCount: number; completed: Record<string, boolean>; claimed: Record<string, boolean>; questSeen: boolean };
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
            },
            claimed: {
              send10: questDoc.dailyClaimed?.send10 || false,
              success1: questDoc.dailyClaimed?.success1 || false,
            },
            questSeen: questDoc.dailyQuestSeen ?? false
          },
          weekly: {
            msgCount: questDoc.weeklyQuests?.messages || 0,
            successMsgCount: questDoc.weeklyQuests?.successMessages || 0,
            completed: {
              send100: (questDoc.weeklyQuests?.messages || 0) >= 100,
              success10: (questDoc.weeklyQuests?.successMessages || 0) >= 10,
            },
            claimed: {
              send100: questDoc.weeklyClaimed?.send100 || false,
              success10: questDoc.weeklyClaimed?.success10 || false,
            },
            questSeen: questDoc.weeklyQuestSeen ?? false
          }
        };
      }

      return {
        daily: { msgCount: 0, successMsgCount: 0, completed: {}, claimed: {}, questSeen: false },
        weekly: { msgCount: 0, successMsgCount: 0, completed: {}, claimed: {}, questSeen: false },
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return {
        daily: { msgCount: 0, successMsgCount: 0, completed: {}, claimed: {}, questSeen: false },
        weekly: { msgCount: 0, successMsgCount: 0, completed: {}, claimed: {}, questSeen: false },
      };
    }
  }

  // Mark quests as seen
  async markQuestSeen(userId: string, questType: 'daily' | 'weekly'): Promise<boolean> {
    try {
      await connectDB();
      const now = new Date();
      const dateKey = this.getDateKey(now);
      const weekKey = this.getWeekKey(now);
      const key = questType === 'daily' ? dateKey : weekKey;

      const questDoc = await QuestProgress.findOne({
        companyId: this.companyId,
        userId,
        dateKey: key
      });

      if (!questDoc) return false;

      if (questType === 'daily') {
        questDoc.dailyQuestSeen = true;
      } else {
        questDoc.weeklyQuestSeen = true;
      }

      await questDoc.save();
      return true;
    } catch (error) {
      console.error('Error marking quest as seen:', error);
      return false;
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
