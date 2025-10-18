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
  Chat,
  GpsFixed as Target,
  Campaign,
  EmojiEvents,
} from '@mui/icons-material';
import { QuestCompletionModal } from './QuestCompletionModal';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'daily' | 'weekly'>('daily');

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

  const handleQuestSectionClick = (questType: 'daily' | 'weekly') => {
    if (!progress) return;
    
    const quests = questType === 'daily' ? dailyQuests : weeklyQuests;
    const completedQuests = quests.filter(quest => quest.completed);
    
    if (completedQuests.length > 0) {
      setModalType(questType);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
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
      icon: Chat,
    },
    {
      id: 'success1',
      title: 'Send 1 Success Message',
      description: 'Send 1 message in a success channel',
      progress: progress.daily.successMsgCount,
      target: 1,
      completed: progress.daily.completed.success1 || false,
      xp: 10,
      icon: Target,
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
      icon: Campaign,
    },
    {
      id: 'success10',
      title: 'Send 10 Success Messages',
      description: 'Send 10 messages in success channels',
      progress: progress.weekly.successMsgCount,
      target: 10,
      completed: progress.weekly.completed.success10 || false,
      xp: 50,
      icon: EmojiEvents,
    },
  ];

  const QuestCard = ({ quest, index }: { quest: { id: string; title: string; description: string; progress: number; target: number; completed: boolean; xp: number; icon: React.ComponentType<{ sx?: object }> }; index: number }) => {
    const IconComponent = quest.icon;
    const progressPercentage = Math.min(100, (quest.progress / quest.target) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.15,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        whileHover={{ 
          scale: 1.02,
          y: -8,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      >
      <Card
        elevation={0}
        sx={{
          background: quest.completed 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(30, 30, 60, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: quest.completed 
            ? '2px solid #10b981'
            : '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 4,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: quest.completed 
            ? '0 25px 50px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : '0 25px 50px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: quest.completed 
              ? 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)'
              : 'linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
            transform: 'translateX(-100%)',
            animation: quest.completed 
              ? 'shimmer 3s infinite'
              : 'shimmer 4s infinite',
            zIndex: 1,
          },
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
          },
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <motion.div
                animate={quest.completed ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                } : {}}
                transition={{ 
                  duration: 0.6,
                  repeat: quest.completed ? Infinity : 0,
                  repeatDelay: 2
                }}
              >
                {quest.completed ? (
                  <CheckCircle sx={{ color: 'white', fontSize: 28, filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))' }} />
                ) : (
                  <RadioButtonUnchecked sx={{ color: '#a1a1aa', fontSize: 28 }} />
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {quest.title}
                </Typography>
              </motion.div>
            </Box>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Chip
                label={`+${quest.xp} XP`}
                sx={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 8px 20px rgba(251, 191, 36, 0.4)',
                  border: '1px solid rgba(251, 191, 36, 0.5)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { boxShadow: '0 8px 20px rgba(251, 191, 36, 0.4)' },
                    '50%': { boxShadow: '0 8px 30px rgba(251, 191, 36, 0.6)' },
                  },
                }}
              />
            </motion.div>
          </Box>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
              {quest.description}
            </Typography>
          </motion.div>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Progress
              </Typography>
              <motion.div
                key={quest.progress}
                initial={{ scale: 1.2, color: '#fbbf24' }}
                animate={{ scale: 1, color: 'rgba(255, 255, 255, 0.8)' }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="body2" sx={{ color: 'inherit' }}>
                  {quest.progress} / {quest.target}
                </Typography>
              </motion.div>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.15) !important',
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'transparent !important',
                    background: quest.completed 
                      ? 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%) !important'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, rgb(179, 11, 245) 100%) !important',
                    borderRadius: 6,
                    boxShadow: quest.completed 
                      ? '0 2px 8px rgba(255, 255, 255, 0.4)'
                      : `
                          0 0 20px rgba(139, 92, 246, 0.6),
                          0 0 40px rgba(236, 72, 153, 0.4),
                          0 2px 8px rgba(245, 158, 11, 0.3)
                        `,
                    position: 'relative',
                    filter: quest.completed ? 'none' : 'contrast(1.1) saturate(1.2)',
                    '&::before': quest.completed ? {} : {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 50%, rgba(245, 158, 11, 0.3) 100%)',
                      borderRadius: 6,
                      animation: 'holographicPulse 3s ease-in-out infinite',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: quest.completed 
                        ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                      animation: 'progressShine 2s infinite',
                    },
                  },
                  '& .MuiLinearProgress-bar1Determinate': {
                    backgroundColor: 'transparent !important',
                    background: quest.completed 
                      ? 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%) !important'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, rgb(179, 11, 245) 100%) !important',
                  },
                  '@keyframes progressShine': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                  },
                  '@keyframes holographicPulse': {
                    '0%, 100%': { 
                      opacity: 0.3,
                      filter: 'hue-rotate(0deg) brightness(1)'
                    },
                    '50%': { 
                      opacity: 0.6,
                      filter: 'hue-rotate(20deg) brightness(1.1)'
                    },
                  },
                }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  borderRadius: 6,
                }}
              />
            </Box>
          </Box>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <motion.div
              animate={quest.completed ? { 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ 
                duration: 0.5,
                repeat: quest.completed ? Infinity : 0,
                repeatDelay: 3
              }}
            >
              <IconComponent sx={{ 
                color: quest.completed ? '#fbbf24' : 'white', 
                fontSize: 32,
                filter: quest.completed ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' : 'none'
              }} />
            </motion.div>
            <motion.div
              key={quest.completed ? 'completed' : 'remaining'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="body2" sx={{ 
                color: quest.completed ? '#fbbf24' : 'rgba(255, 255, 255, 0.8)',
                fontWeight: quest.completed ? 600 : 400
              }}>
                {quest.completed ? 'Completed!' : `${quest.target - quest.progress} remaining`}
              </Typography>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
    );
  };

  return (
    <Box sx={{ 
      p: 3,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
        `,
        zIndex: 0,
        animation: 'backgroundFloat 20s ease-in-out infinite',
      },
      '@keyframes backgroundFloat': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '33%': { transform: 'translateY(-20px) rotate(1deg)' },
        '66%': { transform: 'translateY(10px) rotate(-1deg)' },
      },
    }}>
      {/* Daily Quests */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(30, 30, 60, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 4,
            mb: 4,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              left: -50,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              right: -30,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite reverse',
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' },
            },
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <CalendarToday sx={{ 
                    color: '#3b82f6', 
                    fontSize: 32,
                    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
                  }} />
                </motion.div>
                <motion.div
                  onClick={() => handleQuestSectionClick('daily')}
                  style={{ cursor: dailyQuests.every(quest => quest.completed) ? 'pointer' : 'default' }}
                  whileHover={dailyQuests.every(quest => quest.completed) ? { scale: 1.05 } : {}}
                  whileTap={dailyQuests.every(quest => quest.completed) ? { scale: 0.95 } : {}}
                >
                  <Typography variant="h4" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    background: dailyQuests.every(quest => quest.completed) 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: dailyQuests.every(quest => quest.completed) 
                      ? '0 0 10px rgba(16, 185, 129, 0.5)' 
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    Daily Quests
                  </Typography>
                </motion.div>
              </Box>
            </motion.div>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ width: '100%' }}>
              {dailyQuests.map((quest, index) => (
                <Box key={quest.id} sx={{ flex: 1, minWidth: 0 }}>
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
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 0.2,
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(30, 30, 60, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: 4,
            mb: 4,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -40,
              right: -40,
              width: '80px',
              height: '80px',
              background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 7s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: '70px',
              height: '70px',
              background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 9s ease-in-out infinite reverse',
            },
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    repeatDelay: 4
                  }}
                >
                  <Schedule sx={{ 
                    color: '#8b5cf6', 
                    fontSize: 32,
                    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))'
                  }} />
                </motion.div>
                <motion.div
                  onClick={() => handleQuestSectionClick('weekly')}
                  style={{ cursor: weeklyQuests.every(quest => quest.completed) ? 'pointer' : 'default' }}
                  whileHover={weeklyQuests.every(quest => quest.completed) ? { scale: 1.05 } : {}}
                  whileTap={weeklyQuests.every(quest => quest.completed) ? { scale: 0.95 } : {}}
                >
                  <Typography variant="h4" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    background: weeklyQuests.every(quest => quest.completed) 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: weeklyQuests.every(quest => quest.completed) 
                      ? '0 0 10px rgba(16, 185, 129, 0.5)' 
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    Weekly Quests
                  </Typography>
                </motion.div>
              </Box>
            </motion.div>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ width: '100%' }}>
              {weeklyQuests.map((quest, index) => (
                <Box key={quest.id} sx={{ flex: 1, minWidth: 0 }}>
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
          elevation={12}
          sx={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            border: '2px solid #6366f1',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
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

      {/* Quest Completion Modal */}
      <QuestCompletionModal
        open={modalOpen}
        onClose={handleModalClose}
        questType={modalType}
        completedQuests={
          modalType === 'daily' 
            ? dailyQuests.filter(quest => quest.completed).map(quest => ({
                id: quest.id,
                title: quest.title,
                xp: quest.xp,
              }))
            : weeklyQuests.filter(quest => quest.completed).map(quest => ({
                id: quest.id,
                title: quest.title,
                xp: quest.xp,
              }))
        }
      />
    </Box>
  );
}