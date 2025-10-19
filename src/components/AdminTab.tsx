'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  TextField,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  WorkspacePremium,
  Security,
  FlashOn,
  Add,
  AdminPanelSettings,
  Search,
  Clear,
} from '@mui/icons-material';

interface AdminUser {
  _id: string;
  userId: string;
  username: string;
  name: string;
  level: number;
  xp: number;
  badges: {
    bronze: boolean;
    silver: boolean;
    gold: boolean;
    platinum: boolean;
    apex: boolean;
  };
  roles: string[];
  stats: {
    messages: number;
    successMessages: number;
    voiceMinutes: number;
  };
  createdAt: string;
}

interface QuestObjective {
  id: string;
  messageCount: number;
  successMessageCount: number;
  xpReward: number;
  order: number;
}

interface QuestConfig {
  _id: string;
  questId: string;
  questType: 'daily' | 'weekly';
  title: string;
  description: string;
  objectives: QuestObjective[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [xpAmount, setXpAmount] = useState(10);
  
  // Quest management state
  const [quests, setQuests] = useState<QuestConfig[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<QuestConfig | null>(null);
  const [questDialogOpen, setQuestDialogOpen] = useState(false);
  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    objectives: [] as QuestObjective[],
    isActive: true,
  });
  const [editingObjective, setEditingObjective] = useState<QuestObjective | null>(null);
  const [newObjective, setNewObjective] = useState({
    messageCount: 0,
    successMessageCount: 0,
    xpReward: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchQuests();
  }, []);

  // Filter users based on search criteria
  useEffect(() => {
    let filtered = users;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setAlert({ type: 'error', message: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Quest management functions
  const fetchQuests = async () => {
    try {
      const response = await fetch('/api/admin/quests');
      if (response.ok) {
        const data = await response.json();
        setQuests(data);
      }
    } catch (error) {
      console.error('Error fetching quests:', error);
      setAlert({ type: 'error', message: 'Failed to fetch quests' });
    }
  };

  const handleEditQuest = (quest: QuestConfig) => {
    setSelectedQuest(quest);
    setQuestForm({
      title: quest.title,
      description: quest.description,
      objectives: quest.objectives,
      isActive: quest.isActive,
    });
    setQuestDialogOpen(true);
  };

  const handleSaveQuest = async () => {
    if (!selectedQuest) return;

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questId: selectedQuest.questId,
          updates: questForm,
        }),
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Quest updated successfully' });
        fetchQuests();
        setQuestDialogOpen(false);
        setSelectedQuest(null);
      } else {
        setAlert({ type: 'error', message: 'Failed to update quest' });
      }
    } catch (error) {
      console.error('Error updating quest:', error);
      setAlert({ type: 'error', message: 'Failed to update quest' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseQuestDialog = () => {
    setQuestDialogOpen(false);
    setSelectedQuest(null);
    setQuestForm({
      title: '',
      description: '',
      objectives: [],
      isActive: true,
    });
    setEditingObjective(null);
    setNewObjective({
      messageCount: 0,
      successMessageCount: 0,
      xpReward: 0,
    });
  };

  const addObjective = () => {
    if (newObjective.messageCount === 0 && newObjective.successMessageCount === 0) {
      setAlert({ type: 'error', message: 'Please specify either message count or success message count' });
      return;
    }
    if (newObjective.messageCount > 0 && newObjective.successMessageCount > 0) {
      setAlert({ type: 'error', message: 'Please specify only one type of message count' });
      return;
    }

    const objective: QuestObjective = {
      id: `objective_${Date.now()}`,
      messageCount: newObjective.messageCount,
      successMessageCount: newObjective.successMessageCount,
      xpReward: newObjective.xpReward,
      order: questForm.objectives.length + 1,
    };

    setQuestForm({
      ...questForm,
      objectives: [...questForm.objectives, objective],
    });

    setNewObjective({
      messageCount: 0,
      successMessageCount: 0,
      xpReward: 0,
    });
  };

  const editObjective = (objective: QuestObjective) => {
    setEditingObjective(objective);
  };

  const updateObjective = () => {
    if (!editingObjective) return;

    if (editingObjective.messageCount === 0 && editingObjective.successMessageCount === 0) {
      setAlert({ type: 'error', message: 'Please specify either message count or success message count' });
      return;
    }
    if (editingObjective.messageCount > 0 && editingObjective.successMessageCount > 0) {
      setAlert({ type: 'error', message: 'Please specify only one type of message count' });
      return;
    }

    setQuestForm({
      ...questForm,
      objectives: questForm.objectives.map(obj => 
        obj.id === editingObjective.id ? editingObjective : obj
      ),
    });

    setEditingObjective(null);
  };

  const removeObjective = (objectiveId: string) => {
    const updatedObjectives = questForm.objectives
      .filter(obj => obj.id !== objectiveId)
      .map((obj, index) => ({ ...obj, order: index + 1 }));

    setQuestForm({
      ...questForm,
      objectives: updatedObjectives,
    });
  };

  const awardXP = async (userId: string, amount: number) => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/award-xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, xpAmount: amount }),
      });
      
      if (response.ok) {
        fetchUsers();
        setAlert({ type: 'success', message: `Awarded ${amount} XP successfully!` });
        setSelectedUser(null);
      } else {
        setAlert({ type: 'error', message: 'Failed to award XP' });
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
      setAlert({ type: 'error', message: 'Failed to award XP' });
    } finally {
      setActionLoading(false);
    }
  };

  const updateBadge = async (userId: string, badgeType: string, action: 'unlock' | 'lock') => {
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, badgeType, action }),
      });
      
      if (response.ok) {
        fetchUsers();
        setAlert({ type: 'success', message: `Badge ${action}ed successfully!` });
        setOpenDialog(false);
      } else {
        setAlert({ type: 'error', message: `Failed to ${action} badge` });
      }
    } catch (error) {
      console.error('Error updating badge:', error);
      setAlert({ type: 'error', message: `Failed to ${action} badge` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBadgeAction = () => {
    if (selectedUser && selectedBadge && selectedAction) {
      updateBadge(selectedUser.userId, selectedBadge, selectedAction as 'unlock' | 'lock');
    }
  };

  const badgeTypes = [
    { key: 'bronze', name: 'Bronze', emoji: '🥉', color: '#cd7f32' },
    { key: 'silver', name: 'Silver', emoji: '🥈', color: '#c0c0c0' },
    { key: 'gold', name: 'Gold', emoji: '🥇', color: '#ffd700' },
    { key: 'platinum', name: 'Platinum', emoji: '💎', color: '#e5e4e2' },
    { key: 'apex', name: 'Apex', emoji: '👑', color: '#ff6b35' },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white' }}>
          Loading admin panel...
        </Typography>
      </Box>
    );
  }

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
          radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(185, 28, 28, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
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
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Alert
            severity={alert.type}
            onClose={() => setAlert(null)}
            sx={{ mb: 3 }}
          >
            {alert.message}
          </Alert>
        </motion.div>
      )}

      {/* Admin Header */}
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
        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            borderRadius: 4,
            mb: 4,
            boxShadow: '0 25px 50px rgba(220, 38, 38, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden',
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
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                <Security sx={{ 
                  fontSize: 48, 
                  color: 'white',
                  filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                }} />
              </motion.div>
              <Box>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 800, 
                  mb: 1,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Admin Panel
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Manage user XP, badges, and roles. Use with caution - these actions affect user progression.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.8,
          delay: 0.1,
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
              top: -20,
              left: -20,
              width: '40px',
              height: '40px',
              background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 4s ease-in-out infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -15,
              right: -15,
              width: '30px',
              height: '30px',
              background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), transparent)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite reverse',
            },
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                  <Search sx={{ 
                    color: '#6366f1', 
                    fontSize: 28,
                    filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))'
                  }} />
                </motion.div>
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Search Users
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <TextField
                fullWidth
                label="Search Users"
                placeholder="Search by username or display name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ 
                      color: '#6366f1', 
                      mr: 1,
                      fontSize: 20
                    }} />
                  ),
                  endAdornment: searchQuery && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Clear 
                        sx={{ 
                          color: '#a1a1aa', 
                          cursor: 'pointer',
                          fontSize: 20,
                          '&:hover': { color: '#ef4444' }
                        }}
                        onClick={clearSearch}
                      />
                    </motion.div>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(15, 15, 35, 0.8)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: 3,
                    '&:hover': {
                      border: '1px solid rgba(99, 102, 241, 0.5)',
                      boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #6366f1',
                      boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#a1a1aa',
                    '&.Mui-focused': {
                      color: '#6366f1',
                    },
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: '#6b7280',
                      opacity: 1,
                    },
                  },
                }}
              />
            </motion.div>

            {/* Search Results Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ 
                  color: '#a1a1aa',
                  background: 'rgba(99, 102, 241, 0.1)',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  display: 'inline-block',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}>
                  Showing {filteredUsers.length} of {users.length} users
                  {searchQuery && ' (filtered)'}
                </Typography>
              </Box>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users List */}
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
              <Typography variant="h5" sx={{ 
                color: 'white', 
                fontWeight: 700, 
                mb: 3,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Users ({filteredUsers.length})
              </Typography>
            </motion.div>
            
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredUsers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 3,
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: '#ef4444', 
                      fontWeight: 600,
                      mb: 1
                    }}>
                      No users found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                      {searchQuery 
                        ? 'Try adjusting your search criteria' 
                        : 'No users available'
                      }
                    </Typography>
                  </Box>
                </motion.div>
              ) : (
                filteredUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.4 + index * 0.05,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <ListItem
                    component="div"
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 3,
                      mb: 1,
                      background: selectedUser?._id === user._id 
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)' 
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                      border: selectedUser?._id === user._id 
                        ? '2px solid #6366f1' 
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: selectedUser?._id === user._id 
                        ? '0 8px 20px rgba(99, 102, 241, 0.3)'
                        : '0 4px 10px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                          width: 56,
                          height: 56,
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Chip
                            label={`Lv.${user.level}`}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#a1a1aa', mb: 1 }}>
                            @{user.username}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {badgeTypes.map((badge) => (
                              <Box
                                key={badge.key}
                                sx={{
                                  opacity: user.badges[badge.key as keyof typeof user.badges] ? 1 : 0.3,
                                  fontSize: '1.2rem',
                                }}
                                title={`${badge.name} Badge`}
                              >
                                {badge.emoji}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                          {user.xp} XP
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#a1a1aa' }}>
                          {user.stats.messages} msgs
                        </Typography>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                </motion.div>
                ))
              )}
            </List>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Actions */}
      {selectedUser && (
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
          <Card
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(30, 30, 60, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 4,
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
                background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.1), transparent)',
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
                background: 'linear-gradient(45deg, rgba(236, 72, 153, 0.1), transparent)',
                borderRadius: '50%',
                animation: 'float 8s ease-in-out infinite reverse',
              },
            }}
          >
            <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  mb: 3,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Manage: {selectedUser.name}
                </Typography>
              </motion.div>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                {/* XP Management */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  style={{ flex: 1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                        <FlashOn sx={{ 
                          color: '#fbbf24', 
                          fontSize: 28,
                          filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))'
                        }} />
                      </motion.div>
                      <Typography variant="h6" sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        XP Management
                      </Typography>
                    </Box>
                  <TextField
                    label="XP Amount"
                    type="number"
                    value={xpAmount}
                    onChange={(e) => setXpAmount(parseInt(e.target.value) || 0)}
                    fullWidth
                    sx={{ mb: 3 }}
                    inputProps={{ min: 1, max: 1000 }}
                  />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => awardXP(selectedUser.userId, xpAmount)}
                        disabled={actionLoading || xpAmount <= 0}
                        fullWidth
                        startIcon={<Add />}
                        sx={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                          boxShadow: '0 8px 20px rgba(251, 191, 36, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            boxShadow: '0 12px 25px rgba(251, 191, 36, 0.4)',
                          },
                        }}
                      >
                        Award {xpAmount} XP
                      </Button>
                    </motion.div>
                  </Paper>
                </motion.div>

                {/* Badge Management */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  style={{ flex: 1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                      p: 3,
                      borderRadius: 3,
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                          color: '#8b5cf6', 
                          fontSize: 28,
                          filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))'
                        }} />
                      </motion.div>
                      <Typography variant="h6" sx={{ 
                        color: 'white', 
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        Badge Management
                      </Typography>
                    </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    {badgeTypes.map((badge) => {
                      const hasBadge = selectedUser.badges[badge.key as keyof typeof selectedUser.badges];
                      return (
                        <motion.div
                          key={badge.key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Chip
                            label={`${badge.emoji} ${badge.name}`}
                            variant={hasBadge ? 'filled' : 'outlined'}
                            color={hasBadge ? 'success' : 'default'}
                            onClick={() => {
                              setSelectedBadge(badge.key);
                              setSelectedAction(hasBadge ? 'lock' : 'unlock');
                              setOpenDialog(true);
                            }}
                            sx={{
                              mb: 1,
                              cursor: 'pointer',
                              boxShadow: hasBadge ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                              '&:hover': {
                                boxShadow: hasBadge ? '0 6px 16px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.2)',
                              },
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </Box>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => setOpenDialog(true)}
                        fullWidth
                        startIcon={<AdminPanelSettings />}
                        sx={{
                          borderColor: '#8b5cf6',
                          color: '#8b5cf6',
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                          '&:hover': {
                            borderColor: '#7c3aed',
                            background: 'rgba(139, 92, 246, 0.1)',
                            boxShadow: '0 6px 16px rgba(139, 92, 246, 0.3)',
                          },
                        }}
                      >
                        Manage Badges
                      </Button>
                    </motion.div>
                  </Paper>
                </motion.div>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Badge Management Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'white', background: 'rgba(15, 15, 35, 0.9)' }}>
          Manage Badge
        </DialogTitle>
        <DialogContent sx={{ background: 'rgba(15, 15, 35, 0.9)' }}>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Badge</InputLabel>
              <Select
                value={selectedBadge}
                onChange={(e) => setSelectedBadge(e.target.value)}
                label="Badge"
              >
                {badgeTypes.map((badge) => (
                  <MenuItem key={badge.key} value={badge.key}>
                    {badge.emoji} {badge.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                label="Action"
              >
                <MenuItem value="unlock">Unlock Badge</MenuItem>
                <MenuItem value="lock">Lock Badge</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(15, 15, 35, 0.9)' }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#a1a1aa' }}>
            Cancel
          </Button>
          <Button
            onClick={handleBadgeAction}
            disabled={!selectedBadge || !selectedAction || actionLoading}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            }}
          >
            {actionLoading ? 'Processing...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quest Management Section */}
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
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 4,
            mb: 4,
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
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
                  <WorkspacePremium sx={{ 
                    color: '#10b981', 
                    fontSize: 28,
                    filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))'
                  }} />
                </motion.div>
                <Typography variant="h5" sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Quest Management
                </Typography>
              </Box>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Typography variant="body1" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                mb: 3,
                lineHeight: 1.6
              }}>
                Configure quest settings, XP rewards, and message requirements. Changes will affect all users.
              </Typography>
            </motion.div>

            {/* Quest List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Stack spacing={2}>
                {quests.map((quest, index) => (
                  <motion.div
                    key={quest._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => handleEditQuest(quest)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Chip
                              label={quest.questType.toUpperCase()}
                              size="small"
                              sx={{
                                background: quest.questType === 'daily' 
                                  ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                                  : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            />
                            <Chip
                              label={quest.isActive ? 'ACTIVE' : 'INACTIVE'}
                              size="small"
                              sx={{
                                background: quest.isActive 
                                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                              }}
                            />
                          </Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                            {quest.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {quest.description}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
                              Objectives ({quest.objectives.length})
                            </Typography>
                            {quest.objectives.map((objective) => (
                              <Box key={objective.id} sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                p: 1, 
                                background: 'rgba(255, 255, 255, 0.05)', 
                                borderRadius: 1 
                              }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', minWidth: '60px' }}>
                                  Step {objective.order}:
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', flex: 1 }}>
                                  {objective.messageCount > 0 
                                    ? `${objective.messageCount} messages` 
                                    : `${objective.successMessageCount} success messages`
                                  }
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 600 }}>
                                  +{objective.xpReward} XP
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: '#10b981',
                              color: '#10b981',
                              '&:hover': {
                                borderColor: '#059669',
                                background: 'rgba(16, 185, 129, 0.1)',
                              },
                            }}
                          >
                            Edit
                          </Button>
                        </motion.div>
                      </Box>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quest Edit Dialog */}
      <Dialog open={questDialogOpen} onClose={handleCloseQuestDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: 'white', background: 'rgba(15, 15, 35, 0.9)' }}>
          Edit Quest: {selectedQuest?.title}
        </DialogTitle>
        <DialogContent sx={{ background: 'rgba(15, 15, 35, 0.9)' }}>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={questForm.title}
              onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={questForm.description}
              onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={questForm.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setQuestForm({ ...questForm, isActive: e.target.value === 'active' })}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {/* Objectives Management */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Quest Objectives
              </Typography>
              
              {/* Current Objectives */}
              {questForm.objectives.map((objective) => (
                <Box key={objective.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2, 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: 2,
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', minWidth: '60px' }}>
                    Step {objective.order}:
                  </Typography>
                  
                  {editingObjective?.id === objective.id ? (
                    <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                      <TextField
                        label="Message Count"
                        type="number"
                        size="small"
                        value={editingObjective.messageCount}
                        onChange={(e) => setEditingObjective({
                          ...editingObjective,
                          messageCount: parseInt(e.target.value) || 0
                        })}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Success Message Count"
                        type="number"
                        size="small"
                        value={editingObjective.successMessageCount}
                        onChange={(e) => setEditingObjective({
                          ...editingObjective,
                          successMessageCount: parseInt(e.target.value) || 0
                        })}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="XP Reward"
                        type="number"
                        size="small"
                        value={editingObjective.xpReward}
                        onChange={(e) => setEditingObjective({
                          ...editingObjective,
                          xpReward: parseInt(e.target.value) || 0
                        })}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        onClick={updateObjective}
                        sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setEditingObjective(null)}
                        sx={{ color: '#a1a1aa', borderColor: '#6b7280' }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="body2" sx={{ color: 'white', flex: 1 }}>
                        {objective.messageCount > 0 
                          ? `${objective.messageCount} messages` 
                          : `${objective.successMessageCount} success messages`
                        }
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 600, minWidth: '80px' }}>
                        +{objective.xpReward} XP
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => editObjective(objective)}
                        sx={{ color: '#a1a1aa', borderColor: '#6b7280' }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => removeObjective(objective.id)}
                        sx={{ color: '#ef4444', borderColor: '#ef4444' }}
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </Box>
              ))}

            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ background: 'rgba(15, 15, 35, 0.9)' }}>
          <Button onClick={handleCloseQuestDialog} sx={{ color: '#a1a1aa' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveQuest}
            disabled={actionLoading}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}