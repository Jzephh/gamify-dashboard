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
} from '@mui/icons-material';
import { motion } from 'framer-motion';

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
    <Box sx={{ p: 3 }}>
      {/* Search and Sort Controls */}
      <Box mb={3} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
        <TextField
          label="Search users"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 220, background: 'rgba(255,255,255,0.03)' }}
        />
      </Box>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
            <Trophy sx={{ mr: 2, verticalAlign: 'middle' }} />
            Leaderboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Top {leaderboardData.totalCount} users ranked by XP and level
          </Typography>
        </motion.div>
      </Box>
      {/* Leaderboard Cards */}
      <Box sx={{ mb: 3 }}>
        {usersToShow.map((user, index) => (
          <Box key={user.userId} sx={{ mb: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  background: user.rank <= 3 
                    ? `linear-gradient(135deg, ${user.rank === 1 ? '#FFD700' : user.rank === 2 ? '#C0C0C0' : '#CD7F32'}20, transparent)`
                    : 'background.paper',
                  border: user.rank <= 3 ? `2px solid ${user.rank === 1 ? '#FFD700' : user.rank === 2 ? '#C0C0C0' : '#CD7F32'}` : '1px solid',
                  borderColor: user.rank <= 3 ? 'transparent' : 'divider',
                  boxShadow: user.rank <= 3 ? 3 : 1,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    {/* Left: Rank and User Info */}
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center" justifyContent="center" minWidth={60}>
                        {getRankIcon(user.rank)}
                      </Box>
                      
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.name}
                        sx={{ width: 48, height: 48 }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Center: Stats */}
                    <Box display="flex" gap={3} alignItems="center">
                      <Box textAlign="center">
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Level {user.level}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Level
                        </Typography>
                      </Box>
                      
                      <Divider orientation="vertical" flexItem />
                      
                      <Box textAlign="center">
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {user.xp.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          XP
                        </Typography>
                      </Box>
                      
                      <Divider orientation="vertical" flexItem />
                      
                      <Box textAlign="center">
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {user.stats.messages.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Messages
                        </Typography>
                      </Box>
                    </Box>

                    {/* Right: Badges */}
                    <Box display="flex" gap={1}>
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

      {/* Pagination */}
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

      {/* Page Info */}
      <Box textAlign="center" mt={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, leaderboardData.totalCount)} of {leaderboardData.totalCount} users
        </Typography>
      </Box>
    </Box>
  );
}
