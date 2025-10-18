'use client';

import {
  Box,
  Typography,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Star,
  Chat,
  WorkspacePremium,
} from '@mui/icons-material';
import { UserProfile } from '@/lib/services/UserService';

interface ProfileTabProps {
  userProfile: UserProfile;
  onRefresh: () => void;
}

export function ProfileTab({ userProfile }: ProfileTabProps) {
  const { user, levelInfo } = userProfile;

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
      {/* Header Banner */}
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
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
              transform: 'translateX(-100%)',
              animation: 'shimmer 3s infinite',
              zIndex: 1,
            },
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' },
            },
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
          <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
              animate={{ 
                rotate: [0, 2, -2, 0],
                scale: [1, 1.02, 1]
              }}
              style={{
                animation: 'avatarFloat 4s ease-in-out infinite'
              }}
            >
              <Avatar
                src={user.avatarUrl || '/default-avatar.png'}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)',
                  filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))',
                }}
              />
            </motion.div>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Typography variant="h3" sx={{ 
                  color: 'white', 
                  fontWeight: 800, 
                  mb: 1,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {user.name}
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                  @{user.username}
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={3} alignItems="center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Star sx={{ 
                          color: '#fbbf24',
                          filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))'
                        }} />
                      </motion.div>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        {user.xp} XP
                      </Typography>
                    </Stack>
                  </motion.div>
                </Stack>
              </motion.div>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Level Progress */}
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
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 4,
            mb: 4,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -30,
              left: -30,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 5s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -20,
              right: -20,
              width: '40px',
              height: '40px',
              background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 7s ease-in-out infinite reverse',
            },
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Level {levelInfo.level}
                </Typography>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <Chip
                    label={`${Math.round(levelInfo.nextLevelXP - (levelInfo.xp - levelInfo.currentLevelXP))} XP to next level`}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      color: 'white',
                      fontWeight: 600,
                      mt: { xs: 2, md: 0 },
                      boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)' },
                        '50%': { boxShadow: '0 8px 30px rgba(99, 102, 241, 0.6)' },
                      },
                    }}
                  />
                </motion.div>
              </Box>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                    {levelInfo.xp - levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP
                  </Typography>
                  <motion.div
                    key={levelInfo.progress}
                    initial={{ scale: 1.2, color: '#fbbf24' }}
                    animate={{ scale: 1, color: '#a1a1aa' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="body2" sx={{ color: 'inherit' }}>
                      {Math.round(levelInfo.progress)}%
                    </Typography>
                  </motion.div>
                </Box>
                <Box sx={{ position: 'relative' }}>
                  <LinearProgress
                    variant="determinate"
                    value={levelInfo.progress}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.15)',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                        borderRadius: 6,
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                          animation: 'progressShine 2s infinite',
                        },
                      },
                      '@keyframes progressShine': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' },
                      },
                    }}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelInfo.progress}%` }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
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
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Section - Replaces Grid with Stack */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 0.3,
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4, width: '100%' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ flex: 1 }}
          >
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: 4,
                height: '100%',
                boxShadow: '0 25px 50px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent)',
                  borderRadius: '50%',
                  animation: 'float 4s ease-in-out infinite',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3, position: 'relative', zIndex: 2 }}>
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
                    fontSize: 40, 
                    color: 'white', 
                    mb: 2,
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                  }} />
                </motion.div>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                  {user.stats.messages}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Messages
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ flex: 1 }}
          >
            <Card
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: 4,
                height: '100%',
                boxShadow: '0 25px 50px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent)',
                  borderRadius: '50%',
                  animation: 'float 5s ease-in-out infinite reverse',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3, position: 'relative', zIndex: 2 }}>
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
                  <WorkspacePremium sx={{ 
                    fontSize: 40, 
                    color: 'white', 
                    mb: 2,
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
                  }} />
                </motion.div>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 1 }}>
                  {user.stats.successMessages}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Success
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Stack>
      </motion.div>

      {/* Badges Section - Also with Stack */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 0.4,
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
            border: '1px solid rgba(251, 191, 36, 0.3)',
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
              background: 'linear-gradient(45deg, rgba(251, 191, 36, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, rgba(245, 158, 11, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite reverse',
            },
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                fontWeight: 700, 
                mb: 3, 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                BADGES
              </Typography>
            </motion.div>
            <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center" alignItems="stretch">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.6 + index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ width: '160px', flex: '1 1 160px', marginBottom: 16 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      background: badge.unlocked 
                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        : 'linear-gradient(135deg, rgba(75, 85, 99, 0.3) 0%, rgba(55, 65, 81, 0.2) 100%)',
                      borderRadius: 4,
                      textAlign: 'center',
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      opacity: badge.unlocked ? 1 : 0.6,
                      border: badge.unlocked ? '2px solid #fbbf24' : '1px solid rgba(75, 85, 99, 0.3)',
                      boxShadow: badge.unlocked 
                        ? '0 20px 40px rgba(251, 191, 36, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : '0 10px 20px rgba(0, 0, 0, 0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': badge.unlocked ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                        transform: 'translateX(-100%)',
                        animation: 'shimmer 3s infinite',
                        zIndex: 1,
                      } : {},
                      '@keyframes shimmer': {
                        '0%': { transform: 'translateX(-100%)' },
                        '100%': { transform: 'translateX(100%)' },
                      },
                    }}
                  >
                    <motion.div
                      style={{ position: 'relative', zIndex: 2 }}
                      animate={badge.unlocked ? { 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      } : {}}
                      transition={{ 
                        duration: 2,
                        repeat: badge.unlocked ? Infinity : 0,
                        repeatDelay: 4
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
                          filter: badge.unlocked 
                            ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))' 
                            : 'grayscale(100%)',
                        }}
                      />
                    </motion.div>
                    <Typography variant="h6" sx={{ 
                      color: 'white', 
                      fontWeight: 600, 
                      mb: 1,
                      position: 'relative',
                      zIndex: 2
                    }}>
                      {badge.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)',
                      position: 'relative',
                      zIndex: 2
                    }}>
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
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 0.5,
          type: "spring",
          stiffness: 100,
          damping: 20
        }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            borderRadius: 4,
            mb: 4,
            border: '2px solid #6366f1',
            boxShadow: '0 25px 50px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
              bottom: -50,
              right: -50,
              width: '100px',
              height: '100px',
              background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite reverse',
            },
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 200 }}
            >
              <Typography variant="h2" sx={{ 
                color: 'white', 
                fontWeight: 800, 
                mb: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))',
              }}>
                POWER LEVEL: {user.level}
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Typography variant="h6" sx={{ 
                color: '#ef4444', 
                fontWeight: 600,
                filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))',
              }}>
                Power Level
              </Typography>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}