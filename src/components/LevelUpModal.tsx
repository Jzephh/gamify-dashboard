'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Star, EmojiEvents, AutoAwesome } from '@mui/icons-material';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  return (
    <Dialog
      open={show}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none',
          borderRadius: 4,
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Paper
            elevation={24}
            sx={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
              borderRadius: 4,
              p: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated background elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                left: -50,
                width: 100,
                height: 100,
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 3s ease-in-out infinite',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                right: -30,
                width: 80,
                height: 80,
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 3s ease-in-out infinite reverse',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              {/* Trophy Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <EmojiEvents sx={{ fontSize: 60, color: 'white' }} />
                </Box>
              </motion.div>

              {/* Sparkles */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    animation: 'sparkle 2s ease-in-out infinite',
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 40, color: 'rgba(255, 255, 255, 0.8)' }} />
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 40,
                    left: 20,
                    animation: 'sparkle 2s ease-in-out infinite 0.5s',
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 30, color: 'rgba(255, 255, 255, 0.6)' }} />
                </Box>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 800,
                    mb: 2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  🎉 Level Up! 🎉
                </Typography>
              </motion.div>

              {/* Level Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '4rem',
                    mb: 3,
                    textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Level {level}
                </Typography>
              </motion.div>

              {/* Congratulations Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 3,
                    p: 3,
                    mb: 4,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                    <Star sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      Congratulations!
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.6,
                    }}
                  >
                    You&apos;ve reached a new level! Keep up the great work and continue your journey to the top.
                  </Typography>
                </Paper>
              </motion.div>

              {/* Features List */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      ✨ New level unlocked
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, justifyContent: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      🏆 Progress towards next level
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      💎 Potential new badges available
                    </Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* Close Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleClose}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#d97706',
                    fontWeight: 700,
                    px: 6,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Awesome!
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </DialogContent>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </Dialog>
  );
}