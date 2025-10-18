'use client';

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  EmojiEvents,
  CheckCircle,
} from '@mui/icons-material';

interface QuestCompletionModalProps {
  open: boolean;
  onClose: () => void;
  questType: 'daily' | 'weekly';
  completedQuests: Array<{
    id: string;
    title: string;
    xp: number;
  }>;
}

export function QuestCompletionModal({ 
  open, 
  onClose, 
  questType, 
  completedQuests 
}: QuestCompletionModalProps) {
  const totalXP = completedQuests.reduce((sum, quest) => sum + quest.xp, 0);
  const questTypeLabel = questType === 'daily' ? 'Daily' : 'Weekly';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          borderRadius: 4,
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #111827 100%), linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
          boxShadow: `
            0 0 40px rgba(139, 92, 246, 0.6),
            0 0 80px rgba(236, 72, 153, 0.4),
            0 25px 50px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          position: 'relative',
          overflow: 'hidden',
          filter: 'contrast(1.1) saturate(1.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            left: -50,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1))',
            borderRadius: '50%',
            animation: 'holographicFloat 6s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.2), rgba(245, 158, 11, 0.1))',
            borderRadius: '50%',
            animation: 'holographicFloat 8s ease-in-out infinite reverse',
          },
          '@keyframes holographicFloat': {
            '0%, 100%': { 
              transform: 'translateY(0px) rotate(0deg)',
              filter: 'hue-rotate(0deg) brightness(1)'
            },
            '50%': { 
              transform: 'translateY(-20px) rotate(180deg)',
              filter: 'hue-rotate(20deg) brightness(1.1)'
            },
          },
        },
      }}
    >
      <DialogContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
          >
            <EmojiEvents sx={{ 
              fontSize: 80, 
              color: '#f59e0b', 
              filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.8))',
              mb: 2 
            }} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Typography
              variant="h3"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                mb: 1,
                textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.5)',
              }}
            >
              🎉 {questTypeLabel} Quests Complete!
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 600,
                mb: 3,
                textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              You&apos;ve completed all {questTypeLabel.toLowerCase()} quests!
            </Typography>
          </motion.div>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
              Completed Quests:
            </Typography>
            <Stack spacing={2}>
              {completedQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2,
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                        {quest.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={`+${quest.xp} XP`}
                      sx={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        color: 'white',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                      }}
                    />
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            p: 3,
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: 3,
            border: '1px solid rgba(245, 158, 11, 0.3)',
            mb: 3,
          }}>
            <Typography variant="h4" sx={{ 
              color: '#f59e0b', 
              fontWeight: 800,
              textShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
            }}>
              Total XP Earned: +{totalXP}
            </Typography>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={onClose}
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                color: '#000000',
                fontWeight: 800,
                px: 4,
                py: 2,
                borderRadius: 3,
                boxShadow: '0 8px 20px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                  boxShadow: '0 12px 25px rgba(255, 255, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Awesome!
            </Button>
          </Box>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
