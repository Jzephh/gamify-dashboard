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
  MenuItem,
} from '@mui/material';
import {
  EmojiEvents,
  MilitaryTech,
  Star,
  EmojiEvents as Trophy,
  Search as SearchIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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
  if (rank === 1) return <EmojiEvents sx={{ color: '#FFD700', fontSize: 24 }} />;
  if (rank === 2) return <MilitaryTech sx={{ color: '#C0C0C0', fontSize: 24 }} />;
  if (rank === 3) return <Star sx={{ color: '#CD7F32', fontSize: 24 }} />;
  return <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>#{rank}</Typography>;
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
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Modern Floating/Glow Search Box */}
      <Box sx={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4, 
        mt: { xs: 2, md: 4 },
        zIndex: 2,
      }}>
        <TextField
          label="Search users"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="medium"
          sx={{
            minWidth: { xs: 220, sm: 280, md: 340 },
            background: 'rgba(60,65,130,0.24)',
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(100,104,252,0.10)',
            input: { color: 'white' },
            '& label': { color: '#a1a1aa' },
            '& fieldset': { borderColor: 'rgba(139,92,246,0.25)' },
            '&:hover fieldset': { borderColor: '#8b5cf6' },
            mx: 'auto',
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#a1a1aa' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {/* Modern Leaderboard Header */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2rem', sm: '2.6rem', md: '3rem' },
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, #8b5cf6, #818cf8 40%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              letterSpacing: '-1px',
              textShadow: '0 2px 18px #07043d88',
              display: 'inline-block'
            }}
          >
            <Trophy sx={{ mr: 1, mb: -0.3, fontSize: 36, color: '#ffd700', filter: 'drop-shadow(0px 2px 4px #0002)' }} />
            Leaderboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            Top {leaderboardData.totalCount} users ranked by XP and level
          </Typography>
          <Divider sx={{ mx: 'auto', opacity: 0.1, width: { xs: '80%', md: '33%' }, borderBottomWidth: 3 }} />
        </motion.div>
      </Box>
      {/* User Cards */}
      <Box sx={{ mb: 3 }}>
        {usersToShow.map((user, index) => (
          <Box key={user.userId} sx={{ mb: 2, px: { xs: 0, sm: 1, md: 2 } }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card
                sx={{
                  background: user.rank <= 3 
                    ? `linear-gradient(120deg, ${user.rank === 1 ? '#fff8e133' : user.rank === 2 ? '#f5f8ff33' : '#241c1b44'}, rgba(36,34,67,0.44))`
                    : 'rgba(22,22,34,0.76)',
                  border: user.rank <= 3 ? `2px solid ${user.rank === 1 ? '#FFD700cc' : user.rank === 2 ? '#C0C0C0cc' : '#CD7F32cc'}` : '1px solid #232344',
                  borderRadius: 3.5,
                  boxShadow: user.rank <= 3 
                    ? `0 8px 24px rgba(124,58,237,0.08)` : '0 2px 10px rgba(8,10,44,0.12)',
                  px: { xs: 1.5, sm: 4 },
                  py: { xs: 1.5, sm: 3 },
                  transition: 'all 0.25s',
                  '&:hover': {
                    background:
                      user.rank === 1
                        ? 'linear-gradient(95deg, #ffe174e3, #ffebb8aa, #c7d2fe40)'
                        : user.rank === 2
                        ? 'linear-gradient(95deg, #e6e7ed90, #c7d2fe44, #e0e7f8aa)'
                        : user.rank === 3
                        ? 'linear-gradient(95deg, #fadebc99, #c19c6a55, #f8fafc30)'
                        : 'rgba(27,27,34,0.84)',
                    transform: 'translateY(-6px) scale(1.022)',
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={3}>
                    {/* Rank-Avatar-Name */}
                    <Box display="flex" alignItems="center" gap={2} minWidth={120} width={{ xs: '100%', sm: 'auto' }}>
                      <Box display="flex" alignItems="center" justifyContent="center" minWidth={54} minHeight={54}>
                        {getRankIcon(user.rank)}
                      </Box>
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.name}
                        sx={{ width: 56, height: 56, border: user.rank <= 3 ? '2px solid #6366f1' : '1px solid #655', boxShadow: '0 2px 8px #312e8125' }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ ml: 1, minWidth: 88 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: '-1px', color: 'white' }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(173,176,255,0.8)', fontSize: 14 }}>
                          @{user.username}
                        </Typography>
                      </Box>
                    </Box>
                    {/* Stats Pill Row */}
                    <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                      <Box textAlign="center" minWidth={78}>
                        <Box sx={{ fontWeight: 'bold', fontSize: 19, borderRadius: 12, px: 2, py: 0.5, background: 'linear-gradient(92deg,#312e81bb 44%,#818cf844 100%)', color: '#facc15', display: 'inline-block', mb: 0.5 }}>
                          Level {user.level}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#636a85', fontWeight: 500 }}>
                          Level
                        </Typography>
                      </Box>
                      <Box textAlign="center" minWidth={80}>
                        <Box sx={{ fontWeight: 'bold', fontSize: 19, borderRadius: 12, px: 2, py: 0.5, background: 'linear-gradient(92deg, #14532d99 44%, #bbf7d0aa 100%)', color: '#22d3ee', display: 'inline-block', mb: 0.5 }}>
                          {user.xp.toLocaleString()} XP
                        </Box>
                        <Typography variant="caption" sx={{ color: '#636a85', fontWeight: 500 }}>
                          XP
                        </Typography>
                      </Box>
                      <Box textAlign="center" minWidth={82}>
                        <Box sx={{ fontWeight: 'bold', fontSize: 19, borderRadius: 12, px: 2, py: 0.5, background: 'linear-gradient(92deg,#581c87cc 44%,#e9d5ff44 100%)', color: '#fff', display: 'inline-block', mb: 0.5 }}>
                          {user.stats.messages.toLocaleString()}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#636a85', fontWeight: 500 }}>
                          Messages
                        </Typography>
                      </Box>
                    </Box>
                    {/* Badges */}
                    <Box display="flex" gap={1} mt={{ xs: 1.5, sm: 0 }} flexWrap="wrap" justifyContent="center">
                      {Object.entries(user.badges).map(([badgeType, hasBadge]) =>
                        hasBadge ? (
                          <Chip
                            key={badgeType}
                            icon={getBadgeIcon(badgeType)}
                            label={badgeType.charAt(0).toUpperCase() + badgeType.slice(1)}
                            size="small"
                            sx={{
                              backgroundColor: getBadgeColor(badgeType),
                              color: badgeType === 'silver' || badgeType === 'platinum' ? '#000' : '#fff',
                              fontWeight: 'bold',
                              textShadow: '0 1px 4px #2e1065',
                              borderRadius: 8,
                            }}
                          />
                        ) : null
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        ))}
      </Box>
      {/* Pagination and Page Info */}
      {leaderboardData.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={leaderboardData.totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      <Box textAlign="center" mt={3} mb={1}>
        <Typography variant="body2" color="text.secondary">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, leaderboardData.totalCount)} of {leaderboardData.totalCount} users
        </Typography>
      </Box>
    </Box>
  );
}
