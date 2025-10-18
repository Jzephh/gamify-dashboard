'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  RadioButtonUnchecked,
  CalendarToday,
  Schedule,
  GpsFixed,
  Star,
} from '@mui/icons-material';

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
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white' }}>
          Loading quest progress...
        </Typography>
      </Box>
    );
  }

  if (!progress) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white' }}>
          Failed to load quest progress
        </Typography>
      </Box>
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
      icon: '💬',
    },
    {
      id: 'success1',
      title: 'Send 1 Success Message',
      description: 'Send 1 message in a success channel',
      progress: progress.daily.successMsgCount,
      target: 1,
      completed: progress.daily.completed.success1 || false,
      xp: 10,
      icon: '🎯',
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
      icon: '📢',
    },
    {
      id: 'success10',
      title: 'Send 10 Success Messages',
      description: 'Send 10 messages in success channels',
      progress: progress.weekly.successMsgCount,
      target: 10,
      completed: progress.weekly.completed.success10 || false,
      xp: 50,
      icon: '🏆',
    },
  ];

  const QuestCard = ({ quest, index }: { quest: { id: string; title: string; description: string; progress: number; target: number; completed: boolean; xp: number; icon: string }; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        elevation={8}
        sx={{
          background: quest.completed 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'rgba(15, 15, 35, 0.8)',
          backdropFilter: 'blur(20px)',
          border: quest.completed 
            ? '2px solid #10b981'
            : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {quest.completed ? (
                <CheckCircle sx={{ color: 'white', fontSize: 28 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#a1a1aa', fontSize: 28 }} />
              )}
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                {quest.title}
              </Typography>
            </Box>
            
            <Chip
              label={`+${quest.xp} XP`}
              sx={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
          
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
            {quest.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Progress
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {quest.progress} / {quest.target}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (quest.progress / quest.target) * 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: quest.completed 
                    ? 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h4" sx={{ color: 'white' }}>
              {quest.icon}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {quest.completed ? 'Completed!' : `${quest.target - quest.progress} remaining`}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Daily Quests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          elevation={8}
          sx={{
            background: 'rgba(15, 15, 35, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <CalendarToday sx={{ color: '#3b82f6', fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                Daily Quests
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} flexWrap="wrap">
              {dailyQuests.map((quest, index) => (
                <Box key={quest.id} sx={{ width: { xs: '100%', md: '50%' }, mb: { xs: 3, md: 0 } }}>
                  <QuestCard quest={quest} index={index} />
                </Box>
              ))}
            </Stack>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Chip
                label="Daily quests reset every day at midnight"
                sx={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Quests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card
          elevation={8}
          sx={{
            background: 'rgba(15, 15, 35, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Schedule sx={{ color: '#8b5cf6', fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                Weekly Quests
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} flexWrap="wrap">
              {weeklyQuests.map((quest, index) => (
                <Box key={quest.id} sx={{ width: { xs: '100%', md: '50%' }, mb: { xs: 3, md: 0 } }}>
                  <QuestCard quest={quest} index={index} />
                </Box>
              ))}
            </Stack>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Chip
                label="Weekly quests reset every Monday at midnight"
                sx={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quest Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card
          elevation={8}
          sx={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            border: '2px solid #6366f1',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <GpsFixed sx={{ color: '#fbbf24', fontSize: 32 }} />
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                Quest Tips
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Star sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Complete daily quests for consistent XP gains
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Star sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Focus on weekly quests for larger XP rewards
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Star sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Success messages give bonus XP
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Star sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Quest progress is tracked automatically
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}