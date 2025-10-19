'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Chat,
  Campaign,
  EmojiEvents,
  CardGiftcard,
  GpsFixed,
  Star,
} from '@mui/icons-material';
import { QuestCompletionModal } from './QuestCompletionModal';

interface QuestObjective {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  xp: number;
  order: number;
}

interface QuestProgress {
  daily: {
    msgCount: number;
    successMsgCount: number;
    objectives: QuestObjective[];
    questSeen?: boolean;
    notificationCount?: number;
  };
  weekly: {
    msgCount: number;
    successMsgCount: number;
    objectives: QuestObjective[];
    questSeen?: boolean;
    notificationCount?: number;
  };
}


interface QuestsTabProps {
  userId: string;
  onQuestUpdate?: () => void;
}

export default function QuestsTab({ userId, onQuestUpdate }: QuestsTabProps) {
  const [progress, setProgress] = useState<QuestProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'daily' | 'weekly'>('daily');
  const [completedQuestsForModal, setCompletedQuestsForModal] = useState<Array<{ id: string; title: string; xp: number }>>([]);
  const [hasCheckedNotifications, setHasCheckedNotifications] = useState(false);

  const fetchQuestProgress = async () => {
    try {
      const response = await fetch('/api/user/quests');
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      } else {
        console.error('Failed to fetch quest progress');
      }
    } catch (error) {
      console.error('Error fetching quest progress:', error);
    } finally {
      setLoading(false);
    }
  };


  const checkForQuestNotifications = (questData: QuestProgress) => {
    console.log('Checking quest notifications:', {
      dailyQuestSeen: questData.daily.questSeen,
      weeklyQuestSeen: questData.weekly.questSeen
    });

    // Check daily objectives
    if (!questData.daily.questSeen) {
      const completedDailyObjectives = questData.daily.objectives.filter(obj => obj.completed && !obj.claimed);
      console.log('Completed daily objectives:', completedDailyObjectives);
      if (completedDailyObjectives.length > 0) {
        console.log('Opening daily quest modal with:', completedDailyObjectives);
        setModalType('daily');
        setCompletedQuestsForModal(completedDailyObjectives.map(obj => ({
          id: obj.id,
          title: obj.title,
          xp: obj.xp,
        })));
        setModalOpen(true);
        return;
      }
    }

    // Check weekly objectives
    if (!questData.weekly.questSeen) {
      const completedWeeklyObjectives = questData.weekly.objectives.filter(obj => obj.completed && !obj.claimed);
      console.log('Completed weekly objectives:', completedWeeklyObjectives);
      if (completedWeeklyObjectives.length > 0) {
        setModalType('weekly');
        setCompletedQuestsForModal(completedWeeklyObjectives.map(obj => ({
          id: obj.id,
          title: obj.title,
          xp: obj.xp,
        })));
        setModalOpen(true);
        return;
      }
    }
  };

  const handleQuestSectionClick = (questType: 'daily' | 'weekly') => {
    if (!progress) return;
    
    const objectives = questType === 'daily' ? dailyObjectives : weeklyObjectives;
    const completedObjectives = objectives.filter(obj => obj.completed && !obj.claimed);
    
    if (completedObjectives.length > 0) {
      setModalType(questType);
      setCompletedQuestsForModal(completedObjectives.map(obj => ({
        id: obj.id,
        title: obj.title,
        xp: obj.xp,
      })));
      setModalOpen(true);
    }
  };

  const handleModalClose = async () => {
    setModalOpen(false);
    
    // Mark quests as seen when user closes modal
    try {
      await fetch('/api/user/quest-seen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questType: modalType }),
      });
      
      // Refresh quest progress to update seen status
      await fetchQuestProgress();
      
      // Update parent notification count
      onQuestUpdate?.();
    } catch (error) {
      console.error('Error marking quest as seen:', error);
    }
    
    setCompletedQuestsForModal([]);
  };

  const handleClaimObjective = async (objectiveId: string) => {
    try {
      const response = await fetch('/api/user/claim-quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ objectiveId }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Refresh quest progress to get updated claimed status from database
        await fetchQuestProgress();
        
        // Update parent notification count
        onQuestUpdate?.();
        
        // Get fresh quest data to find the claimed objective
        const freshResponse = await fetch('/api/user/quests');
        if (freshResponse.ok) {
          const freshData = await freshResponse.json();
          const allObjectives = [...(freshData?.daily.objectives || []), ...(freshData?.weekly.objectives || [])];
          const claimedObjective = allObjectives.find(obj => obj.id === objectiveId);
          
          if (claimedObjective) {
            // Determine quest type for modal
            const questType = freshData?.daily.objectives.some((obj: QuestObjective) => obj.id === objectiveId) ? 'daily' : 'weekly';
            setModalType(questType);
            
            // Set completed objectives for modal (just the claimed one)
            setCompletedQuestsForModal([{
              id: claimedObjective.id,
              title: claimedObjective.title,
              xp: result.xpAwarded || claimedObjective.xp,
            }]);
            
            setModalOpen(true);
          }
        }
      } else {
        console.error('Failed to claim objective');
      }
    } catch (error) {
      console.error('Error claiming objective:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchQuestProgress();
    }
  }, [userId]);

  useEffect(() => {
    if (progress && !hasCheckedNotifications) {
      checkForQuestNotifications(progress);
      setHasCheckedNotifications(true);
    }
  }, [progress, hasCheckedNotifications]);

  useEffect(() => {
    if (userId) {
      setHasCheckedNotifications(false);
    }
  }, [userId]);

  // Get objectives from progress data
  const dailyObjectives = progress?.daily.objectives || [];
  const weeklyObjectives = progress?.weekly.objectives || [];

  // Objective Card Component
  const ObjectiveCard = ({ objective, index }: { 
    objective: QuestObjective; 
    index: number; 
  }) => {
    const progressPercentage = Math.min(100, (objective.progress / objective.target) * 100);
    const isLocked = false; // All objectives are independent - no sequential locking
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6,
          delay: index * 0.1,
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          elevation={0}
          sx={{
            background: isLocked 
              ? 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
              : progressPercentage === 100
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            border: isLocked 
              ? '1px solid #6b7280'
              : progressPercentage === 100
                ? '1px solid #10b981'
                : '1px solid #6366f1',
            borderRadius: 3,
            boxShadow: isLocked 
              ? '0 4px 12px rgba(0, 0, 0, 0.2)'
              : progressPercentage === 100
                ? '0 8px 25px rgba(16, 185, 129, 0.3)'
                : '0 8px 25px rgba(99, 102, 241, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            opacity: isLocked ? 0.6 : 1,
            cursor: isLocked ? 'not-allowed' : 'default',
          }}
        >
          <CardContent sx={{ p: 3, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <motion.div
                  animate={progressPercentage === 100 ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  } : {}}
                  transition={{ 
                    duration: 0.6,
                    repeat: progressPercentage === 100 ? Infinity : 0,
                    repeatDelay: 2
                  }}
                >
                  {isLocked ? (
                    <RadioButtonUnchecked sx={{ color: '#6b7280', fontSize: 24 }} />
                  ) : progressPercentage === 100 ? (
                    <CheckCircle sx={{ color: 'white', fontSize: 24, filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))' }} />
                  ) : (
                    <RadioButtonUnchecked sx={{ color: '#a1a1aa', fontSize: 24 }} />
                  )}
                </motion.div>
                <Box>
                  <Typography variant="h6" sx={{ 
                    color: isLocked ? '#6b7280' : 'white', 
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    {objective.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: isLocked ? '#6b7280' : 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.8rem'
                  }}>
                    Step {objective.order}
                  </Typography>
                </Box>
              </Box>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
              >
                <Chip
                  label={`+${objective.xp} XP`}
                  sx={{
                    background: isLocked 
                      ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                      : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    boxShadow: isLocked 
                      ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                      : '0 4px 12px rgba(251, 191, 36, 0.4)',
                  }}
                />
              </motion.div>
            </Box>
            
            <Typography variant="body2" sx={{ 
              color: isLocked ? '#6b7280' : 'rgba(255, 255, 255, 0.8)', 
              mb: 2,
              fontSize: '0.9rem'
            }}>
              {objective.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ 
                  color: isLocked ? '#6b7280' : 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.8rem'
                }}>
                  Progress
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: isLocked ? '#6b7280' : 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.8rem'
                }}>
                  {objective.progress} / {objective.target}
                </Typography>
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isLocked ? '#374151' : 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: isLocked 
                      ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                      : objective.completed 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
            
            {/* Claim Button or Status */}
            {isLocked ? (
              <Chip
                label="Complete previous step"
                sx={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              />
            ) : progressPercentage === 100 && !objective.claimed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleClaimObjective(objective.id)}
                  startIcon={<CardGiftcard />}
                  sx={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      boxShadow: '0 6px 16px rgba(251, 191, 36, 0.5)',
                    },
                  }}
                >
                  Claim
                </Button>
              </motion.div>
            ) : objective.claimed ? (
              <Chip
                icon={<CheckCircle />}
                label="Claimed"
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              />
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    );
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

  return (
    <Box sx={{ 
      p: 3,
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      overflow: 'hidden',
    }}>
      {/* Background Effects */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
        zIndex: 0,
      }} />

      {/* Quest Section Headers */}
      <Box sx={{ position: 'relative', zIndex: 1, mb: 4 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 4,
          mb: 4
        }}>
          {/* Daily Quests Header */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(30, 30, 60, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 4,
                p: 3,
                boxShadow: '0 25px 50px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                  <Chat sx={{ 
                    color: '#3b82f6', 
                    fontSize: 32,
                    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
                  }} />
                </motion.div>
                <motion.div
                  onClick={() => handleQuestSectionClick('daily')}
                  style={{ cursor: dailyObjectives.some(obj => obj.completed && !obj.claimed) ? 'pointer' : 'default' }}
                  whileHover={dailyObjectives.some(obj => obj.completed && !obj.claimed) ? { scale: 1.05 } : {}}
                  whileTap={dailyObjectives.some(obj => obj.completed && !obj.claimed) ? { scale: 0.95 } : {}}
                >
                  <Typography variant="h4" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    background: dailyObjectives.some(obj => obj.completed && !obj.claimed)
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: dailyObjectives.some(obj => obj.completed && !obj.claimed)
                      ? '0 0 10px rgba(16, 185, 129, 0.5)' 
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    Daily Quests
                  </Typography>
                </motion.div>
              </Box>
            </Card>
          </motion.div>

          {/* Weekly Quests Header */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.8,
              delay: 0.1,
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(30, 30, 60, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: 4,
                p: 3,
                boxShadow: '0 25px 50px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 4
                  }}
                >
                  <EmojiEvents sx={{ 
                    color: '#8b5cf6', 
                    fontSize: 32,
                    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))'
                  }} />
                </motion.div>
                <motion.div
                  onClick={() => handleQuestSectionClick('weekly')}
                  style={{ cursor: weeklyObjectives.some(obj => obj.completed && !obj.claimed) ? 'pointer' : 'default' }}
                  whileHover={weeklyObjectives.some(obj => obj.completed && !obj.claimed) ? { scale: 1.05 } : {}}
                  whileTap={weeklyObjectives.some(obj => obj.completed && !obj.claimed) ? { scale: 0.95 } : {}}
                >
                  <Typography variant="h4" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    background: weeklyObjectives.some(obj => obj.completed && !obj.claimed)
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: weeklyObjectives.some(obj => obj.completed && !obj.claimed)
                      ? '0 0 10px rgba(16, 185, 129, 0.5)' 
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}>
                    Weekly Quests
                  </Typography>
                </motion.div>
              </Box>
            </Card>
          </motion.div>
        </Box>
      </Box>

      {/* Sequential Objectives Layout */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 3, md: 4 },
          mb: 4
        }}>
          {/* Daily Objectives - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {dailyObjectives.length > 0 ? (
                dailyObjectives.map((objective, index) => (
                  <ObjectiveCard 
                    key={objective.id} 
                    objective={objective} 
                    index={index}
                  />
                ))
              ) : (
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                  border: '1px solid #6b7280',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    No daily objectives available
                  </Typography>
                </Card>
              )}
            </Box>
          </motion.div>

          {/* Weekly Objectives - Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
              duration: 0.8,
              delay: 0.1,
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {weeklyObjectives.length > 0 ? (
                weeklyObjectives.map((objective, index) => (
                  <ObjectiveCard 
                    key={objective.id} 
                    objective={objective} 
                    index={index}
                  />
                ))
              ) : (
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                  border: '1px solid #6b7280',
                  borderRadius: 3,
                  p: 3,
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    No weekly objectives available
                  </Typography>
                </Card>
              )}
            </Box>
          </motion.div>
        </Box>
      </Box>

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
                    Complete objectives in order to unlock the next step
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CardGiftcard sx={{ color: '#3b82f6', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Each objective gives XP when claimed
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Campaign sx={{ color: '#8b5cf6', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Daily objectives reset every day
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmojiEvents sx={{ color: '#fbbf24', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Weekly objectives reset every week
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
        completedQuests={completedQuestsForModal}
      />
    </Box>
  );
}