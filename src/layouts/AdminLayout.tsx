// src/layouts/AdminLayout.tsx
import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FiMenu,
  FiHome,
  FiUsers,
  FiPackage,
  FiFileText,
  FiLogOut,
  FiSettings,
  FiBell,
} from 'react-icons/fi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/http';
import type { ApiResponse, PagedResponse } from '../types/api';

const drawerWidth = 260;

interface Notification {
  id: number;
  isRead: boolean;
}

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem('adminUserName') || 'Admin';

  // Load unread notification count
  const loadUnreadCount = () => {
    api
      .get<ApiResponse<PagedResponse<Notification>>>('/api/v1/super-admin/notifications', {
        params: { page: 0, size: 100 },
      })
      .then((res) => {
        const unread = res.data.data.content.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      })
      .catch(() => setUnreadCount(0));
  };

  useEffect(() => {
    loadUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh count when coming back to the page
  useEffect(() => {
    loadUnreadCount();
  }, [location.pathname]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <FiHome size={19} />, path: '/admin/dashboard' },
    { text: 'Tenants', icon: <FiUsers size={19} />, path: '/admin/tenants' },
    { text: 'Plans', icon: <FiPackage size={19} />, path: '/admin/plans' },
    { text: 'Subscriptions', icon: <FiFileText size={19} />, path: '/admin/subscriptions' },
    { text: 'Notifications', icon: <FiBell size={19} />, path: '/admin/notifications', badge: unreadCount },
  ];

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#222734',
      }}
    >
      {/* Brand */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#FE6C05',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.2rem',
              lineHeight: 1,
            }}
          >
            G
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}
          >
            Garments SaaS
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
            Super Admin
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2, mb: 2 }} />

      {/* Nav Label */}
      <Typography
        variant="caption"
        sx={{
          px: 3,
          mb: 1,
          color: 'rgba(255,255,255,0.3)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontSize: '0.65rem',
        }}
      >
        Navigation
      </Typography>

      {/* Menu List */}
      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                px: 1.5,
                py: 1,
                bgcolor: isActive ? 'rgba(254,108,5,0.15)' : 'transparent',
                color: isActive ? '#FE6C05' : 'rgba(255,255,255,0.55)',
                position: 'relative',
                '&:hover': {
                  bgcolor: isActive
                    ? 'rgba(254,108,5,0.2)'
                    : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#FE6C05' : 'rgba(255,255,255,0.85)',
                },
                transition: 'all 0.15s ease',
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    bgcolor: '#FE6C05',
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive ? '#FE6C05' : 'rgba(255,255,255,0.4)',
                }}
              >
                {item.badge && item.badge > 0 ? (
                  <Badge
                    badgeContent={item.badge}
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: '#FE6C05',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  color: isActive ? '#FE6C05' : 'rgba(255,255,255,0.65)',
                }}
              />
              {/* Badge on right side */}
              {item.badge && item.badge > 0 && !isActive && (
                <Box
                  sx={{
                    bgcolor: '#FE6C05',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: 1,
                    minWidth: 20,
                    textAlign: 'center',
                  }}
                >
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2, mb: 1.5 }} />

      {/* User Info */}
      <Box
        sx={{
          mx: 1.5,
          mb: 1.5,
          px: 1.5,
          py: 1.2,
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: '#FE6C05',
            width: 32,
            height: 32,
            fontSize: '0.8rem',
            fontWeight: 700,
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: '#ffffff',
              fontSize: '0.82rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userName}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}
          >
            Super Admin
          </Typography>
        </Box>
      </Box>

      {/* Logout */}
      <Box sx={{ px: 1.5, pb: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            px: 1.5,
            py: 1,
            color: 'rgba(255,255,255,0.4)',
            '&:hover': {
              bgcolor: 'rgba(220,38,38,0.12)',
              color: '#f87171',
            },
            transition: 'all 0.15s ease',
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <FiLogOut size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'inherit',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#ffffff',
          borderBottom: '1px solid #f0f0f0',
          color: '#222734',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '60px !important' }}>
          {/* Left */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 2,
                display: { md: 'none' },
                color: '#222734',
              }}
            >
              <FiMenu size={20} />
            </IconButton>

            {/* Page Title from path */}
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#222734', display: { xs: 'none', sm: 'block' } }}
            >
              {menuItems.find((m) => location.pathname.startsWith(m.path))?.text || 'Admin'}
            </Typography>
          </Box>

          {/* Right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications" arrow>
              <IconButton
                size="small"
                onClick={() => navigate('/admin/notifications')}
                sx={{
                  color: '#6b7280',
                  bgcolor: 'rgba(107,114,128,0.06)',
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(107,114,128,0.12)' },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#FE6C05',
                      color: '#fff',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      minWidth: 16,
                      height: 16,
                    },
                  }}
                >
                  <FiBell size={18} />
                </Badge>
              </IconButton>
            </Tooltip>

            <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  bgcolor: '#FE6C05',
                  width: 34,
                  height: 34,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 4px 16px rgba(0,0,0,0.08))',
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 3,
                  border: '1px solid #f0f0f0',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: '#222734' }}
                  noWrap
                >
                  {userName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Super Admin
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/admin/notifications');
                }}
                sx={{
                  py: 1.2,
                  fontSize: '0.875rem',
                  color: '#374151',
                  '&:hover': { bgcolor: 'rgba(34,39,52,0.04)' },
                }}
              >
                <ListItemIcon>
                  <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { bgcolor: '#FE6C05' } }}>
                    <FiBell size={16} color="#6b7280" />
                  </Badge>
                </ListItemIcon>
                Notifications
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                sx={{
                  py: 1.2,
                  fontSize: '0.875rem',
                  color: '#374151',
                  '&:hover': { bgcolor: 'rgba(34,39,52,0.04)' },
                }}
              >
                <ListItemIcon>
                  <FiSettings size={16} color="#6b7280" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1.2,
                  fontSize: '0.875rem',
                  color: '#dc2626',
                  '&:hover': { bgcolor: 'rgba(220,38,38,0.06)' },
                }}
              >
                <ListItemIcon sx={{ color: '#dc2626' }}>
                  <FiLogOut size={16} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#222734',
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#222734',
              border: 'none',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f8f9fb',
        }}
      >
        <Toolbar sx={{ minHeight: '60px !important' }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;