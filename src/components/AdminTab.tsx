'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Award, Star, Crown, Shield, Zap } from 'lucide-react';

interface AdminUser {
  _id: string;
  userId: string;
  username: string;
  name: string;
  level: number;
  xp: number;
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
  createdAt: string;
}

export function AdminTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [xpAmount, setXpAmount] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const awardXP = async (userId: string, amount: number) => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, xpAmount: amount }),
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh the list
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const updateBadge = async (userId: string, badgeType: string, action: 'unlock' | 'lock') => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, badgeType, action }),
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating badge:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const badgeTypes = [
    { key: 'bronze', name: 'Bronze', emoji: '🥉' },
    { key: 'silver', name: 'Silver', emoji: '🥈' },
    { key: 'gold', name: 'Gold', emoji: '🥇' },
    { key: 'platinum', name: 'Platinum', emoji: '💎' },
    { key: 'apex', name: 'Apex', emoji: '👑' },
  ];

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="text-center">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-8 h-8 text-red-400" />
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <p className="text-white/70">
          Manage user XP, badges, and roles. Use with caution - these actions affect user progression.
        </p>
      </div>

      {/* Users List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Users ({users.length})</h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user._id}
              className={`bg-white/10 rounded-lg p-4 cursor-pointer transition-all ${
                selectedUser?._id === user._id ? 'ring-2 ring-blue-400' : 'hover:bg-white/20'
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-white/70">@{user.username}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold">Lv.{user.level}</span>
                  </div>
                  <div className="text-sm text-white/70">{user.xp} XP</div>
                </div>
              </div>
              
              {/* Badge Status */}
              <div className="flex space-x-1 mt-2">
                {badgeTypes.map((badge) => (
                  <div
                    key={badge.key}
                    className={`text-lg ${user.badges[badge.key as keyof typeof user.badges] ? 'opacity-100' : 'opacity-30'}`}
                    title={`${badge.name} Badge`}
                  >
                    {badge.emoji}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Actions */}
      {selectedUser && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">
            Manage: {selectedUser.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* XP Management */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>XP Management</span>
              </h4>
              
              <div className="space-y-2">
                <label className="text-sm text-white/70">XP Amount</label>
                <input
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50"
                  min="1"
                  max="1000"
                />
              </div>
              
              <Button
                onClick={() => awardXP(selectedUser.userId, xpAmount)}
                disabled={actionLoading || xpAmount <= 0}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Award {xpAmount} XP
              </Button>
            </div>

            {/* Badge Management */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>Badge Management</span>
              </h4>
              
              <div className="space-y-2">
                {badgeTypes.map((badge) => {
                  const hasBadge = selectedUser.badges[badge.key as keyof typeof selectedUser.badges];
                  return (
                    <div key={badge.key} className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{badge.emoji}</span>
                        <span className="text-sm">{badge.name}</span>
                        {hasBadge && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          onClick={() => updateBadge(selectedUser.userId, badge.key, 'unlock')}
                          disabled={actionLoading || hasBadge}
                          className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                        >
                          Unlock
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateBadge(selectedUser.userId, badge.key, 'lock')}
                          disabled={actionLoading || !hasBadge}
                          className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1"
                        >
                          Lock
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
