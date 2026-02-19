// src/pages/PlansListPage.tsx
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
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import api from '../api/http';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiPackage,
  FiDollarSign,
  FiZap,
  FiLayers,
  FiRefreshCw,
  FiUsers,
  FiDatabase,
  FiGitBranch,
  FiBarChart2,
  FiHeart,
  FiGlobe,
  FiStar,
  FiClock,
} from 'react-icons/fi';
import CreatePlanDialog from '../components/CreatePlanDialog';
import EditPlanDialog from '../components/EditPlanDialog';
import type { ApiResponse, SubscriptionPlan } from '../types/api';

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

// ──────────────────────────── Feature Badge ────────────────────────────
interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

const FeatureBadge = ({ icon, label, color, bgColor }: FeatureBadgeProps) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.4,
      px: 0.8,
      py: 0.3,
      borderRadius: 1.2,
      bgcolor: bgColor,
      color,
    }}
  >
    {icon}
    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{label}</Typography>
  </Box>
);

// ──────────────────────────── Page Component ────────────────────────────
const PlansListPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  const loadPlans = () => {
    setLoading(true);
    api
      .get<ApiResponse<SubscriptionPlan[]>>('/api/v1/super-admin/plans')
      .then((res) => setPlans(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleToggleActive = (plan: SubscriptionPlan) => {
    const url = plan.isActive
      ? `/api/v1/super-admin/plans/${plan.id}/deactivate`
      : `/api/v1/super-admin/plans/${plan.id}/activate`;
    api
      .post(url)
      .then(() => loadPlans())
      .catch(console.error);
  };

  const handleEditClick = (plan: SubscriptionPlan) => {
    setPlanToEdit(plan);
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setTimeout(() => setPlanToEdit(null), 300);
  };

  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    try {
      await api.delete(`/api/v1/super-admin/plans/${planToDelete.id}`);
      loadPlans();
    } catch (err) {
      console.error('Failed to delete plan:', err);
    } finally {
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  // ── Stats ──
  const activePlans = plans.filter((p) => p.isActive).length;
  const inactivePlans = plans.filter((p) => !p.isActive).length;
  const avgPrice =
    plans.length > 0
      ? Math.round(plans.reduce((sum, p) => sum + p.monthlyPrice, 0) / plans.length)
      : 0;

  // ──────────────────────────── Columns ────────────────────────────
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Plan',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => {
        const plan = params.row as SubscriptionPlan;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Plan Icon */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: plan.isActive
                  ? 'linear-gradient(135deg, #FE6C05 0%, #ff9a44 100%)'
                  : 'linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: plan.isActive
                  ? '0 4px 12px rgba(254,108,5,0.3)'
                  : 'none',
              }}
            >
              <FiPackage size={18} color="#fff" />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 700, color: '#222734' }}
              >
                {plan.name}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: '#9ca3af', fontSize: '0.7rem', display: 'block' }}
              >
                {plan.durationDays} days · Sort: {plan.sortOrder}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'monthlyPrice',
      headerName: 'Price',
      width: 130,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: 'rgba(254,108,5,0.1)',
              color: '#FE6C05',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FiDollarSign size={14} />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: '#222734', lineHeight: 1.2 }}
            >
              ৳{params.value}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.65rem' }}>
              /month
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'limits',
      headerName: 'Limits',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const plan = params.row as SubscriptionPlan;
        return (
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Tooltip title="Max Products" arrow>
              <Chip
                icon={<FiLayers size={11} />}
                label={plan.maxProducts ?? '∞'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(34,39,52,0.06)',
                  color: '#374151',
                  '& .MuiChip-icon': { color: '#6b7280' },
                }}
              />
            </Tooltip>
            <Tooltip title="Max Staff" arrow>
              <Chip
                icon={<FiUsers size={11} />}
                label={plan.maxStaff ?? '∞'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(34,39,52,0.06)',
                  color: '#374151',
                  '& .MuiChip-icon': { color: '#6b7280' },
                }}
              />
            </Tooltip>
            <Tooltip title="Max Branches" arrow>
              <Chip
                icon={<FiGitBranch size={11} />}
                label={plan.maxBranches ?? '∞'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(34,39,52,0.06)',
                  color: '#374151',
                  '& .MuiChip-icon': { color: '#6b7280' },
                }}
              />
            </Tooltip>
          </Box>
        );
      },
    },
    {
      field: 'features',
      headerName: 'Features',
      width: 280,
      sortable: false,
      renderCell: (params) => {
        const plan = params.row as SubscriptionPlan;
        const features = [];

        if (plan.advancedReports)
          features.push({
            icon: <FiBarChart2 size={10} />,
            label: 'Reports',
            color: '#2563eb',
            bgColor: 'rgba(37,99,235,0.1)',
          });
        if (plan.loyaltySystem)
          features.push({
            icon: <FiHeart size={10} />,
            label: 'Loyalty',
            color: '#ec4899',
            bgColor: 'rgba(236,72,153,0.1)',
          });
        if (plan.multiBranch)
          features.push({
            icon: <FiGitBranch size={10} />,
            label: 'Multi-Branch',
            color: '#059669',
            bgColor: 'rgba(5,150,105,0.1)',
          });
        if (plan.apiAccess)
          features.push({
            icon: <FiGlobe size={10} />,
            label: 'API',
            color: '#7c3aed',
            bgColor: 'rgba(124,58,237,0.1)',
          });

        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {features.length > 0 ? (
              features.map((f, i) => (
                <FeatureBadge key={i} {...f} />
              ))
            ) : (
              <Typography variant="caption" sx={{ color: '#d1d5db', fontStyle: 'italic' }}>
                No features
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const isActive = params.value as boolean;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isActive ? '#10b981' : '#9ca3af',
                boxShadow: isActive ? '0 0 0 3px rgba(16,185,129,0.2)' : 'none',
                animation: isActive ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
                  '70%': { boxShadow: '0 0 0 6px rgba(16,185,129,0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
                },
              }}
            />
            <Chip
              label={isActive ? 'Active' : 'Inactive'}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                borderRadius: 1.5,
                height: 24,
                bgcolor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.08)',
                color: isActive ? '#059669' : '#6b7280',
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 130,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const plan = params.row as SubscriptionPlan;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit Plan" arrow>
              <IconButton
                size="small"
                onClick={() => handleEditClick(plan)}
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

            {plan.isActive ? (
              <Tooltip title="Deactivate" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleToggleActive(plan)}
                  sx={{
                    color: '#d97706',
                    bgcolor: 'rgba(217,119,6,0.08)',
                    borderRadius: 1.5,
                    width: 32,
                    height: 32,
                    '&:hover': { bgcolor: 'rgba(217,119,6,0.15)' },
                  }}
                >
                  <FiX size={14} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Activate" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleToggleActive(plan)}
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

            <Tooltip title="Delete Plan" arrow>
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(plan)}
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
              Subscription Plans
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Create and manage pricing plans for your platform.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              startIcon={<FiRefreshCw size={15} />}
              onClick={loadPlans}
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
              variant="contained"
              startIcon={<FiPlus size={16} />}
              onClick={() => setOpenCreate(true)}
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
              }}
            >
              Create Plan
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Total Plans"
            value={plans.length}
            icon={<FiPackage size={20} />}
            color="#222734"
            bgColor="rgba(34,39,52,0.06)"
            subtitle="All pricing tiers"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Active"
            value={activePlans}
            icon={<FiZap size={20} />}
            color="#059669"
            bgColor="rgba(16,185,129,0.1)"
            subtitle="Currently available"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Inactive"
            value={inactivePlans}
            icon={<FiClock size={20} />}
            color="#6b7280"
            bgColor="rgba(107,114,128,0.08)"
            subtitle="Hidden from users"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Avg. Price"
            value={`৳${avgPrice}`}
            icon={<FiDollarSign size={20} />}
            color="#FE6C05"
            bgColor="rgba(254,108,5,0.1)"
            subtitle="Per month"
          />
        </Grid>
      </Grid>

      {/* ── Quick Filters / Info Bar ── */}
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
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Chip
            icon={<FiStar size={12} />}
            label={`${plans.length} Plans`}
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
            icon={<FiCheck size={12} />}
            label={`${activePlans} Active`}
            sx={{
              bgcolor: 'rgba(16,185,129,0.1)',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: 2,
              '& .MuiChip-icon': { color: '#059669' },
            }}
          />
          <Chip
            icon={<FiX size={12} />}
            label={`${inactivePlans} Inactive`}
            sx={{
              bgcolor: 'rgba(107,114,128,0.08)',
              color: '#6b7280',
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: 2,
              '& .MuiChip-icon': { color: '#6b7280' },
            }}
          />
        </Box>

        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
          <FiDatabase size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Last updated: Just now
        </Typography>
      </Paper>

      {/* ── Data Table ── */}
      <Paper
        elevation={0}
        sx={{
          height: 520,
          width: '100%',
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
          borderRadius: 3,
        }}
      >
        <DataGrid
          rows={plans}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooter
          rowHeight={68}
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
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'rgba(254,108,5,0.02)',
                transform: 'scale(1.002)',
              },
            },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
          }}
        />
      </Paper>

      {/* ── Empty State ── */}
      {plans.length === 0 && !loading && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 4,
              bgcolor: 'rgba(254,108,5,0.1)',
              color: '#FE6C05',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <FiPackage size={36} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734', mb: 1 }}>
            No Plans Yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, maxWidth: 360, mx: 'auto' }}>
            Create your first subscription plan to start monetizing your platform.
          </Typography>
          <Button
            variant="contained"
            startIcon={<FiPlus size={16} />}
            onClick={() => setOpenCreate(true)}
            sx={{
              bgcolor: '#FE6C05',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 4,
              py: 1.2,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#e55f00',
                boxShadow: '0 4px 12px rgba(254,108,5,0.3)',
              },
            }}
          >
            Create Your First Plan
          </Button>
        </Box>
      )}

      {/* ── Create Dialog ── */}
      <CreatePlanDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadPlans}
      />

      {/* ── Edit Dialog ── */}
      <EditPlanDialog
        open={openEdit}
        onClose={handleEditClose}
        plan={planToEdit}
        onUpdated={() => {
          loadPlans();
          handleEditClose();
        }}
      />

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 0.5, minWidth: 400 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(220,38,38,0.1)',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiTrash2 size={18} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734' }}>
              Delete Plan
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {planToDelete && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(220,38,38,0.04)',
                border: '1px solid rgba(220,38,38,0.1)',
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
                <FiPackage size={18} color="#fff" />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#222734' }}>
                  {planToDelete.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  ৳{planToDelete.monthlyPrice} / month · {planToDelete.durationDays} days
                </Typography>
              </Box>
            </Box>
          )}

          <DialogContentText sx={{ color: '#6b7280' }}>
            Are you sure you want to delete this plan? This action{' '}
            <strong style={{ color: '#dc2626' }}>cannot be undone</strong> and may affect
            existing subscriptions using this plan.
          </DialogContentText>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
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
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              bgcolor: '#dc2626',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#b91c1c',
                boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
              },
            }}
          >
            Delete Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlansListPage;