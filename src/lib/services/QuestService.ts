import { QuestProgress, IQuestProgress } from '@/models/QuestProgress';
import { QuestConfigService } from './QuestConfigService';
import { IQuestObjective } from '@/models/Quest';
import connectDB from '@/lib/mongodb';

interface QuestObjective {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  xp: number;
  order: number;
}

export class QuestService {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  // Update quest progress for a message
  async updateProgress(userId: string, isSuccessMessage: boolean = false): Promise<{
    dailyProgress?: IQuestProgress;
    weeklyProgress?: IQuestProgress;
    completedObjectives?: string[];
  }> {
    try {
      await connectDB();
      const now = new Date();
      const dateKey = this.getDateKey(now);
      const weekKey = this.getWeekKey(now);

      const completedObjectives: string[] = [];

      // Update daily progress
      const dailyProgress = await this.updateDailyProgress(userId, dateKey, isSuccessMessage);
      if (dailyProgress) {
        const dailyCompleted = await this.checkSequentialCompletion(userId, 'daily', dailyProgress);
        completedObjectives.push(...dailyCompleted);
      }

      // Update weekly progress
      const weeklyProgress = await this.updateWeeklyProgress(userId, weekKey, isSuccessMessage);
      if (weeklyProgress) {
        const weeklyCompleted = await this.checkSequentialCompletion(userId, 'weekly', weeklyProgress);
        completedObjectives.push(...weeklyCompleted);
      }

      return {
        dailyProgress,
        weeklyProgress,
        completedObjectives,
      };
    } catch (error) {
      console.error('Error updating quest progress:', error);
      return {};
    }
  }

  // Update daily quest progress
  private async updateDailyProgress(userId: string, dateKey: string, isSuccessMessage: boolean): Promise<IQuestProgress> {
    const progress = await QuestProgress.findOne({
      companyId: this.companyId,
      userId,
      dateKey
    });

    if (!progress) {
      const newProgress = new QuestProgress({
        companyId: this.companyId,
        userId,
        dateKey,
        weekKey: this.getWeekKey(new Date()),
        dailyQuests: { messages: 0, successMessages: 0 },
        weeklyQuests: { messages: 0, successMessages: 0 },
        dailyCompleted: false,
        weeklyCompleted: false,
        dailyObjectives: [],
        weeklyObjectives: [],
        dailyQuestSeen: true,
        weeklyQuestSeen: true,
        dailyNotificationCount: 0,
        weeklyNotificationCount: 0,
      });
      await newProgress.save();
      return newProgress;
    }

    // Update message counts
    progress.dailyQuests.messages += 1;
    if (isSuccessMessage) {
      progress.dailyQuests.successMessages += 1;
    }

    await progress.save();
    return progress;
  }

  // Update weekly quest progress
  private async updateWeeklyProgress(userId: string, weekKey: string, isSuccessMessage: boolean): Promise<IQuestProgress> {
    const progress = await QuestProgress.findOne({
      companyId: this.companyId,
      userId,
      dateKey: weekKey
    });

    if (!progress) {
      const newProgress = new QuestProgress({
        companyId: this.companyId,
        userId,
        dateKey: weekKey,
        weekKey,
        dailyQuests: { messages: 0, successMessages: 0 },
        weeklyQuests: { messages: 0, successMessages: 0 },
        dailyCompleted: false,
        weeklyCompleted: false,
        dailyObjectives: [],
        weeklyObjectives: [],
        dailyQuestSeen: true,
        weeklyQuestSeen: true,
        dailyNotificationCount: 0,
        weeklyNotificationCount: 0,
      });
      await newProgress.save();
      return newProgress;
    }

    // Update message counts
    progress.weeklyQuests.messages += 1;
    if (isSuccessMessage) {
      progress.weeklyQuests.successMessages += 1;
    }

    await progress.save();
    return progress;
  }

  // Check sequential objective completion
  private async checkSequentialCompletion(userId: string, questType: 'daily' | 'weekly', progress: IQuestProgress): Promise<string[]> {
    const questConfigService = new QuestConfigService(this.companyId);
    const quests = await questConfigService.getQuestsByType(questType);
    
    if (quests.length === 0) return [];

    const quest = quests[0]; // There should only be one quest per type
    const objectives = quest.objectives.sort((a, b) => a.order - b.order);
    const completedObjectives: string[] = [];
    let questCompleted = false;

    // Initialize objectives if not present
    const objectiveArray = questType === 'daily' ? progress.dailyObjectives : progress.weeklyObjectives;
    if (objectiveArray.length === 0) {
      objectives.forEach(obj => {
        objectiveArray.push({
          objectiveId: obj.id,
          completed: false,
          claimed: false,
        });
      });
    }

    // Check each objective in order
    for (let i = 0; i < objectives.length; i++) {
      const objective = objectives[i];
      const objectiveProgress = objectiveArray.find(obj => obj.objectiveId === objective.id);
      
      if (!objectiveProgress || objectiveProgress.completed) continue;

      // Check if previous objectives are completed
      const previousObjectives = objectives.slice(0, i);
      const allPreviousCompleted = previousObjectives.every(prevObj => {
        const prevProgress = objectiveArray.find(obj => obj.objectiveId === prevObj.id);
        return prevProgress?.completed || false;
      });

      if (!allPreviousCompleted) break; // Can't complete this objective yet

      // Check if current objective is completed
      let isCompleted = false;
      if (objective.messageCount > 0) {
        isCompleted = (questType === 'daily' ? progress.dailyQuests.messages : progress.weeklyQuests.messages) >= objective.messageCount;
      } else if (objective.successMessageCount > 0) {
        isCompleted = (questType === 'daily' ? progress.dailyQuests.successMessages : progress.weeklyQuests.successMessages) >= objective.successMessageCount;
      }

      if (isCompleted) {
        objectiveProgress.completed = true;
        objectiveProgress.completedAt = new Date();
        completedObjectives.push(objective.id);
        questCompleted = true;
      }
    }

    // Mark quest as unseen if any objective was completed
    if (questCompleted) {
      if (questType === 'daily') {
        progress.dailyQuestSeen = false;
      } else {
        progress.weeklyQuestSeen = false;
      }
    }

    await progress.save();
    return completedObjectives;
  }

  // Claim a sequential objective
  async claimObjective(userId: string, objectiveId: string): Promise<{
    success: boolean;
    error?: string;
    xp: number;
  }> {
    try {
      await connectDB();
      const now = new Date();
      const dateKey = this.getDateKey(now);
      const weekKey = this.getWeekKey(now);

      // Get quest configuration
      const questConfigService = new QuestConfigService(this.companyId);
      const allQuests = await questConfigService.getAllQuests();
      
      let objective: IQuestObjective | null = null;
      let questType: 'daily' | 'weekly' | null = null;

      for (const quest of allQuests) {
        const foundObjective = quest.objectives.find(obj => obj.id === objectiveId);
        if (foundObjective) {
          objective = foundObjective;
          questType = quest.questType;
          break;
        }
      }

      if (!objective || !questType) {
        return { success: false, error: 'Objective not found', xp: 0 };
      }

      const key = questType === 'daily' ? dateKey : weekKey;
      const progress = await QuestProgress.findOne({
        companyId: this.companyId,
        userId,
        dateKey: key
      });

      if (!progress) {
        return { success: false, error: 'Quest progress not found', xp: 0 };
      }

      // Check if objective is completed
      const objectiveArray = questType === 'daily' ? progress.dailyObjectives : progress.weeklyObjectives;
      const objectiveProgress = objectiveArray.find((obj: { objectiveId: string; completed: boolean; claimed: boolean }) => obj.objectiveId === objectiveId);

      if (!objectiveProgress || !objectiveProgress.completed) {
        return { success: false, error: 'Objective not completed yet', xp: 0 };
      }

      if (objectiveProgress.claimed) {
        return { success: false, error: 'Objective already claimed', xp: 0 };
      }

      // Mark as claimed
      objectiveProgress.claimed = true;

      await progress.save();
      return { success: true, xp: objective.xpReward };
    } catch (error) {
      console.error('Error claiming objective:', error);
      return { success: false, error: 'Internal server error', xp: 0 };
    }
  }

  // Get user's quest progress
  async getUserProgress(userId: string): Promise<{
    daily: {
      msgCount: number;
      successMsgCount: number;
      objectives: Array<{
        id: string;
        title: string;
        description: string;
        progress: number;
        target: number;
        completed: boolean;
        claimed: boolean;
        xp: number;
        order: number;
      }>;
      questSeen: boolean;
      notificationCount: number;
    };
    weekly: {
      msgCount: number;
      successMsgCount: number;
      objectives: Array<{
        id: string;
        title: string;
        description: string;
        progress: number;
        target: number;
        completed: boolean;
        claimed: boolean;
        xp: number;
        order: number;
      }>;
      questSeen: boolean;
      notificationCount: number;
    };
  }> {
    try {
      await connectDB();
      const now = new Date();
      const dateKey = this.getDateKey(now);

      const questDoc = await QuestProgress.findOne({
        companyId: this.companyId,
        userId,
        dateKey
      });

      // Get quest configurations
      const questConfigService = new QuestConfigService(this.companyId);
      const dailyQuests = await questConfigService.getQuestsByType('daily');
      const weeklyQuests = await questConfigService.getQuestsByType('weekly');

      const dailyQuest = dailyQuests[0] || null;
      const weeklyQuest = weeklyQuests[0] || null;

      if (questDoc && dailyQuest && weeklyQuest) {
        // Build daily objectives
        const dailyObjectives = dailyQuest.objectives
          .sort((a: IQuestObjective, b: IQuestObjective) => a.order - b.order)
          .map((objective: IQuestObjective) => {
            const objectiveProgress = questDoc.dailyObjectives.find((obj: { objectiveId: string; completed: boolean; claimed: boolean }) => obj.objectiveId === objective.id);
            const progress = objective.messageCount > 0 ? questDoc.dailyQuests.messages : questDoc.dailyQuests.successMessages;
            const target = objective.messageCount > 0 ? objective.messageCount : objective.successMessageCount;

            return {
              id: objective.id,
              title: objective.title,
              description: objective.description,
              progress: Math.min(progress, target),
              target,
              completed: objectiveProgress?.completed || false,
              claimed: objectiveProgress?.claimed || false,
              xp: objective.xpReward,
              order: objective.order,
            };
          });

        // Build weekly objectives
        const weeklyObjectives = weeklyQuest.objectives
          .sort((a: IQuestObjective, b: IQuestObjective) => a.order - b.order)
          .map((objective: IQuestObjective) => {
            const objectiveProgress = questDoc.weeklyObjectives.find((obj: { objectiveId: string; completed: boolean; claimed: boolean }) => obj.objectiveId === objective.id);
            const progress = objective.messageCount > 0 ? questDoc.weeklyQuests.messages : questDoc.weeklyQuests.successMessages;
            const target = objective.messageCount > 0 ? objective.messageCount : objective.successMessageCount;

            return {
              id: objective.id,
              title: objective.title,
              description: objective.description,
              progress: Math.min(progress, target),
              target,
              completed: objectiveProgress?.completed || false,
              claimed: objectiveProgress?.claimed || false,
              xp: objective.xpReward,
              order: objective.order,
            };
          });

        // Calculate notification counts
        const dailyNotificationCount = dailyObjectives.filter((obj: QuestObjective) => obj.completed && !obj.claimed).length;
        const weeklyNotificationCount = weeklyObjectives.filter((obj: QuestObjective) => obj.completed && !obj.claimed).length;

        return {
          daily: {
            msgCount: questDoc.dailyQuests.messages,
            successMsgCount: questDoc.dailyQuests.successMessages,
            objectives: dailyObjectives,
            questSeen: questDoc.dailyQuestSeen ?? false,
            notificationCount: dailyNotificationCount
          },
          weekly: {
            msgCount: questDoc.weeklyQuests.messages,
            successMsgCount: questDoc.weeklyQuests.successMessages,
            objectives: weeklyObjectives,
            questSeen: questDoc.weeklyQuestSeen ?? false,
            notificationCount: weeklyNotificationCount
          }
        };
      }

      // Return empty progress if no data
      return {
        daily: {
          msgCount: 0,
          successMsgCount: 0,
          objectives: [],
          questSeen: false,
          notificationCount: 0
        },
        weekly: {
          msgCount: 0,
          successMsgCount: 0,
          objectives: [],
          questSeen: false,
          notificationCount: 0
        }
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      return {
        daily: {
          msgCount: 0,
          successMsgCount: 0,
          objectives: [],
          questSeen: false,
          notificationCount: 0
        },
        weekly: {
          msgCount: 0,
          successMsgCount: 0,
          objectives: [],
          questSeen: false,
          notificationCount: 0
        }
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