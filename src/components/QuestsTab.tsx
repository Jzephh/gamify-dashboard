'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Target, Calendar, Clock } from 'lucide-react';

interface QuestProgress {
  daily: {
    msgCount: number;
    successMsgCount: number;
    completed: {
      send10?: boolean;
      success1?: boolean;
    };
  };
  weekly: {
    msgCount: number;
    successMsgCount: number;
    completed: {
      send100?: boolean;
      success10?: boolean;
    };
  };
}

interface QuestsTabProps {
  userId: string;
}

export function QuestsTab({ userId }: QuestsTabProps) {
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestProgress();
  }, [userId]);

  const fetchQuestProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/quests');
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Error fetching quest progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="text-center">Loading quest progress...</div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="text-center">Failed to load quest progress</div>
      </div>
    );
  }

  const dailyQuests = [
    {
      id: 'send10',
      title: 'Send 10 Messages',
      description: 'Send 10 messages in any channel',
      progress: progress.daily.msgCount,
      target: 10,
      completed: progress.daily.completed.send10 || false,
      xp: 15,
    },
    {
      id: 'success1',
      title: 'Send 1 Success Message',
      description: 'Send 1 message in a success channel',
      progress: progress.daily.successMsgCount,
      target: 1,
      completed: progress.daily.completed.success1 || false,
      xp: 10,
    },
  ];

  const weeklyQuests = [
    {
      id: 'send100',
      title: 'Send 100 Messages',
      description: 'Send 100 messages in any channel',
      progress: progress.weekly.msgCount,
      target: 100,
      completed: progress.weekly.completed.send100 || false,
      xp: 50,
    },
    {
      id: 'success10',
      title: 'Send 10 Success Messages',
      description: 'Send 10 messages in success channels',
      progress: progress.weekly.successMsgCount,
      target: 10,
      completed: progress.weekly.completed.success10 || false,
      xp: 50,
    },
  ];

  const QuestCard = ({ quest }: { quest: { id: string; title: string; description: string; progress: number; target: number; completed: boolean; xp: number } }) => (
    <div className={`bg-white/10 rounded-lg p-4 ${quest.completed ? 'ring-2 ring-green-400' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {quest.completed ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Circle className="w-5 h-5 text-white/50" />
          )}
          <h3 className="font-semibold">{quest.title}</h3>
        </div>
        <div className="text-sm text-yellow-400 font-semibold">+{quest.xp} XP</div>
      </div>
      
      <p className="text-sm text-white/70 mb-3">{quest.description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{quest.progress} / {quest.target}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              quest.completed ? 'bg-green-400' : 'bg-blue-400'
            }`}
            style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Daily Quests */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Daily Quests</h2>
        </div>
        
        <div className="grid gap-4">
          {dailyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
        
        <div className="mt-4 text-sm text-white/70">
          Daily quests reset every day at midnight.
        </div>
      </div>

      {/* Weekly Quests */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold">Weekly Quests</h2>
        </div>
        
        <div className="grid gap-4">
          {weeklyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
        
        <div className="mt-4 text-sm text-white/70">
          Weekly quests reset every Monday at midnight.
        </div>
      </div>

      {/* Quest Tips */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold">Quest Tips</h3>
        </div>
        <ul className="space-y-2 text-sm text-white/70">
          <li>• Complete daily quests for consistent XP gains</li>
          <li>• Focus on weekly quests for larger XP rewards</li>
          <li>• Success messages give bonus XP</li>
          <li>• Quest progress is tracked automatically</li>
        </ul>
      </div>
    </div>
  );
}
