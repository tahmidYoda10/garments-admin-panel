// src/pages/NotificationsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import api from '../api/http';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
  FiUserPlus,
  FiCreditCard,
  FiAlertTriangle,
  FiClock,
  FiMail,
  FiInfo,
  FiPackage,
  FiSend,
  FiMessageSquare,
} from 'react-icons/fi';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: number;
  referenceType?: string;
  tenant?: {
    id: number;
    shopName: string;
  };
}

// ──────────────────────────── Stat Card ────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color, bgColor, subtitle }: StatCardProps) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      border: '1px solid #f0f0f0',
      borderRadius: 3,
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        transform: 'translateY(-2px)',
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontSize: '0.65rem',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#222734', mt: 0.5, lineHeight: 1.2 }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color, fontWeight: 600, mt: 0.5, display: 'block' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.3,
            borderRadius: 2.5,
            bgcolor: bgColor,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ──────────────────────────── Get Icon by Type ────────────────────────────
const getNotificationIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'NEW_REGISTRATION':
    case 'TENANT_REGISTERED':
      return { icon: <FiUserPlus size={18} />, color: '#059669', bgColor: 'rgba(5,150,105,0.1)' };
    case 'SUBSCRIPTION_ACTIVATED':
    case 'SUBSCRIPTION_RENEWED':
      return { icon: <FiCreditCard size={18} />, color: '#2563eb', bgColor: 'rgba(37,99,235,0.1)' };
    case 'SUBSCRIPTION_EXPIRING':
    case 'SUBSCRIPTION_EXPIRED':
    case 'EXPIRING_SOON':
      return { icon: <FiAlertTriangle size={18} />, color: '#d97706', bgColor: 'rgba(217,119,6,0.1)' };
    case 'PAYMENT_RECEIVED':
      return { icon: <FiCreditCard size={18} />, color: '#059669', bgColor: 'rgba(5,150,105,0.1)' };
    case 'PLAN_CHANGED':
      return { icon: <FiPackage size={18} />, color: '#7c3aed', bgColor: 'rgba(124,58,237,0.1)' };
    case 'SYSTEM_ALERT':
    case 'LOW_STOCK':
      return { icon: <FiAlertCircle size={18} />, color: '#dc2626', bgColor: 'rgba(220,38,38,0.1)' };
    case 'ANNOUNCEMENT':
      return { icon: <FiMessageSquare size={18} />, color: '#FE6C05', bgColor: 'rgba(254,108,5,0.1)' };
    default:
      return { icon: <FiInfo size={18} />, color: '#6b7280', bgColor: 'rgba(107,114,128,0.1)' };
  }
};

// ──────────────────────────── Format Time ────────────────────────────
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ──────────────────────────── Page Component ────────────────────────────
const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Announcement Dialog
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/super-admin/notifications', {
        params: { page: 0, size: 50 },
      });
      setNotifications(res.data.data?.content || []);
      setTotalCount(res.data.data?.totalElements || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/api/v1/super-admin/notifications/unread-count');
      // API returns { count: number } or similar
      const count = res.data.data?.count || res.data.data?.unreadCount || 
                    Object.values(res.data.data || {})[0] || 0;
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch (err) {
      console.error('Failed to load unread count:', err);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.post(`/api/v1/super-admin/notifications/${id}/mark-as-read`);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/api/v1/super-admin/notifications/mark-all-as-read');
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/v1/super-admin/notifications/${id}`);
      loadNotifications();
      loadUnreadCount();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) return;
    setAnnouncementLoading(true);
    try {
      await api.post('/api/v1/super-admin/notifications/announcement', null, {
        params: {
          title: announcementTitle,
          message: announcementMessage,
        },
      });
      setAnnouncementOpen(false);
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      loadNotifications();
    } catch (err) {
      console.error('Failed to send announcement:', err);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  // Stats
  const readCount = notifications.filter((n) => n.isRead).length;

  return (
    <Box>
      {/* ── Page Header ── */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#222734', mb: 0.5 }}>
              Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Stay updated with platform activities and alerts.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              startIcon={<FiRefreshCw size={15} />}
              onClick={() => {
                loadNotifications();
                loadUnreadCount();
              }}
              disabled={loading}
              sx={{
                bgcolor: 'rgba(34,39,52,0.06)',
                color: '#222734',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                '&:hover': { bgcolor: 'rgba(34,39,52,0.1)' },
              }}
            >
              Refresh
            </Button>
            <Button
              startIcon={<FiSend size={15} />}
              onClick={() => setAnnouncementOpen(true)}
              sx={{
                bgcolor: 'rgba(34,39,52,0.06)',
                color: '#222734',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                '&:hover': { bgcolor: 'rgba(34,39,52,0.1)' },
              }}
            >
              Send Announcement
            </Button>
            <Button
              variant="contained"
              startIcon={<FiCheckCircle size={15} />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || loading}
              sx={{
                bgcolor: '#FE6C05',
                color: '#fff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#e55f00',
                  boxShadow: '0 4px 12px rgba(254,108,5,0.3)',
                },
                '&:disabled': {
                  bgcolor: 'rgba(254,108,5,0.4)',
                  color: '#fff',
                },
              }}
            >
              Mark All Read
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard
            title="Total"
            value={totalCount}
            icon={<FiBell size={20} />}
            color="#222734"
            bgColor="rgba(34,39,52,0.06)"
            subtitle="All notifications"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard
            title="Unread"
            value={unreadCount}
            icon={<FiMail size={20} />}
            color="#FE6C05"
            bgColor="rgba(254,108,5,0.1)"
            subtitle="Requires attention"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            title="Read"
            value={readCount}
            icon={<FiCheckCircle size={20} />}
            color="#059669"
            bgColor="rgba(5,150,105,0.1)"
            subtitle="Already viewed"
          />
        </Grid>
      </Grid>

      {/* ── Filter Chips ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid #f0f0f0',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Chip
          icon={<FiBell size={12} />}
          label={`${totalCount} Total`}
          sx={{
            bgcolor: 'rgba(34,39,52,0.06)',
            color: '#222734',
            fontWeight: 600,
            fontSize: '0.78rem',
            borderRadius: 2,
            '& .MuiChip-icon': { color: '#FE6C05' },
          }}
        />
        <Chip
          icon={<FiMail size={12} />}
          label={`${unreadCount} Unread`}
          sx={{
            bgcolor: unreadCount > 0 ? 'rgba(254,108,5,0.1)' : 'rgba(107,114,128,0.08)',
            color: unreadCount > 0 ? '#FE6C05' : '#6b7280',
            fontWeight: 600,
            fontSize: '0.78rem',
            borderRadius: 2,
            '& .MuiChip-icon': { color: unreadCount > 0 ? '#FE6C05' : '#6b7280' },
          }}
        />
        <Chip
          icon={<FiCheck size={12} />}
          label={`${readCount} Read`}
          sx={{
            bgcolor: 'rgba(16,185,129,0.1)',
            color: '#059669',
            fontWeight: 600,
            fontSize: '0.78rem',
            borderRadius: 2,
            '& .MuiChip-icon': { color: '#059669' },
          }}
        />
      </Paper>

      {/* ── Notifications List ── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #f0f0f0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Loading State */}
        {loading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                bgcolor: 'rgba(254,108,5,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.6 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.6 },
                },
              }}
            >
              <FiBell size={28} color="#FE6C05" />
            </Box>
            <Typography color="text.secondary">Loading notifications...</Typography>
          </Box>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 4,
                bgcolor: 'rgba(107,114,128,0.08)',
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <FiBell size={36} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734', mb: 1 }}>
              No Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', maxWidth: 360, mx: 'auto' }}>
              You're all caught up! New notifications will appear here when there's activity on your platform.
            </Typography>
          </Box>
        )}

        {/* Notifications */}
        {!loading &&
          notifications.map((notification, index) => {
            const iconData = getNotificationIcon(notification.type);
            return (
              <Box
                key={notification.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2.5,
                  borderBottom: index < notifications.length - 1 ? '1px solid #f5f5f5' : 'none',
                  bgcolor: notification.isRead ? 'transparent' : 'rgba(254,108,5,0.02)',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: notification.isRead ? 'rgba(0,0,0,0.01)' : 'rgba(254,108,5,0.04)',
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: iconData.bgColor,
                    color: iconData.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {iconData.icon}
                  {!notification.isRead && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: '#FE6C05',
                        border: '2px solid #fff',
                      }}
                    />
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: notification.isRead ? 600 : 700,
                        color: '#222734',
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.type?.replace(/_/g, ' ') || 'INFO'}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        bgcolor: iconData.bgColor,
                        color: iconData.color,
                        borderRadius: 1,
                      }}
                    />
                    {notification.tenant && (
                      <Chip
                        label={notification.tenant.shopName}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          bgcolor: 'rgba(34,39,52,0.06)',
                          color: '#6b7280',
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      mb: 1,
                      lineHeight: 1.5,
                    }}
                  >
                    {notification.message}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FiClock size={12} color="#9ca3af" />
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      {formatTimeAgo(notification.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                  {!notification.isRead && (
                    <Tooltip title="Mark as Read" arrow>
                      <IconButton
                        size="small"
                        onClick={() => handleMarkAsRead(notification.id)}
                        sx={{
                          color: '#059669',
                          bgcolor: 'rgba(5,150,105,0.08)',
                          borderRadius: 1.5,
                          width: 32,
                          height: 32,
                          '&:hover': { bgcolor: 'rgba(5,150,105,0.15)' },
                        }}
                      >
                        <FiCheck size={14} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(notification.id)}
                      sx={{
                        color: '#dc2626',
                        bgcolor: 'rgba(220,38,38,0.06)',
                        borderRadius: 1.5,
                        width: 32,
                        height: 32,
                        '&:hover': { bgcolor: 'rgba(220,38,38,0.12)' },
                      }}
                    >
                      <FiTrash2 size={14} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
      </Paper>

      {/* ── Announcement Dialog ── */}
      <Dialog
        open={announcementOpen}
        onClose={() => setAnnouncementOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(254,108,5,0.1)',
                color: '#FE6C05',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiSend size={18} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734' }}>
                Send Announcement
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                Broadcast a message to all Super Admins
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              size="small"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              placeholder="e.g., System Maintenance Notice"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: '#222734' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
              }}
            />
            <TextField
              label="Message"
              fullWidth
              size="small"
              multiline
              rows={4}
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              placeholder="Write your announcement message here..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: '#222734' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
              }}
            />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setAnnouncementOpen(false)}
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(107,114,128,0.08)' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendAnnouncement}
            variant="contained"
            disabled={announcementLoading || !announcementTitle.trim() || !announcementMessage.trim()}
            startIcon={<FiSend size={14} />}
            sx={{
              bgcolor: '#FE6C05',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#e55f00',
                boxShadow: '0 4px 12px rgba(254,108,5,0.3)',
              },
              '&:disabled': {
                bgcolor: 'rgba(254,108,5,0.4)',
                color: '#fff',
              },
            }}
          >
            {announcementLoading ? 'Sending...' : 'Send Announcement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationsPage;