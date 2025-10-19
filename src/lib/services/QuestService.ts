import { QuestProgress, IQuestProgress, IObjectiveProgress } from '@/models/QuestProgress';
import { QuestConfigService } from './QuestConfigService';
import { IQuestObjective } from '@/models/Quest';
import connectDB from '@/lib/mongodb';

interface QuestObjective {
  id: string;
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

      // Update weekly progress
      const weeklyProgress = await this.updateWeeklyProgress(userId, weekKey, isSuccessMessage);

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
      // Initialize with quest configurations
      const questConfigService = new QuestConfigService(this.companyId);
      const dailyQuests = await questConfigService.getQuestsByType('daily');
      const dailyQuest = dailyQuests[0];
      
      const dailyObjectives = dailyQuest ? dailyQuest.objectives.map(obj => ({
        objectiveId: obj.id,
        messageCount: obj.messageCount,
        successMessageCount: obj.successMessageCount,
        xpReward: obj.xpReward,
        order: obj.order,
        currentMessages: 0,
        currentSuccessMessages: 0,
        completed: false,
        claimed: false,
      })) : [];

      const newProgress = new QuestProgress({
        companyId: this.companyId,
        userId,
        dateKey,
        weekKey: this.getWeekKey(new Date()),
        dailyCompleted: false,
        weeklyCompleted: false,
        dailyObjectives,
        weeklyObjectives: [],
        dailyQuestSeen: true,
        weeklyQuestSeen: true,
        dailyNotificationCount: 0,
        weeklyNotificationCount: 0,
      });
      await newProgress.save();
      return newProgress;
    }

    // Increment objective counters
    for (const obj of progress.dailyObjectives) {
      if (obj.messageCount > 0) obj.currentMessages += 1;
      if (isSuccessMessage && obj.successMessageCount > 0) obj.currentSuccessMessages += 1;
    }

    // Check for completed objectives
    await this.checkObjectiveCompletion(progress, 'daily');

    await progress.save();
    return progress;
  }

  // Update weekly quest progress
  private async updateWeeklyProgress(userId: string, weekKey: string, isSuccessMessage: boolean): Promise<IQuestProgress> {
    // Always update the daily progress document for weekly objectives
    const dateKey = this.getDateKey(new Date());
    const progress = await QuestProgress.findOne({
      companyId: this.companyId,
      userId,
      dateKey
    });

    if (!progress) {
      // This should not happen as daily progress should be created first
      console.error('Daily progress not found when updating weekly progress');
      return null as unknown as IQuestProgress;
    }

    // Ensure weekly objectives exist
    if (progress.weeklyObjectives.length === 0) {
      const questConfigService = new QuestConfigService(this.companyId);
      const weeklyQuests = await questConfigService.getQuestsByType('weekly');
      const weeklyQuest = weeklyQuests[0];
      
      if (weeklyQuest) {
        progress.weeklyObjectives = weeklyQuest.objectives.map(obj => ({
          objectiveId: obj.id,
          messageCount: obj.messageCount,
          successMessageCount: obj.successMessageCount,
          xpReward: obj.xpReward,
          order: obj.order,
          currentMessages: 0,
          currentSuccessMessages: 0,
          completed: false,
          claimed: false,
        }));
      }
    }

    // Increment objective counters
    for (const obj of progress.weeklyObjectives) {
      if (obj.messageCount > 0) obj.currentMessages += 1;
      if (isSuccessMessage && obj.successMessageCount > 0) obj.currentSuccessMessages += 1;
    }

    // Check for completed objectives
    await this.checkObjectiveCompletion(progress, 'weekly');

      await progress.save();
    return progress;
  }

  // Check objective completion
  private async checkObjectiveCompletion(progress: IQuestProgress, questType: 'daily' | 'weekly'): Promise<void> {
    const objectives = questType === 'daily' ? progress.dailyObjectives : progress.weeklyObjectives;

    let questCompleted = false;

    for (const objective of objectives) {
      if (objective.completed) continue;

      let isCompleted = false;
      if (objective.messageCount > 0) {
        isCompleted = (objective.currentMessages || 0) >= objective.messageCount;
      } else if (objective.successMessageCount > 0) {
        isCompleted = (objective.currentSuccessMessages || 0) >= objective.successMessageCount;
      }

      if (isCompleted) {
        objective.completed = true;
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

      // Always look in the daily progress document for both daily and weekly objectives
    const progress = await QuestProgress.findOne({
      companyId: this.companyId,
      userId,
        dateKey
      });

      if (!progress) {
        return { success: false, error: 'Quest progress not found', xp: 0 };
      }

      // Check if objective is completed
      const objectiveArray = questType === 'daily' ? progress.dailyObjectives : progress.weeklyObjectives;
      const objectiveProgress = objectiveArray.find((obj: IObjectiveProgress) => obj.objectiveId === objectiveId);

      if (!objectiveProgress) {
        console.log('Objective progress not found for:', objectiveId);
        return { success: false, error: 'Objective progress not found', xp: 0 };
      }

      console.log('Objective progress found:', {
        objectiveId: objectiveProgress.objectiveId,
        currentMessages: objectiveProgress.currentMessages,
        currentSuccessMessages: objectiveProgress.currentSuccessMessages,
        messageCount: objectiveProgress.messageCount,
        successMessageCount: objectiveProgress.successMessageCount,
        completed: objectiveProgress.completed,
        claimed: objectiveProgress.claimed
      });

      if (!objectiveProgress.completed) {
        console.log('Objective not completed yet');
        return { success: false, error: 'Objective not completed yet', xp: 0 };
      }

      if (objectiveProgress.claimed) {
        console.log('Objective already claimed');
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

      // Find the main progress document (daily-based)
      let questDoc = await QuestProgress.findOne({
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


      // Initialize progress if it doesn't exist
      if (!questDoc) {
        // Create a new progress document with initialized objectives
        const dailyObjectives = dailyQuest ? dailyQuest.objectives.map(obj => ({
          objectiveId: obj.id,
          messageCount: obj.messageCount,
          successMessageCount: obj.successMessageCount,
          xpReward: obj.xpReward,
          order: obj.order,
          currentMessages: 0,
          currentSuccessMessages: 0,
          completed: false,
          claimed: false,
        })) : [];

        const weeklyObjectives = weeklyQuest ? weeklyQuest.objectives.map(obj => ({
          objectiveId: obj.id,
          messageCount: obj.messageCount,
          successMessageCount: obj.successMessageCount,
          xpReward: obj.xpReward,
          order: obj.order,
          currentMessages: 0,
          currentSuccessMessages: 0,
          completed: false,
          claimed: false,
        })) : [];

        questDoc = new QuestProgress({
          companyId: this.companyId,
          userId,
          dateKey,
          weekKey: this.getWeekKey(now),
          dailyCompleted: false,
          weeklyCompleted: false,
          dailyObjectives,
          weeklyObjectives,
          dailyQuestSeen: true,
          weeklyQuestSeen: true,
          dailyNotificationCount: 0,
          weeklyNotificationCount: 0,
        });
        await questDoc.save();
      }

      if (dailyQuest && weeklyQuest) {
        // Ensure objectives have the new fields (migration for existing data)
        for (const obj of questDoc.dailyObjectives) {
          if (obj.currentMessages === undefined) obj.currentMessages = 0;
          if (obj.currentSuccessMessages === undefined) obj.currentSuccessMessages = 0;
        }
        for (const obj of questDoc.weeklyObjectives) {
          if (obj.currentMessages === undefined) obj.currentMessages = 0;
          if (obj.currentSuccessMessages === undefined) obj.currentSuccessMessages = 0;
        }

        // Run migration to sync with latest quest configurations
        await this.migrateQuestProgress();

        // Check for completed objectives before building the response
        await this.checkObjectiveCompletion(questDoc, 'daily');
        await this.checkObjectiveCompletion(questDoc, 'weekly');
        await questDoc.save();

        // Build daily objectives
        const dailyObjectives = dailyQuest.objectives
          .sort((a: IQuestObjective, b: IQuestObjective) => a.order - b.order)
          .map((objective: IQuestObjective) => {
            const objectiveProgress = questDoc.dailyObjectives.find((obj: IObjectiveProgress) => obj.objectiveId === objective.id);
            const progress = objective.messageCount > 0 ? (objectiveProgress?.currentMessages || 0) : (objectiveProgress?.currentSuccessMessages || 0);
            const target = objective.messageCount > 0 ? objective.messageCount : objective.successMessageCount;

            // Generate title and description based on objective type
            const isSuccessObjective = objective.successMessageCount > 0;
            const title = isSuccessObjective 
              ? `Send ${objective.successMessageCount} Success Message${objective.successMessageCount > 1 ? 's' : ''}`
              : `Send ${objective.messageCount} Message${objective.messageCount > 1 ? 's' : ''}`;
            const description = isSuccessObjective
              ? `Send ${objective.successMessageCount} message${objective.successMessageCount > 1 ? 's' : ''} in success channels`
              : `Send ${objective.messageCount} message${objective.messageCount > 1 ? 's' : ''} in any channel`;

            return {
              id: objective.id,
              title,
              description,
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
            const objectiveProgress = questDoc.weeklyObjectives.find((obj: IObjectiveProgress) => obj.objectiveId === objective.id);
            const progress = objective.messageCount > 0 ? (objectiveProgress?.currentMessages || 0) : (objectiveProgress?.currentSuccessMessages || 0);
            const target = objective.messageCount > 0 ? objective.messageCount : objective.successMessageCount;

            // Generate title and description based on objective type
            const isSuccessObjective = objective.successMessageCount > 0;
            const title = isSuccessObjective 
              ? `Send ${objective.successMessageCount} Success Message${objective.successMessageCount > 1 ? 's' : ''}`
              : `Send ${objective.messageCount} Message${objective.messageCount > 1 ? 's' : ''}`;
            const description = isSuccessObjective
              ? `Send ${objective.successMessageCount} message${objective.successMessageCount > 1 ? 's' : ''} in success channels`
              : `Send ${objective.messageCount} message${objective.messageCount > 1 ? 's' : ''} in any channel`;

            return {
              id: objective.id,
              title,
              description,
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
            msgCount: dailyObjectives.reduce((sum, o) => sum + o.progress, 0),
            successMsgCount: dailyObjectives.reduce((sum, o) => sum + o.progress, 0),
            objectives: dailyObjectives,
            questSeen: questDoc.dailyQuestSeen ?? false,
            notificationCount: dailyNotificationCount
          },
          weekly: {
            msgCount: weeklyObjectives.reduce((sum, o) => sum + o.progress, 0),
            successMsgCount: weeklyObjectives.reduce((sum, o) => sum + o.progress, 0),
            objectives: weeklyObjectives,
            questSeen: questDoc.weeklyQuestSeen ?? false,
            notificationCount: weeklyNotificationCount
          }
        };
      }

      // Return empty progress if no quest configurations
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

  // Migrate quest progress when new objectives are added
  async migrateQuestProgress(): Promise<void> {
    try {
      await connectDB();
      
      // Get current quest configurations
      const questConfigService = new QuestConfigService(this.companyId);
      const dailyQuests = await questConfigService.getQuestsByType('daily');
      const weeklyQuests = await questConfigService.getQuestsByType('weekly');
      
      const dailyQuest = dailyQuests[0];
      const weeklyQuest = weeklyQuests[0];
      
      if (!dailyQuest && !weeklyQuest) {
        console.log('No quest configurations found for migration');
        return;
      }

      // Find all quest progress documents for this company
      const allProgress = await QuestProgress.find({
        companyId: this.companyId
      });

      console.log(`Found ${allProgress.length} quest progress documents to migrate`);

      for (const progress of allProgress) {
        let needsUpdate = false;

        // Check daily objectives
        if (dailyQuest) {
          const currentDailyIds = progress.dailyObjectives.map((obj: IObjectiveProgress) => obj.objectiveId);
          
          // Add missing daily objectives
          for (const configObj of dailyQuest.objectives) {
            if (!currentDailyIds.includes(configObj.id)) {
              progress.dailyObjectives.push({
                objectiveId: configObj.id,
                messageCount: configObj.messageCount,
                successMessageCount: configObj.successMessageCount,
                xpReward: configObj.xpReward,
                order: configObj.order,
                currentMessages: 0,
                currentSuccessMessages: 0,
                completed: false,
                claimed: false,
              });
              needsUpdate = true;
              console.log(`Added missing daily objective: ${configObj.id}`);
            }
          }

          // Update existing daily objectives with new values if needed
          for (const progressObj of progress.dailyObjectives) {
            const configObj = dailyQuest.objectives.find(obj => obj.id === progressObj.objectiveId);
            if (configObj) {
              // Update configuration values but preserve progress
              const oldMessageCount = progressObj.messageCount;
              const oldSuccessMessageCount = progressObj.successMessageCount;
              
              if (progressObj.messageCount !== configObj.messageCount || 
                  progressObj.successMessageCount !== configObj.successMessageCount ||
                  progressObj.xpReward !== configObj.xpReward ||
                  progressObj.order !== configObj.order) {
                
                progressObj.messageCount = configObj.messageCount;
                progressObj.successMessageCount = configObj.successMessageCount;
                progressObj.xpReward = configObj.xpReward;
                progressObj.order = configObj.order;
                
                // Adjust current progress if target changed
                if (configObj.messageCount > 0 && oldMessageCount > 0) {
                  const ratio = configObj.messageCount / oldMessageCount;
                  progressObj.currentMessages = Math.min(
                    Math.floor(progressObj.currentMessages * ratio), 
                    configObj.messageCount
                  );
                }
                
                if (configObj.successMessageCount > 0 && oldSuccessMessageCount > 0) {
                  const ratio = configObj.successMessageCount / oldSuccessMessageCount;
                  progressObj.currentSuccessMessages = Math.min(
                    Math.floor(progressObj.currentSuccessMessages * ratio), 
                    configObj.successMessageCount
                  );
                }
                
                needsUpdate = true;
                console.log(`Updated daily objective: ${progressObj.objectiveId}`);
              }
            }
          }
        }

        // Check weekly objectives
        if (weeklyQuest) {
          const currentWeeklyIds = progress.weeklyObjectives.map((obj: IObjectiveProgress) => obj.objectiveId);
          
          // Add missing weekly objectives
          for (const configObj of weeklyQuest.objectives) {
            if (!currentWeeklyIds.includes(configObj.id)) {
              progress.weeklyObjectives.push({
                objectiveId: configObj.id,
                messageCount: configObj.messageCount,
                successMessageCount: configObj.successMessageCount,
                xpReward: configObj.xpReward,
                order: configObj.order,
                currentMessages: 0,
                currentSuccessMessages: 0,
                completed: false,
                claimed: false,
              });
              needsUpdate = true;
              console.log(`Added missing weekly objective: ${configObj.id}`);
            }
          }

          // Update existing weekly objectives with new values if needed
          for (const progressObj of progress.weeklyObjectives) {
            const configObj = weeklyQuest.objectives.find(obj => obj.id === progressObj.objectiveId);
            if (configObj) {
              // Update configuration values but preserve progress
              const oldMessageCount = progressObj.messageCount;
              const oldSuccessMessageCount = progressObj.successMessageCount;
              
              if (progressObj.messageCount !== configObj.messageCount || 
                  progressObj.successMessageCount !== configObj.successMessageCount ||
                  progressObj.xpReward !== configObj.xpReward ||
                  progressObj.order !== configObj.order) {
                
                progressObj.messageCount = configObj.messageCount;
                progressObj.successMessageCount = configObj.successMessageCount;
                progressObj.xpReward = configObj.xpReward;
                progressObj.order = configObj.order;
                
                // Adjust current progress if target changed
                if (configObj.messageCount > 0 && oldMessageCount > 0) {
                  const ratio = configObj.messageCount / oldMessageCount;
                  progressObj.currentMessages = Math.min(
                    Math.floor(progressObj.currentMessages * ratio), 
                    configObj.messageCount
                  );
                }
                
                if (configObj.successMessageCount > 0 && oldSuccessMessageCount > 0) {
                  const ratio = configObj.successMessageCount / oldSuccessMessageCount;
                  progressObj.currentSuccessMessages = Math.min(
                    Math.floor(progressObj.currentSuccessMessages * ratio), 
                    configObj.successMessageCount
                  );
                }
                
                needsUpdate = true;
                console.log(`Updated weekly objective: ${progressObj.objectiveId}`);
              }
            }
          }
        }

        // Save if any changes were made
        if (needsUpdate) {
          await progress.save();
          console.log(`Migrated quest progress for user: ${progress.userId}`);
        }
      }

      console.log('Quest progress migration completed');
    } catch (error) {
      console.error('Error migrating quest progress:', error);
    }
  }
}