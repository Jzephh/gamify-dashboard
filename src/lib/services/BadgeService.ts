import { User } from '@/models/User';
import { Settings } from '@/models/Settings';
import connectDB from '@/lib/mongodb';

export interface BadgeInfo {
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}

export class BadgeService {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  // Update user badges based on level and roles
  async updateUserBadges(userId: string): Promise<{
    newBadges: string[];
    allBadges: BadgeInfo[];
  }> {
    try {
      await connectDB();
      const user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) return { newBadges: [], allBadges: [] };

      const settings = await Settings.findOne({ companyId: this.companyId });
      if (!settings) return { newBadges: [], allBadges: [] };

      const newBadges: string[] = [];

      // Update badges based on level
      if (user.level >= 1 && !user.badges.bronze) {
        user.badges.bronze = true;
        newBadges.push('bronze');
      }

      if (user.level >= 5 && !user.badges.silver) {
        user.badges.silver = true;
        newBadges.push('silver');
      }

      if (user.level >= 10 && !user.badges.gold) {
        user.badges.gold = true;
        newBadges.push('gold');
      }

      if (user.level >= 20 && !user.badges.platinum) {
        user.badges.platinum = true;
        newBadges.push('platinum');
      }

      // Check for Apex badge (role-based)
      if (settings.apexRoleId && user.roles.includes(settings.apexRoleId) && !user.badges.apex) {
        user.badges.apex = true;
        newBadges.push('apex');
      }

      // Save if there are changes
      if (newBadges.length > 0) {
        await user.save();
      }

      // Get all badges info
      const allBadges = this.getUserBadges(user);

      return { newBadges, allBadges };
    } catch (error) {
      console.error('Error updating user badges:', error);
      return { newBadges: [], allBadges: [] };
    }
  }

  // Get user's badge information
  getUserBadges(user: { badges: { bronze: boolean; silver: boolean; gold: boolean; platinum: boolean; apex: boolean } }): BadgeInfo[] {
    return [
      {
        name: 'Bronze',
        emoji: '🥉',
        description: 'Reach Level 1',
        unlocked: user.badges.bronze,
      },
      {
        name: 'Silver',
        emoji: '🥈',
        description: 'Reach Level 5',
        unlocked: user.badges.silver,
      },
      {
        name: 'Gold',
        emoji: '🥇',
        description: 'Reach Level 10',
        unlocked: user.badges.gold,
      },
      {
        name: 'Platinum',
        emoji: '💎',
        description: 'Reach Level 20',
        unlocked: user.badges.platinum,
      },
      {
        name: 'Apex Reseller',
        emoji: '👑',
        description: 'Admin-allowed Apex Role',
        unlocked: user.badges.apex,
      },
    ];
  }

  // Manually unlock a badge (admin function)
  async unlockBadge(userId: string, badgeType: 'bronze' | 'silver' | 'gold' | 'platinum' | 'apex'): Promise<boolean> {
    try {
      await connectDB();
      const user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) return false;

      if (!user.badges[badgeType]) {
        user.badges[badgeType] = true;
        await user.save();
        return true;
      }

      return false; // Already unlocked
    } catch (error) {
      console.error('Error unlocking badge:', error);
      return false;
    }
  }

  // Lock a badge (admin function)
  async lockBadge(userId: string, badgeType: 'bronze' | 'silver' | 'gold' | 'platinum' | 'apex'): Promise<boolean> {
    try {
      await connectDB();
      const user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) return false;

      if (user.badges[badgeType]) {
        user.badges[badgeType] = false;
        await user.save();
        return true;
      }

      return false; // Already locked
    } catch (error) {
      console.error('Error locking badge:', error);
      return false;
    }
  }
}
