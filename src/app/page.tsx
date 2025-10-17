'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileTab } from '@/components/ProfileTab';
import { QuestsTab } from '@/components/QuestsTab';
import { AdminTab } from '@/components/AdminTab';
import { LevelUpModal } from '@/components/LevelUpModal';
import { UserProfile } from '@/lib/services/UserService';

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile');
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to access this application');
        } else {
          setError('Failed to load user profile');
        }
        return;
      }

      const profile: UserProfile = await response.json();
      setUserProfile(profile);
      setIsAdmin(profile.user.roles.length > 0);
      
      // Show level up modal if user hasn't seen it
      if (!profile.user.levelUpSeen) {
        setShowLevelUpModal(true);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLevelUpSeen = async () => {
    try {
      await fetch('/api/user/levelup-seen', { method: 'POST' });
      setShowLevelUpModal(false);
      // Refresh profile to update levelUpSeen status
      fetchUserProfile();
    } catch (err) {
      console.error('Error marking level up as seen:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl text-center">
          <div className="mb-4">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">No user data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            PowerLevel Dashboard
          </h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="quests">Quests</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <ProfileTab userProfile={userProfile} onRefresh={fetchUserProfile} />
            </TabsContent>
            
            <TabsContent value="quests" className="mt-6">
              <QuestsTab userId={userProfile.user.userId} />
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="admin" className="mt-6">
                <AdminTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {showLevelUpModal && (
        <LevelUpModal
          level={userProfile.levelInfo.level}
          onClose={handleLevelUpSeen}
        />
      )}
    </div>
  );
}