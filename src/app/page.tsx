'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Warning } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileTab } from '@/components/ProfileTab';
import { QuestsTab } from '@/components/QuestsTab';
import { AdminTab } from '@/components/AdminTab';
import { LevelUpModal } from '@/components/LevelUpModal';
import { UserProfile } from '@/lib/services/UserService';

// Create dark theme with custom colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#0f0f23',
      paper: 'rgba(15, 15, 35, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 15, 35, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 15, 35, 0.6)',
          borderRadius: '12px',
          padding: '8px',
        },
        indicator: {
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          borderRadius: '8px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#a1a1aa',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
          '&.Mui-selected': {
            color: '#ffffff',
          },
        },
      },
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h1" sx={{ textAlign: 'center' }}>
              Loading...
            </Typography>
          </motion.div>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h1" sx={{ textAlign: 'center', mb: 2 }}>
              ⚠️
            </Typography>
            <Typography variant="h2" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          </motion.div>
        </Box>
      </ThemeProvider>
    );
  }

  if (!userProfile) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h1" sx={{ textAlign: 'center' }}>
            No user data available
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%)',
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
        }}
      >
        {/* Animated background elements */}
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
            opacity: 0.1,
            zIndex: 0,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
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
        <Typography variant="h1" sx={{ 
          textAlign: 'center', 
          mb: 4,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 25px rgba(139, 92, 246, 0.8)) drop-shadow(0 0 40px rgba(236, 72, 153, 0.6))',
          textShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
          animation: 'holographicTitle 4s ease-in-out infinite',
          '@keyframes holographicTitle': {
            '0%, 100%': { 
              filter: 'drop-shadow(0 0 25px rgba(139, 92, 246, 0.8)) drop-shadow(0 0 40px rgba(236, 72, 153, 0.6))',
              textShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
            },
            '50%': { 
              filter: 'drop-shadow(0 0 35px rgba(139, 92, 246, 1)) drop-shadow(0 0 60px rgba(236, 72, 153, 0.8))',
              textShadow: '0 0 40px rgba(139, 92, 246, 0.8)'
            },
          },
        }}>
          PowerLevel Dashboard
        </Typography>
          </motion.div>

          {/* HUGE WARNING MESSAGE */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.6,
              delay: 0.1,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            <Paper
              elevation={0}
              sx={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                borderRadius: 3,
                p: 3,
                mb: 4,
                border: '3px solid #ef4444',
                boxShadow: `
                  0 0 30px rgba(220, 38, 38, 0.8),
                  0 0 60px rgba(185, 28, 28, 0.6),
                  0 10px 30px rgba(0, 0, 0, 0.5),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                position: 'relative',
                overflow: 'hidden',
                animation: 'warningPulse 2s ease-in-out infinite',
                '@keyframes warningPulse': {
                  '0%, 100%': { 
                    boxShadow: `
                      0 0 30px rgba(220, 38, 38, 0.8),
                      0 0 60px rgba(185, 28, 28, 0.6),
                      0 10px 30px rgba(0, 0, 0, 0.5)
                    `
                  },
                  '50%': { 
                    boxShadow: `
                      0 0 40px rgba(220, 38, 38, 1),
                      0 0 80px rgba(185, 28, 28, 0.8),
                      0 15px 40px rgba(0, 0, 0, 0.6)
                    `
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  animation: 'warningShimmer 3s infinite',
                  zIndex: 1,
                },
                '@keyframes warningShimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' },
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Warning 
                    sx={{ 
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      color: '#ffffff',
                      mr: 2,
                      filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
                      animation: 'warningIconPulse 2s ease-in-out infinite',
                      '@keyframes warningIconPulse': {
                        '0%, 100%': { 
                          transform: 'scale(1)',
                          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
                        },
                        '50%': { 
                          transform: 'scale(1.1)',
                          filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))'
                        },
                      },
                    }} 
                  />
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
                      animation: 'warningTextGlow 2s ease-in-out infinite',
                      '@keyframes warningTextGlow': {
                        '0%, 100%': { 
                          textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)'
                        },
                        '50%': { 
                          textShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 0 20px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)'
                        },
                      },
                    }}
                  >
                    HUGE WARNING
                  </Typography>
                  <Warning 
                    sx={{ 
                      fontSize: { xs: '2rem', md: '2.5rem' },
                      color: '#ffffff',
                      ml: 2,
                      filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
                      animation: 'warningIconPulse 2s ease-in-out infinite',
                      '@keyframes warningIconPulse': {
                        '0%, 100%': { 
                          transform: 'scale(1)',
                          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))'
                        },
                        '50%': { 
                          transform: 'scale(1.1)',
                          filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))'
                        },
                      },
                    }} 
                  />
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    textShadow: '0 0 15px rgba(0, 0, 0, 0.8), 0 1px 3px rgba(0, 0, 0, 0.5)',
                    lineHeight: 1.2,
                  }}
                >
                  If you leave eMoney, you will lose ALL your points/levels
                </Typography>
              </Box>
            </Paper>
          </motion.div>
          
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
          >
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(30, 30, 60, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  animation: 'shimmer 4s infinite',
                  zIndex: 1,
                },
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' },
                },
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(30, 30, 60, 0.6) 100%)',
                  position: 'relative',
                  zIndex: 2,
                  '& .MuiTabs-indicator': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    height: 4,
                    borderRadius: 2,
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
                  },
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      color: '#ffffff',
                      background: 'rgba(99, 102, 241, 0.1)',
                    },
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.05)',
                      color: 'rgba(255, 255, 255, 0.9)',
                    },
                  },
                }}
            >
              <Tab label="Profile" />
              <Tab label="Quests" />
              {isAdmin && <Tab label="Admin" />}
            </Tabs>
            
              <AnimatePresence mode="wait">
                <motion.div
                  key={tabValue}
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                >
                <TabPanel value={tabValue} index={0}>
                  <ProfileTab userProfile={userProfile} onRefresh={fetchUserProfile} />
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <QuestsTab userId={userProfile.user.userId} />
                </TabPanel>
                
                {isAdmin && (
                  <TabPanel value={tabValue} index={2}>
                    <AdminTab />
                  </TabPanel>
                  )}
                </motion.div>
              </AnimatePresence>
            </Paper>
          </motion.div>
        </Container>

        {showLevelUpModal && (
          <LevelUpModal
            level={userProfile.levelInfo.level}
            onClose={handleLevelUpSeen}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}