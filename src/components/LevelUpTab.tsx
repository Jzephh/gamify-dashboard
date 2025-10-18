'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Star,
} from '@mui/icons-material';

interface LevelUpNotification {
  id: string;
  level: number;
  xp: number;
  seen: boolean;
  createdAt: string;
}

interface LevelUpTabProps {
  userId: string;
  onNotificationSeen: (notificationId: string) => void;
}

export function LevelUpTab({ userId, onNotificationSeen }: LevelUpTabProps) {
  const [notifications, setNotifications] = useState<LevelUpNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/levelup-notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching level-up notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSeen = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/user/levelup-notifications/${notificationId}/seen`, {
        method: 'POST',
      });
      
      if (response.ok) {
        onNotificationSeen(notificationId);
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white' }}>
          Loading level-up notifications...
        </Typography>
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white' }}>
          No level-up notifications
        </Typography>
      </Box>
    );
  }

  const currentNotification = notifications[currentIndex];

  if (!currentNotification) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white' }}>
          All notifications viewed!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `
              0 0 40px rgba(139, 92, 246, 0.6),
              0 0 80px rgba(236, 72, 153, 0.4),
              0 25px 50px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            filter: 'contrast(1.1) saturate(1.2)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
              transform: 'translateX(-100%)',
              animation: 'holographicShimmer 3s infinite',
              zIndex: 1,
            },
            '@keyframes holographicShimmer': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' },
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <motion.div
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.8, 
                type: "spring", 
                stiffness: 200, 
                damping: 15 
              }}
            >
              <Star
                sx={{
                  fontSize: '4rem',
                  color: '#ffffff',
                  filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
                  animation: 'starPulse 2s ease-in-out infinite',
                  '@keyframes starPulse': {
                    '0%, 100%': { 
                      transform: 'scale(1) rotate(0deg)',
                      filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))'
                    },
                    '50%': { 
                      transform: 'scale(1.1) rotate(180deg)',
                      filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 1))'
                    },
                  },
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Typography
                variant="h2"
                sx={{
                  color: '#ffffff',
                  fontWeight: 900,
                  mb: 2,
                  textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
                  animation: 'textGlow 2s ease-in-out infinite',
                  '@keyframes textGlow': {
                    '0%, 100%': { 
                      textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)'
                    },
                    '50%': { 
                      textShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 0 20px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)'
                    },
                  },
                }}
              >
                LEVEL UP!
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 200 }}
            >
              <Typography
                variant="h1"
                sx={{
                  color: '#ffffff',
                  fontWeight: 800,
                  mb: 1,
                  textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.5)',
                }}
              >
                Level {currentNotification.level}
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 600,
                  mb: 4,
                  textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.5)',
                }}
              >
                {currentNotification.xp} Total XP
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => handleMarkAsSeen(currentNotification.id)}
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  color: '#000000',
                  fontWeight: 800,
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Continue
              </Button>
            </motion.div>
          </Box>
        </Paper>

        {notifications.length > 1 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {currentIndex + 1} of {notifications.length} notifications
            </Typography>
          </Box>
        )}
      </motion.div>
    </Box>
  );
}
