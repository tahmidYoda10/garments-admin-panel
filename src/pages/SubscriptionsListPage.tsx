// src/pages/SubscriptionsListPage.tsx
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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import api from '../api/http';
import {
  FiCalendar,
  FiClock,
  FiEdit2,
  FiPauseCircle,
  FiPlayCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiList,
  FiArchive,
  FiCheckCircle,
  FiXCircle,
  FiSlash,
  FiAlertTriangle,
} from 'react-icons/fi';
import type {
  ApiResponse,
  PagedResponse,
  Subscription,
  SubscriptionResponse,
} from '../types/api';

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
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' },
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
            <Typography variant="caption" sx={{ color, fontWeight: 600, mt: 0.5, display: 'block' }}>
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

// ──────────────────────────── Page Component ────────────────────────────
const SubscriptionsListPage: React.FC = () => {
  const [subs, setSubs] = useState<SubscriptionResponse[]>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Extend Dialog
  const [openExtendDialog, setOpenExtendDialog] = useState(false);
  const [subToExtend, setSubToExtend] = useState<SubscriptionResponse | null>(null);
  const [extendDays, setExtendDays] = useState(0);
  const [extendLoading, setExtendLoading] = useState(false);

  // Confirm Dialog (for suspend/reactivate)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'suspend' | 'reactivate';
    subscription: SubscriptionResponse | null;
  }>({ open: false, type: 'suspend', subscription: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const loadSubs = () => {
    setLoading(true);
    api
      .get<ApiResponse<PagedResponse<SubscriptionResponse>>>(
        '/api/v1/super-admin/subscriptions',
        {
          params: {
            status: statusFilter === 'ALL' ? 'ALL' : statusFilter || undefined,
            page: paginationModel.page,
            size: paginationModel.pageSize,
          },
        }
      )
      .then((res) => {
        setSubs(res.data.data.content);
        setRowCount(res.data.data.totalElements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, statusFilter]);

  // ── Extend Subscription ──
  const handleExtendClick = (sub: SubscriptionResponse) => {
    setSubToExtend(sub);
    setExtendDays(0);
    setOpenExtendDialog(true);
  };

  const handleExtendConfirm = async () => {
    if (!subToExtend || extendDays <= 0) return;
    setExtendLoading(true);
    try {
      await api.post<ApiResponse<Subscription>>(
        `/api/v1/super-admin/subscriptions/${subToExtend.id}/extend?days=${extendDays}`
      );
      loadSubs();
      setOpenExtendDialog(false);
    } catch (err) {
      console.error('Failed to extend subscription:', err);
    } finally {
      setExtendLoading(false);
    }
  };

  // ── Suspend Subscription ──
  const handleSuspendClick = (sub: SubscriptionResponse) => {
    setConfirmDialog({ open: true, type: 'suspend', subscription: sub });
  };

  const handleSuspendConfirm = async () => {
    if (!confirmDialog.subscription) return;
    setConfirmLoading(true);
    try {
      await api.post<ApiResponse<Subscription>>(
        `/api/v1/super-admin/subscriptions/${confirmDialog.subscription.id}/suspend`
      );
      loadSubs();
      setConfirmDialog({ open: false, type: 'suspend', subscription: null });
    } catch (err) {
      console.error('Failed to suspend subscription:', err);
    } finally {
      setConfirmLoading(false);
    }
  };

  // ── Reactivate Subscription ──
  const handleReactivateClick = (sub: SubscriptionResponse) => {
    setConfirmDialog({ open: true, type: 'reactivate', subscription: sub });
  };

  const handleReactivateConfirm = async () => {
    if (!confirmDialog.subscription) return;
    setConfirmLoading(true);
    try {
      await api.post<ApiResponse<Subscription>>(
        `/api/v1/super-admin/subscriptions/${confirmDialog.subscription.id}/reactivate`
      );
      loadSubs();
      setConfirmDialog({ open: false, type: 'reactivate', subscription: null });
    } catch (err) {
      console.error('Failed to reactivate subscription:', err);
    } finally {
      setConfirmLoading(false);
    }
  };

  // ── Status styles ──
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { bgcolor: 'rgba(16,185,129,0.1)', color: '#059669', dotColor: '#10b981' };
      case 'TRIAL':
        return { bgcolor: 'rgba(254,108,5,0.1)', color: '#FE6C05', dotColor: '#FE6C05' };
      case 'EXPIRED':
        return { bgcolor: 'rgba(220,38,38,0.08)', color: '#dc2626', dotColor: '#dc2626' };
      case 'SUSPENDED':
        return { bgcolor: 'rgba(107,114,128,0.08)', color: '#6b7280', dotColor: '#9ca3af' };
      default:
        return { bgcolor: 'rgba(107,114,128,0.08)', color: '#6b7280', dotColor: '#9ca3af' };
    }
  };

  // ── Stat counts ──
  const activeCount = subs.filter((s) => s.status === 'ACTIVE').length;
  const trialCount = subs.filter((s) => s.status === 'TRIAL').length;
  const expiredCount = subs.filter((s) => s.status === 'EXPIRED').length;
  const suspendedCount = subs.filter((s) => s.status === 'SUSPENDED').length;

  // ── Status filters ──
  const statusOptions = [
    { value: '', label: 'All Current', icon: <FiList size={14} />, color: '#6b7280' },
    { value: 'ALL', label: 'All History', icon: <FiArchive size={14} />, color: '#6b7280' },
    { value: 'ACTIVE', label: 'Active', icon: <FiCheckCircle size={14} />, color: '#059669' },
    { value: 'TRIAL', label: 'Trial', icon: <FiClock size={14} />, color: '#FE6C05' },
    { value: 'EXPIRED', label: 'Expired', icon: <FiXCircle size={14} />, color: '#dc2626' },
    { value: 'SUSPENDED', label: 'Suspended', icon: <FiSlash size={14} />, color: '#6b7280' },
  ];

  // ──────────────────────────── Columns ────────────────────────────
  const columns: GridColDef[] = [
    {
      field: 'shopName',
      headerName: 'Shop / Owner',
      flex: 1.5,
      minWidth: 220,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: '#222734',
              color: '#FE6C05',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            {(params.row.shopName as string)?.charAt(0).toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: 700, color: '#222734' }}
            >
              {params.row.shopName}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: '#9ca3af', fontSize: '0.7rem', display: 'block' }}
            >
              {params.row.ownerName}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'planName',
      headerName: 'Plan',
      width: 140,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.planName || 'Free Trial'}
          size="small"
          icon={<FiZap size={12} />}
          sx={{
            bgcolor: params.row.planName ? 'rgba(34,39,52,0.06)' : 'rgba(254,108,5,0.08)',
            color: params.row.planName ? '#222734' : '#FE6C05',
            fontWeight: 700,
            fontSize: '0.72rem',
            borderRadius: 1.5,
            border: 'none',
            maxWidth: '100%',
            '& .MuiChip-icon': {
              color: params.row.planName ? '#222734' : '#FE6C05',
            },
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 135,
      minWidth: 120,
      renderCell: (params) => {
        const style = getStatusStyle(params.value as string);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: style.dotColor,
                flexShrink: 0,
                boxShadow:
                  params.value === 'ACTIVE'
                    ? '0 0 0 3px rgba(16,185,129,0.2)'
                    : params.value === 'TRIAL'
                      ? '0 0 0 3px rgba(254,108,5,0.2)'
                      : 'none',
                animation:
                  params.value === 'ACTIVE' || params.value === 'TRIAL'
                    ? 'pulse 2s infinite'
                    : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: `0 0 0 0 ${style.dotColor}40` },
                  '70%': { boxShadow: `0 0 0 6px ${style.dotColor}00` },
                  '100%': { boxShadow: `0 0 0 0 ${style.dotColor}00` },
                },
              }}
            />
            <Chip
              label={params.value}
              size="small"
              sx={{
                ...style,
                fontWeight: 700,
                fontSize: '0.7rem',
                borderRadius: 1.5,
                height: 24,
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'startDate',
      headerName: 'Start',
      width: 125,
      minWidth: 110,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <FiCalendar size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
          <Typography variant="caption" noWrap sx={{ color: '#6b7280', fontWeight: 500 }}>
            {params.value || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'endDate',
      headerName: 'Expires',
      width: 125,
      minWidth: 110,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <FiClock size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
          <Typography variant="caption" noWrap sx={{ color: '#6b7280', fontWeight: 500 }}>
            {params.value || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'isCurrent',
      headerName: 'Current',
      width: 90,
      minWidth: 80,
      type: 'boolean',
      renderCell: (params) =>
        params.value ? (
          <Chip
            label="Yes"
            size="small"
            sx={{
              bgcolor: 'rgba(16,185,129,0.1)',
              color: '#059669',
              fontWeight: 700,
              fontSize: '0.65rem',
              borderRadius: 1.5,
              height: 22,
            }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: '#d1d5db' }}>
            —
          </Typography>
        ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 120,
      minWidth: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const sub = params.row as SubscriptionResponse;
        const canSuspend = sub.status === 'ACTIVE' || sub.status === 'TRIAL';
        const canReactivate = sub.status === 'SUSPENDED' || sub.status === 'EXPIRED';

        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* Extend Button */}
            <Tooltip title="Extend Subscription" arrow>
              <IconButton
                size="small"
                onClick={() => handleExtendClick(sub)}
                sx={{
                  color: '#222734',
                  bgcolor: 'rgba(34,39,52,0.06)',
                  borderRadius: 1.5,
                  width: 32,
                  height: 32,
                  '&:hover': { bgcolor: 'rgba(34,39,52,0.12)' },
                }}
              >
                <FiEdit2 size={14} />
              </IconButton>
            </Tooltip>

            {/* Suspend Button (for ACTIVE/TRIAL) */}
            {canSuspend && (
              <Tooltip title="Suspend" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleSuspendClick(sub)}
                  sx={{
                    color: '#d97706',
                    bgcolor: 'rgba(217,119,6,0.08)',
                    borderRadius: 1.5,
                    width: 32,
                    height: 32,
                    '&:hover': { bgcolor: 'rgba(217,119,6,0.15)' },
                  }}
                >
                  <FiPauseCircle size={14} />
                </IconButton>
              </Tooltip>
            )}

            {/* Reactivate Button (for SUSPENDED/EXPIRED) */}
            {canReactivate && (
              <Tooltip title="Reactivate" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleReactivateClick(sub)}
                  sx={{
                    color: '#059669',
                    bgcolor: 'rgba(5,150,105,0.08)',
                    borderRadius: 1.5,
                    width: 32,
                    height: 32,
                    '&:hover': { bgcolor: 'rgba(5,150,105,0.15)' },
                  }}
                >
                  <FiPlayCircle size={14} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  // ──────────────────────────── Render ────────────────────────────
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
              Subscriptions
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Monitor and manage all subscription plans across your platform.
            </Typography>
          </Box>
          <Button
            startIcon={<FiRefreshCw size={15} />}
            onClick={loadSubs}
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
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Total"
            value={rowCount}
            icon={<FiUsers size={20} />}
            color="#222734"
            bgColor="rgba(34,39,52,0.06)"
            subtitle="All subscriptions"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Active"
            value={activeCount}
            icon={<FiTrendingUp size={20} />}
            color="#059669"
            bgColor="rgba(16,185,129,0.1)"
            subtitle="Paid & active"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Trial"
            value={trialCount}
            icon={<FiClock size={20} />}
            color="#FE6C05"
            bgColor="rgba(254,108,5,0.1)"
            subtitle="On free trial"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Inactive"
            value={expiredCount + suspendedCount}
            icon={<FiPauseCircle size={20} />}
            color="#dc2626"
            bgColor="rgba(220,38,38,0.08)"
            subtitle="Expired & suspended"
          />
        </Grid>
      </Grid>

      {/* ── Filters Row ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid #f0f0f0',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Quick filter chips — hidden on mobile */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, flexWrap: 'wrap' }}>
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.value;
            return (
              <Chip
                key={opt.value}
                icon={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: isSelected ? opt.color : '#9ca3af',
                    }}
                  >
                    {opt.icon}
                  </Box>
                }
                label={opt.label}
                onClick={() => setStatusFilter(opt.value)}
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.78rem',
                  borderRadius: 2,
                  border: isSelected ? `1.5px solid ${opt.color}` : '1px solid #e5e7eb',
                  bgcolor: isSelected ? `${opt.color}12` : 'transparent',
                  color: isSelected ? opt.color : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  pl: 0.5,
                  '& .MuiChip-icon': {
                    marginLeft: '6px',
                    marginRight: '-2px',
                  },
                  '&:hover': {
                    bgcolor: isSelected ? `${opt.color}18` : 'rgba(34,39,52,0.04)',
                    borderColor: isSelected ? opt.color : '#d1d5db',
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Dropdown for mobile */}
        <FormControl size="small" sx={{ minWidth: 160, display: { xs: 'flex', sm: 'none' } }}>
          <InputLabel sx={{ fontSize: '0.85rem' }}>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: 2, fontSize: '0.85rem' }}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: opt.color, display: 'flex' }}>{opt.icon}</Box>
                  {opt.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* ── Data Table ── */}
      <Paper
        elevation={0}
        sx={{
          height: 560,
          width: '100%',
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
          borderRadius: 3,
        }}
      >
        <DataGrid
          rows={subs}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
          disableColumnMenu
          rowHeight={64}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#fafafa',
              borderBottom: '1px solid #f0f0f0',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #fafafa',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
            },
            '& .MuiDataGrid-row': {
              transition: 'background-color 0.12s ease',
              '&:hover': { bgcolor: 'rgba(254,108,5,0.02)' },
            },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #f0f0f0',
              bgcolor: '#fafafa',
            },
          }}
        />
      </Paper>

      {/* ── Extend Dialog ── */}
      <Dialog
        open={openExtendDialog}
        onClose={() => setOpenExtendDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 0.5, minWidth: 400, maxWidth: 440 },
        }}
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
              <FiEdit2 size={18} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734' }}>
              Extend Subscription
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {subToExtend && (
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 2.5,
                bgcolor: 'rgba(34,39,52,0.03)',
                border: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: '#222734',
                  color: '#FE6C05',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                {subToExtend.shopName?.charAt(0).toUpperCase()}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: '#222734' }}>
                  {subToExtend.shopName}
                </Typography>
                <Typography variant="caption" noWrap sx={{ color: '#6b7280' }}>
                  {subToExtend.planName || 'Trial'} · Ends{' '}
                  <strong style={{ color: '#dc2626' }}>{subToExtend.endDate}</strong>
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
            How many additional days do you want to add?
          </Typography>

          <TextField
            label="Number of Days"
            type="number"
            fullWidth
            size="small"
            value={extendDays}
            onChange={(e) => setExtendDays(Number(e.target.value))}
            inputProps={{ min: 1 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: '#222734' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          {/* Quick day buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {[7, 15, 30, 60, 90].map((d) => (
              <Chip
                key={d}
                label={`+${d}d`}
                onClick={() => setExtendDays(d)}
                sx={{
                  cursor: 'pointer',
                  fontWeight: extendDays === d ? 700 : 500,
                  fontSize: '0.78rem',
                  borderRadius: 2,
                  border: extendDays === d ? '1.5px solid #FE6C05' : '1px solid #e5e7eb',
                  bgcolor: extendDays === d ? 'rgba(254,108,5,0.08)' : 'transparent',
                  color: extendDays === d ? '#FE6C05' : '#6b7280',
                  '&:hover': {
                    bgcolor: extendDays === d ? 'rgba(254,108,5,0.12)' : 'rgba(0,0,0,0.03)',
                    borderColor: '#FE6C05',
                  },
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenExtendDialog(false)}
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
            onClick={handleExtendConfirm}
            variant="contained"
            disabled={extendLoading || extendDays <= 0}
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
                bgcolor: 'rgba(254,108,5,0.3)',
                color: '#fff',
              },
            }}
          >
            {extendLoading ? 'Extending...' : `Extend by ${extendDays} days`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Confirm Dialog (Suspend / Reactivate) ── */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, type: 'suspend', subscription: null })}
        PaperProps={{
          sx: { borderRadius: 3, p: 0.5, minWidth: 400, maxWidth: 440 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: confirmDialog.type === 'suspend' 
                  ? 'rgba(217,119,6,0.1)' 
                  : 'rgba(5,150,105,0.1)',
                color: confirmDialog.type === 'suspend' ? '#d97706' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {confirmDialog.type === 'suspend' ? (
                <FiPauseCircle size={18} />
              ) : (
                <FiPlayCircle size={18} />
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734' }}>
              {confirmDialog.type === 'suspend' ? 'Suspend Subscription' : 'Reactivate Subscription'}
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {confirmDialog.subscription && (
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: 2.5,
                bgcolor: confirmDialog.type === 'suspend' 
                  ? 'rgba(217,119,6,0.04)' 
                  : 'rgba(5,150,105,0.04)',
                border: confirmDialog.type === 'suspend'
                  ? '1px solid rgba(217,119,6,0.15)'
                  : '1px solid rgba(5,150,105,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: '#222734',
                  color: '#FE6C05',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                {confirmDialog.subscription.shopName?.charAt(0).toUpperCase()}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: '#222734' }}>
                  {confirmDialog.subscription.shopName}
                </Typography>
                <Typography variant="caption" noWrap sx={{ color: '#6b7280' }}>
                  {confirmDialog.subscription.planName || 'Trial'} · Status:{' '}
                  <strong>{confirmDialog.subscription.status}</strong>
                </Typography>
              </Box>
            </Box>
          )}

          {confirmDialog.type === 'suspend' ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <FiAlertTriangle size={18} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                This will <strong style={{ color: '#d97706' }}>suspend</strong> the subscription and{' '}
                <strong>deactivate the tenant</strong>. The shop owner will not be able to login until
                the subscription is reactivated.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <FiCheckCircle size={18} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                This will <strong style={{ color: '#059669' }}>reactivate</strong> the subscription
                and <strong>activate the tenant</strong>. The shop owner will be able to login and
                use the platform again.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialog({ open: false, type: 'suspend', subscription: null })}
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
            onClick={confirmDialog.type === 'suspend' ? handleSuspendConfirm : handleReactivateConfirm}
            variant="contained"
            disabled={confirmLoading}
            sx={{
              bgcolor: confirmDialog.type === 'suspend' ? '#d97706' : '#059669',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: confirmDialog.type === 'suspend' ? '#b45309' : '#047857',
                boxShadow: confirmDialog.type === 'suspend'
                  ? '0 4px 12px rgba(217,119,6,0.3)'
                  : '0 4px 12px rgba(5,150,105,0.3)',
              },
              '&:disabled': {
                bgcolor: confirmDialog.type === 'suspend'
                  ? 'rgba(217,119,6,0.4)'
                  : 'rgba(5,150,105,0.4)',
                color: '#fff',
              },
            }}
          >
            {confirmLoading
              ? confirmDialog.type === 'suspend'
                ? 'Suspending...'
                : 'Reactivating...'
              : confirmDialog.type === 'suspend'
                ? 'Suspend Subscription'
                : 'Reactivate Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionsListPage;