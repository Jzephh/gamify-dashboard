import { User } from '@/models/User';
import { XPEngine } from './XPEngine';
import { BadgeService } from './BadgeService';
import { getWhopSdk } from '@/lib/whop';
import connectDB from '@/lib/mongodb';
import { BOT_USER_ID } from '@/lib/constants';

const whopSdk = getWhopSdk();

export interface UserProfile {
  user: {
    userId: string;
    username: string;
    name: string;
    avatarUrl?: string;
    level: number;
    xp: number;
    points: number;
    badges: {
      bronze: boolean;
      silver: boolean;
      gold: boolean;
      platinum: boolean;
      apex: boolean;
    };
    roles: string[];
    stats: {
      messages: number;
      successMessages: number;
      voiceMinutes: number;
    };
    levelUpSeen: boolean;
  };
  levelInfo: {
    level: number;
    xp: number; // total xp
    nextLevelXP: number; // requirement for next level
    currentLevelXP: number; // cumulative at start of level
    progress: number;
  };
}

export class UserService {
  private companyId: string;
  private xpEngine: XPEngine;
  private badgeService: BadgeService;

  constructor(companyId: string) {
    this.companyId = companyId;
    this.xpEngine = new XPEngine(companyId);
    this.badgeService = new BadgeService(companyId);
  }

  // Get or create user profile with Whop data
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      await connectDB();
      // Get user from database
      let user = await User.findOne({ companyId: this.companyId, userId });
      
      if (!user) {
        // Try to get user data from Whop API
        const whopUser = await this.fetchWhopUserData(userId);
        if (!whopUser) {
          return null;
        }
        
        // Create new user in database
        user = new User({
          companyId: this.companyId,
          userId,
          username: whopUser.username,
          name: whopUser.name,
          avatarUrl: whopUser.profilePicture?.sourceUrl,
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
        
        await user.save();
      }

      // If user has placeholder values or missing avatar, refresh from Whop
      if (
        !user.avatarUrl ||
        user.username === 'unknown' ||
        user.name === 'Unknown User'
      ) {
        const whopUser = await this.fetchWhopUserData(userId);
        if (whopUser) {
          user.username = whopUser.username || user.username;
          user.name = whopUser.name || user.name;
          user.avatarUrl = whopUser.profilePicture?.sourceUrl ?? user.avatarUrl ?? '';
          await user.save();
        }
      }

      // Get level info
      const levelInfo = await this.xpEngine.getUserLevel(userId);
      if (!levelInfo) {
        return null;
      }

      // Update badges
      await this.badgeService.updateUserBadges(userId);

      // Refresh user data
      user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) return null;

      const userPayload: { user: UserProfile['user']; levelInfo: UserProfile['levelInfo'] } = {
        user: {
          userId: user.userId,
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl,
          level: user.level,
          xp: user.xp,
          points: user.points,
          badges: user.badges,
          roles: user.roles,
          stats: user.stats,
          levelUpSeen: user.levelUpSeen,
        },
        levelInfo,
      };
      return {
        user: userPayload.user,
        levelInfo: userPayload.levelInfo,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Fetch user data from Whop API
  private async fetchWhopUserData(userId: string): Promise<{
    username: string;
    name: string;
    profilePicture?: { sourceUrl?: string };
  } | null> {
    try {
      const whopUser = await whopSdk.users.getUser({ userId });
      
      return {
        username: whopUser.username || 'unknown',
        name: whopUser.name || 'Unknown User',
        profilePicture: whopUser.profilePicture,
      };
    } catch (error) {
      console.error('Error fetching Whop user data:', error);
      return null;
    }
  }

  // Update user data from Whop
  async syncUserFromWhop(userId: string): Promise<boolean> {
    try {
      await connectDB();
      const whopUser = await this.fetchWhopUserData(userId);
      if (!whopUser) return false;

      const user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) return false;

      // Update user data
      user.username = whopUser.username;
      user.name = whopUser.name;
      user.avatarUrl = whopUser.profilePicture?.sourceUrl ?? user.avatarUrl ?? '';
      
      await user.save();
      return true;
    } catch (error) {
      console.error('Error syncing user from Whop:', error);
      return false;
    }
  }

  // Mark level up as seen
  async markLevelUpSeen(userId: string): Promise<boolean> {
    try {
      await connectDB();
      const user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) return false;

      user.levelUpSeen = true;
      await user.save();
      return true;
    } catch (error) {
      console.error('Error marking level up as seen:', error);
      return false;
    }
  }

  // Get leaderboard with pagination and search
  async getLeaderboard(offset: number = 0, limit: number = 10, search: string = ''): Promise<{
    users: Array<{
      rank: number;
      userId: string;
      username: string;
      name: string;
      avatarUrl?: string;
      level: number;
      xp: number;
      badges: {
        bronze: boolean;
        silver: boolean;
        gold: boolean;
        platinum: boolean;
        apex: boolean;
      };
      stats: {
        messages: number;
        successMessages: number;
        voiceMinutes: number;
      };
    }>;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    try {
      await connectDB();
      
      // Build query
      const query: Record<string, unknown> = { 
        companyId: this.companyId,
        userId: { $ne: BOT_USER_ID } // Exclude bot user
      };

      // Add search filter if provided
      if (search.trim()) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Get total count (excluding bot user)
      const totalCount = await User.countDocuments(query);
      
      // Get users sorted by XP (descending), then by level (descending)
      const users = await User.find(query)
        .sort({ xp: -1, level: -1, 'stats.messages': -1 })
        .skip(offset)
        .limit(limit)
        .select('userId username name avatarUrl level xp badges stats')
        .lean();

      // Add rank to each user based on their global position
      const usersWithRank = await Promise.all(users.map(async (user) => {
        // Calculate global rank by counting users with higher XP
        const globalRank = await User.countDocuments({
          companyId: this.companyId,
          userId: { $ne: BOT_USER_ID },
          $or: [
            { xp: { $gt: user.xp } },
            { 
              xp: user.xp,
              level: { $gt: user.level }
            },
            {
              xp: user.xp,
              level: user.level,
              'stats.messages': { $gt: user.stats.messages }
            }
          ]
        }) + 1;

        return {
          rank: globalRank,
          userId: user.userId,
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl,
          level: user.level,
          xp: user.xp,
          badges: user.badges,
          stats: user.stats,
        };
      }));

      const currentPage = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = currentPage < totalPages;
      const hasPrevPage = currentPage > 1;

      return {
        users: usersWithRank,
        totalCount,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
      };
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return {
        users: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    try {
      await connectDB();
      const user = await User.findOne({ companyId: this.companyId, userId });
      if (!user) return false;

      // Check if user has any roles (admin roles are in the roles array)
      return user.roles.includes('admin') || user.roles.includes("Admin");
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}
