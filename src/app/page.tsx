'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container, Typography, Tabs, Tab, Paper } from '@mui/material';
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h1" sx={{ textAlign: 'center', mb: 4 }}>
              PowerLevel Dashboard
            </Typography>
          </motion.div>
          
          <Paper
            elevation={24}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(15, 15, 35, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                background: 'rgba(15, 15, 35, 0.6)',
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  height: 3,
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
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