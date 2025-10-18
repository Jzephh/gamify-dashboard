import { Quest, IQuest } from '@/models/Quest';
import connectDB from '@/lib/mongodb';

export class QuestConfigService {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  // Initialize default quests for a company
  async initializeDefaultQuests(): Promise<boolean> {
    try {
      await connectDB();
      
      // Check if quests already exist
      const existingQuests = await Quest.find({ companyId: this.companyId });
      if (existingQuests.length > 0) {
        return true; // Already initialized
      }

      // Default quest configurations with sequential objectives
      const defaultQuests = [
        {
          questId: 'daily_quest',
          questType: 'daily',
          title: 'Daily Quest',
          description: 'Complete daily objectives in order',
          objectives: [
            {
              id: 'daily_success1',
              title: 'Send 1 Success Message',
              description: 'Send 1 message in a success channel',
              messageCount: 0,
              successMessageCount: 1,
              xpReward: 10,
              order: 1,
            },
            {
              id: 'daily_send10',
              title: 'Send 10 Messages',
              description: 'Send 10 messages in any channel',
              messageCount: 10,
              successMessageCount: 0,
              xpReward: 15,
              order: 2,
            },
          ],
          isActive: true,
        },
        {
          questId: 'weekly_quest',
          questType: 'weekly',
          title: 'Weekly Quest',
          description: 'Complete weekly objectives in order',
          objectives: [
            {
              id: 'weekly_send100',
              title: 'Send 100 Messages',
              description: 'Send 100 messages in any channel',
              messageCount: 100,
              successMessageCount: 0,
              xpReward: 15,
              order: 1,
            },
            {
              id: 'weekly_success10',
              title: 'Send 10 Success Messages',
              description: 'Send 10 messages in success channels',
              messageCount: 0,
              successMessageCount: 10,
              xpReward: 50,
              order: 2,
            },
          ],
          isActive: true,
        },
      ];

      // Create quests with companyId
      const questsToCreate = defaultQuests.map(quest => ({
        ...quest,
        companyId: this.companyId,
      }));

      await Quest.insertMany(questsToCreate);
      return true;
    } catch (error) {
      console.error('Error initializing default quests:', error);
      return false;
    }
  }

  // Get all quests for a company
  async getAllQuests(): Promise<IQuest[]> {
    try {
      await connectDB();
      return await Quest.find({ companyId: this.companyId }).sort({ questType: 1, questId: 1 });
    } catch (error) {
      console.error('Error getting all quests:', error);
      return [];
    }
  }

  // Get quest by ID
  async getQuestById(questId: string): Promise<IQuest | null> {
    try {
      await connectDB();
      return await Quest.findOne({ companyId: this.companyId, questId });
    } catch (error) {
      console.error('Error getting quest by ID:', error);
      return null;
    }
  }

  // Update quest configuration
  async updateQuest(questId: string, updates: Partial<{
    title: string;
    description: string;
    messageCount: number;
    successMessageCount: number;
    xpReward: number;
    isActive: boolean;
  }>): Promise<boolean> {
    try {
      await connectDB();
      const result = await Quest.findOneAndUpdate(
        { companyId: this.companyId, questId },
        { $set: updates },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('Error updating quest:', error);
      return false;
    }
  }

  // Get quests by type
  async getQuestsByType(questType: 'daily' | 'weekly'): Promise<IQuest[]> {
    try {
      await connectDB();
      return await Quest.find({ 
        companyId: this.companyId, 
        questType,
        isActive: true 
      }).sort({ questId: 1 });
    } catch (error) {
      console.error('Error getting quests by type:', error);
      return [];
    }
  }
}
