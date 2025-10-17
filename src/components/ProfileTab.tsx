'use client';

import { UserProfile } from '@/lib/services/UserService';
import { Button } from '@/components/ui/button';
import { Trophy, Star, MessageSquare, Mic, Award } from 'lucide-react';

interface ProfileTabProps {
  userProfile: UserProfile;
  onRefresh: () => void;
}

export function ProfileTab({ userProfile, onRefresh }: ProfileTabProps) {
  const { user, levelInfo } = userProfile;
  
  // Define badges directly to avoid importing BadgeService at module level
  const badges = [
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

  const simulateMessage = async (isSuccess = false) => {
    try {
      const response = await fetch('/api/user/simulate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuccess }),
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error simulating message:', error);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          <img
            src={user.avatarUrl || '/default-avatar.png'}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-white/20"
          />
          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
            Lv.{user.level}
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <p className="text-white/70">@{user.username}</p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{user.xp} XP</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-blue-400" />
              <span>{user.points} Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold">Level {levelInfo.level}</span>
          <span className="text-sm text-white/70">
            {levelInfo.xp - levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progress}%` }}
          />
        </div>
        <p className="text-sm text-white/70 mt-1">
          {Math.round(levelInfo.nextLevelXP - (levelInfo.xp - levelInfo.currentLevelXP))} XP to next level
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-400" />
          <div className="text-2xl font-bold">{user.stats.messages}</div>
          <div className="text-sm text-white/70">Messages</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <Award className="w-6 h-6 mx-auto mb-2 text-green-400" />
          <div className="text-2xl font-bold">{user.stats.successMessages}</div>
          <div className="text-sm text-white/70">Success</div>
        </div>
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <Mic className="w-6 h-6 mx-auto mb-2 text-purple-400" />
          <div className="text-2xl font-bold">{user.stats.voiceMinutes}</div>
          <div className="text-sm text-white/70">Voice Min</div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Badges</h3>
        <div className="grid grid-cols-5 gap-4">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`bg-white/10 rounded-lg p-4 text-center transition-all ${
                badge.unlocked ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <div className="text-3xl mb-2">{badge.emoji}</div>
              <div className="text-sm font-semibold">{badge.name}</div>
              <div className="text-xs text-white/70">{badge.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation Controls (for testing) */}
      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg font-semibold mb-4">Simulate Activity (Testing)</h3>
        <div className="flex space-x-4">
          <Button
            onClick={() => simulateMessage(false)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send Message (+5 XP)
          </Button>
          <Button
            onClick={() => simulateMessage(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Success Message (+15 XP)
          </Button>
        </div>
      </div>
    </div>
  );
}
