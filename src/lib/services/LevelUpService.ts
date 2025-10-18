import { LevelUpNotification } from '@/models/LevelUpNotification';
import connectDB from '@/lib/mongodb';

export interface LevelUpNotificationData {
  id: string;
  level: number;
  xp: number;
  seen: boolean;
  createdAt: Date;
}

export class LevelUpService {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  // Create a new level-up notification
  async createLevelUpNotification(userId: string, level: number, xp: number): Promise<void> {
    try {
      await connectDB();
      
      const notification = new LevelUpNotification({
        companyId: this.companyId,
        userId,
        level,
        xp,
        seen: false,
      });
      
      await notification.save();
    } catch (error) {
      console.error('Error creating level-up notification:', error);
    }
  }

  // Get all unseen level-up notifications for a user
  async getUnseenNotifications(userId: string): Promise<LevelUpNotificationData[]> {
    try {
      await connectDB();
      
      const notifications = await LevelUpNotification.find({
        companyId: this.companyId,
        userId,
        seen: false,
      }).sort({ createdAt: 1 }); // Oldest first
      
      return notifications.map(notification => ({
        id: notification._id.toString(),
        level: notification.level,
        xp: notification.xp,
        seen: notification.seen,
        createdAt: notification.createdAt,
      }));
    } catch (error) {
      console.error('Error getting unseen notifications:', error);
      return [];
    }
  }

  // Mark a specific notification as seen
  async markAsSeen(notificationId: string): Promise<void> {
    try {
      await connectDB();
      
      await LevelUpNotification.findByIdAndUpdate(notificationId, {
        seen: true,
      });
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  }

  // Mark all notifications as seen (for cleanup)
  async markAllAsSeen(userId: string): Promise<void> {
    try {
      await connectDB();
      
      await LevelUpNotification.updateMany({
        companyId: this.companyId,
        userId,
        seen: false,
      }, {
        seen: true,
      });
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  }
}
