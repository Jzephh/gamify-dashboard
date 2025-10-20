'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Container,
  Grid,
  Paper,
  LinearProgress,
  Tooltip,
  IconButton,
  Fade,
  Zoom,
} from '@mui/material';
import {
  EmojiEvents,
  MilitaryTech,
  Star,
  EmojiEvents as Trophy,
  Search as SearchIcon,
  TrendingUp,
  Person,
  Message,
  AutoAwesome,
  StarBorder,
  Star as StarFilled,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import InputAdornment from '@mui/material/InputAdornment';

interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  name: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  badges: {
    bronze: boolean;
    silver: boolean;
    gold: boolean;
    platinum: boolean;
    apex: boolean;
  };
  stats: {
    messages: number;
    successMessages: number;
    voiceMinutes: number;
  };
}

interface LeaderboardData {
  users: LeaderboardUser[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return (
    <Box sx={{ 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 48,
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      borderRadius: '50%',
      boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)',
      animation: 'pulse 2s infinite',
      '@keyframes pulse': {
        '0%': { transform: 'scale(1)', boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)' },
        '50%': { transform: 'scale(1.05)', boxShadow: '0 6px 25px rgba(255, 215, 0, 0.6)' },
        '100%': { transform: 'scale(1)', boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)' },
      }
    }}>
      <EmojiEvents sx={{ color: '#fff', fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
    </Box>
  );
  if (rank === 2) return (
    <Box sx={{ 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 48,
      background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
      borderRadius: '50%',
      boxShadow: '0 4px 20px rgba(192, 192, 192, 0.4)',
    }}>
      <MilitaryTech sx={{ color: '#fff', fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
    </Box>
  );
  if (rank === 3) return (
    <Box sx={{ 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 48,
      background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
      borderRadius: '50%',
      boxShadow: '0 4px 20px rgba(205, 127, 50, 0.4)',
    }}>
      <Star sx={{ color: '#fff', fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
    </Box>
  );
  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 48,
      height: 48,
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      borderRadius: '50%',
      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
    }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1.1rem' }}>
        #{rank}
      </Typography>
    </Box>
  );
};

const getBadgeIcon = (badgeType: string): React.ReactElement | undefined => {
  switch (badgeType) {
    case 'bronze': return <Image src="/badge/1.webp" alt="Bronze Badge" width={16} height={16} />;
    case 'silver': return <Image src="/badge/2.webp" alt="Silver Badge" width={16} height={16} />;
    case 'gold': return <Image src="/badge/3.webp" alt="Gold Badge" width={16} height={16} />;
    case 'platinum': return <Image src="/badge/4.webp" alt="Platinum Badge" width={16} height={16} />;
    case 'apex': return <Image src="/badge/5.webp" alt="Apex Badge" width={16} height={16} />;
    default: return undefined;
  }
};

const getBadgeColor = (badgeType: string) => {
  switch (badgeType) {
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'platinum': return '#E5E4E2';
    case 'apex': return '#8A2BE2';
    default: return '#666';
  }
};

export function LeaderboardTab() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');

  const fetchLeaderboard = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/user/leaderboard?page=${page}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchLeaderboard(currentPage);
  }, [currentPage, fetchLeaderboard]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Filter and sort users (client-side for current page)
  const getFilteredSortedUsers = () => {
    if (!leaderboardData) return [];
    let users = leaderboardData.users;
    // Filter
    if (search.trim()) {
      const lower = search.trim().toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(lower) ||
        user.username.toLowerCase().includes(lower)
      );
    }
    users = [...users].sort((a, b) => b.xp - a.xp);
    return users;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (!leaderboardData || leaderboardData.users.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">No users found in the leaderboard.</Alert>
      </Box>
    );
  }

  // Get users for display after filter/sort
  const usersToShow = getFilteredSortedUsers();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section with Search */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          {/* Animated Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                textShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: 4,
                  background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
                  borderRadius: 2,
                }
              }}
            >
              🏆 Leaderboard
            </Typography>
          </motion.div>
          
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, fontWeight: 300 }}>
            Top {leaderboardData.totalCount} users competing for glory
          </Typography>

          {/* Premium Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Paper
              elevation={0}
              sx={{
                maxWidth: 500,
                mx: 'auto',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                p: 2,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
              }}
            >
              <TextField
                fullWidth
                placeholder="Search by name or username..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#667eea', mr: 1 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: '1.1rem',
                    color: 'white',
                    '& input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        opacity: 1,
                      }
                    }
                  }
                }}
              />
            </Paper>
          </motion.div>
        </Box>
      </motion.div>

      {/* Leaderboard Cards */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Box>
            {usersToShow.map((user, index) => (
              <Box key={user.userId} sx={{ mb: 3 }}>
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card
                    sx={{
                      background: user.rank <= 3 
                        ? `linear-gradient(135deg, ${
                            user.rank === 1 ? 'rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1)' :
                            user.rank === 2 ? 'rgba(192, 192, 192, 0.15), rgba(168, 168, 168, 0.1)' :
                            'rgba(205, 127, 50, 0.15), rgba(184, 134, 11, 0.1)'
                          }, rgba(30, 30, 30, 0.8))`
                        : 'linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(20, 20, 20, 0.8))',
                      border: user.rank <= 3 
                        ? `2px solid ${
                            user.rank === 1 ? '#FFD700' : 
                            user.rank === 2 ? '#C0C0C0' : 
                            '#CD7F32'
                          }`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      '&::before': user.rank <= 3 ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${
                          user.rank === 1 ? '#FFD700, #FFA500' :
                          user.rank === 2 ? '#C0C0C0, #A8A8A8' :
                          '#CD7F32, #B8860B'
                        })`,
                        zIndex: 1,
                      } : {},
                      '&:hover': {
                        boxShadow: user.rank <= 3 
                          ? `0 20px 40px rgba(${
                              user.rank === 1 ? '255, 215, 0, 0.3' :
                              user.rank === 2 ? '192, 192, 192, 0.3' :
                              '205, 127, 50, 0.3'
                            })`
                          : '0 20px 40px rgba(102, 126, 234, 0.2)',
                        transform: 'translateY(-4px)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={3}>
                        {/* Left Section: Rank + Avatar + Info */}
                        <Box display="flex" alignItems="center" gap={3} flex={1} minWidth={300}>
                          {/* Rank Badge */}
                          <Box sx={{ position: 'relative' }}>
                            {getRankIcon(user.rank)}
                            {user.rank <= 3 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                                  borderRadius: '50%',
                                  width: 24,
                                  height: 24,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)',
                                }}
                              >
                                {user.rank}
                              </Box>
                            )}
                          </Box>

                          {/* Avatar */}
                          <Avatar
                            src={user.avatarUrl}
                            alt={user.name}
                            sx={{ 
                              width: 72, 
                              height: 72, 
                              border: user.rank <= 3 ? '3px solid #667eea' : '2px solid rgba(255, 255, 255, 0.2)',
                              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>

                          {/* User Info */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                fontWeight: 700, 
                                color: 'white',
                                mb: 0.5,
                                background: user.rank <= 3 
                                  ? `linear-gradient(135deg, ${
                                      user.rank === 1 ? '#FFD700, #FFA500' :
                                      user.rank === 2 ? '#C0C0C0, #A8A8A8' :
                                      '#CD7F32, #B8860B'
                                    })`
                                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                              }}
                            >
                              {user.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                              @{user.username}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {Object.entries(user.badges).map(([badgeType, hasBadge]) =>
                                hasBadge ? (
                                  <Tooltip key={badgeType} title={`${badgeType.charAt(0).toUpperCase() + badgeType.slice(1)} Badge`}>
                                    <Chip
                                      icon={getBadgeIcon(badgeType)}
                                      label={badgeType.charAt(0).toUpperCase() + badgeType.slice(1)}
                                      size="small"
                                      sx={{
                                        background: `linear-gradient(135deg, ${getBadgeColor(badgeType)}, ${getBadgeColor(badgeType)}dd)`,
                                        color: badgeType === 'silver' || badgeType === 'platinum' ? '#000' : '#fff',
                                        fontWeight: 600,
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                        },
                                        transition: 'transform 0.2s',
                                      }}
                                    />
                                  </Tooltip>
                                ) : null
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {/* Right Section: Stats */}
                        <Box display="flex" gap={4} alignItems="center" flexWrap="wrap">
                          {/* Level */}
                          <Box textAlign="center">
                            <Box
                              sx={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                mb: 1,
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                              }}
                            >
                              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                                {user.level}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                              Level
                            </Typography>
                          </Box>

                          {/* XP */}
                          <Box textAlign="center">
                            <Box
                              sx={{
                                background: 'linear-gradient(135deg, #11998e, #38ef7d)',
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                mb: 1,
                                boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)',
                              }}
                            >
                              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                                {user.xp.toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                              XP
                            </Typography>
                          </Box>

                          {/* Messages */}
                          <Box textAlign="center">
                            <Box
                              sx={{
                                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                                borderRadius: 3,
                                px: 3,
                                py: 1.5,
                                mb: 1,
                                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                              }}
                            >
                              <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                                {user.stats.messages.toLocaleString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                              Messages
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            ))}
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {leaderboardData.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Box display="flex" justifyContent="center" mt={6}>
            <Pagination
              count={leaderboardData.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'white',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                  },
                },
              }}
            />
          </Box>
        </motion.div>
      )}

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, leaderboardData.totalCount)} of {leaderboardData.totalCount} users
          </Typography>
        </Box>
      </motion.div>
    </Container>
  );
}
