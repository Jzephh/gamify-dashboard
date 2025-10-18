import { User } from '@/models/User';
import { Settings } from '@/models/Settings';
import connectDB from '@/lib/mongodb';

export class XPEngine {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  // Calculate XP needed to reach a level (simple progression: 100, 200, 300, 400, 500...)
  private calculateXPForLevel(level: number): number {
    return 100 * level;
  }

  // Calculate level from XP (simple: level = floor(xp / 100))
  private calculateLevelFromXP(xp: number): number {
    return Math.floor(xp / 100);
  }

  // Award XP to user (simulated message)
  async awardXP(userId: string, xpAmount: number, isSuccessChannel: boolean = false): Promise<{
    success: boolean;
    newLevel?: number;
    levelUp?: boolean;
    totalXP: number;
    reason?: string;
  }> {
    try {
      await connectDB();

      // Get settings (will create default if not found)
      let settings = await Settings.findOne({ companyId: this.companyId });
      if (!settings) {
        settings = new Settings({
          companyId: this.companyId,
          timezone: 'America/New_York',
          successChannelIds: [],
          powerRoles: {},
          xp: {
            perMessage: 5,
            successBonus: 10,
            cooldownSeconds: 30,
          },
          quest: {
            daily: {
              send10: 15,
              success1: 10,
            },
            weekly: {
              send100: 50,
              success10: 50,
            },
          },
        });
        await settings.save();
      }

      // Calculate XP amount
      const baseXP = isSuccessChannel ? 
        settings.xp.perMessage + settings.xp.successBonus : 
        settings.xp.perMessage;

      // Get or create user
      let user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) {
        user = new User({
          companyId: this.companyId,
          userId,
          username: 'unknown',
          name: 'Unknown User',
          xp: 0,
          level: 0,
          points: 0,
          badges: {
            bronze: false,
            silver: false,
            gold: false,
            platinum: false,
            apex: false,
          },
          roles: [],
          stats: {
            messages: 0,
            successMessages: 0,
            voiceMinutes: 0,
          },
          levelUpSeen: true,
        });
      }

      // Award XP
      const oldLevel = user.level;
      user.xp += baseXP;
      user.level = this.calculateLevelFromXP(user.xp);
      
      // Update stats
      user.stats.messages += 1;
      if (isSuccessChannel) {
        user.stats.successMessages += 1;
      }

      // Mark level up as unseen if user leveled up
      if (user.level > oldLevel) {
        user.levelUpSeen = false;
      }

      // Save user
      await user.save();

      const levelUp = user.level > oldLevel;
      const response: { success: boolean; totalXP: number; newLevel?: number; levelUp?: boolean } = {
        success: true,
        totalXP: user.xp,
      };
      if (levelUp) {
        response.newLevel = user.level;
        response.levelUp = true;
      }
      return response;
    } catch (error: unknown) {
      console.error('Error awarding XP:', error);
      return { success: false, totalXP: 0, reason: 'Database error' };
    }
  }

  // Get user level info
  async getUserLevel(userId: string): Promise<{
    level: number;
    xp: number;
    nextLevelXP: number; // XP needed for next level
    currentLevelXP: number; // XP at start of current level
    progress: number;
  } | null> {
    try {
      await connectDB();
      const user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) return null;

      // Recalculate level based on current XP
      const correctLevel = this.calculateLevelFromXP(user.xp);
      
      // Update user level if it's incorrect
      if (user.level !== correctLevel) {
        user.level = correctLevel;
        await user.save();
      }

      const currentLevelXP = this.calculateXPForLevel(user.level); // XP at start of current level
      const nextLevelXP = this.calculateXPForLevel(user.level + 1); // XP needed for next level
      const progress = ((user.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

      return {
        level: user.level,
        xp: user.xp,
        nextLevelXP: nextLevelXP - currentLevelXP, // XP needed to reach next level
        currentLevelXP,
        progress: Math.min(100, Math.max(0, progress)),
      };
    } catch (error: unknown) {
      console.error('Error getting user level:', error);
      return null;
    }
  }
}
