'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Star,
  EmojiEvents,
  Chat,
  WorkspacePremium,
  Mic,
  FlashOn,
} from '@mui/icons-material';
import { UserProfile } from '@/lib/services/UserService';

interface ProfileTabProps {
  userProfile: UserProfile;
  onRefresh: () => void;
}

export function ProfileTab({ userProfile, onRefresh }: ProfileTabProps) {
  const { user, levelInfo } = userProfile;
  const [isSimulating, setIsSimulating] = useState(false);

  const badges = [
    {
      id: 'bronze',
      name: 'Bronze',
      emoji: '🥉',
      description: 'Reach Level 1',
      unlocked: user.badges.bronze,
      image: '/badge/1.webp',
    },
    {
      id: 'silver',
      name: 'Silver',
      emoji: '🥈',
      description: 'Reach Level 5',
      unlocked: user.badges.silver,
      image: '/badge/2.webp',
    },
    {
      id: 'gold',
      name: 'Gold',
      emoji: '🥇',
      description: 'Reach Level 10',
      unlocked: user.badges.gold,
      image: '/badge/3.webp',
    },
    {
      id: 'platinum',
      name: 'Platinum',
      emoji: '💎',
      description: 'Reach Level 20',
      unlocked: user.badges.platinum,
      image: '/badge/4.webp',
    },
    {
      id: 'apex',
      name: 'Apex Reseller',
      emoji: '👑',
      description: 'Admin-allowed Apex Role',
      unlocked: user.badges.apex,
      image: '/badge/5.webp',
    },
  ];

  const simulateMessage = async (isSuccess = false) => {
    try {
      setIsSimulating(true);
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
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          elevation={8}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url(/banner.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.2,
              zIndex: 0,
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Avatar
                src={user.avatarUrl || '/default-avatar.png'}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                }}
              />
            </motion.div>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                @{user.username}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={3} alignItems="center">
                <Stack direction="row" alignItems="center" gap={1}>
                  <Star sx={{ color: '#fbbf24' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {user.xp} XP
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1}>
                  <EmojiEvents sx={{ color: '#f59e0b' }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    {user.points} Points
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Level Progress */}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>
                Level {levelInfo.level}
              </Typography>
              <Chip
                label={`${Math.round(levelInfo.nextLevelXP - (levelInfo.xp - levelInfo.currentLevelXP))} XP to next level`}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  color: 'white',
                  fontWeight: 600,
                  mt: { xs: 2, md: 0 },
                }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                  {levelInfo.xp - levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP
                </Typography>
                <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                  {Math.round(levelInfo.progress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={levelInfo.progress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    borderRadius: 6,
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Section - Replaces Grid with Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4, width: '100%' }}>
          <Card
            elevation={8}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: 3,
              flex: 1,
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Chat sx={{ fontSize: 40, color: 'white', mb: 2 }} />
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                {user.stats.messages}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Messages
              </Typography>
            </CardContent>
          </Card>
          <Card
            elevation={8}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 3,
              flex: 1,
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <WorkspacePremium sx={{ fontSize: 40, color: 'white', mb: 2 }} />
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                {user.stats.successMessages}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Success
              </Typography>
            </CardContent>
          </Card>
          <Card
            elevation={8}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: 3,
              flex: 1,
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Mic sx={{ fontSize: 40, color: 'white', mb: 2 }} />
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                {user.stats.voiceMinutes}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Voice Min
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </motion.div>

      {/* Badges Section - Also with Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
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
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 3, textAlign: 'center' }}>
              BADGES
            </Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center" alignItems="stretch">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  style={{ width: '160px', flex: '1 1 160px', marginBottom: 16 }}
                >
                  <Card
                    elevation={8}
                    sx={{
                      background: badge.unlocked
                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'rgba(75, 85, 99, 0.3)',
                      borderRadius: 3,
                      textAlign: 'center',
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      opacity: badge.unlocked ? 1 : 0.5,
                      border: badge.unlocked ? '2px solid #fbbf24' : '2px solid transparent',
                    }}
                  >
                    <Box
                      component="img"
                      src={badge.image}
                      alt={badge.name}
                      sx={{
                        width: 60,
                        height: 60,
                        mx: 'auto',
                        mb: 2,
                        filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                      }}
                    />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      {badge.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {badge.description}
                    </Typography>
                  </Card>
                </motion.div>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      {/* Power Level Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          elevation={8}
          sx={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            borderRadius: 3,
            mb: 4,
            border: '2px solid #6366f1',
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
              POWER LEVEL: {user.level}
            </Typography>
            <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 600 }}>
              Power Level
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Simulation Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card
          elevation={8}
          sx={{
            background: 'rgba(15, 15, 35, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 3, textAlign: 'center' }}>
              Simulate Activity (Testing)
            </Typography>
            <Stack direction="row" gap={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => simulateMessage(false)}
                disabled={isSimulating}
                startIcon={<Chat />}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  },
                }}
              >
                Send Message (+5 XP)
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => simulateMessage(true)}
                disabled={isSimulating}
                startIcon={<FlashOn />}
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  },
                }}
              >
                Success Message (+15 XP)
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}