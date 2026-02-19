// src/pages/PlansListPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import api from '../api/http';
import { FiPlus, FiEdit, FiTrash, FiCheck, FiX } from 'react-icons/fi';
import CreatePlanDialog from '../components/CreatePlanDialog';
import EditPlanDialog from '../components/EditPlanDialog';
import type { ApiResponse, SubscriptionPlan } from '../types/api';

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
    api.post(url).then(() => loadPlans()).catch(console.error);
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

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Plan Name',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#222734' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'monthlyPrice',
      headerName: 'Price / Month',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FE6C05' }}>
          ৳{params.value}
        </Typography>
      ),
    },
    {
      field: 'durationDays',
      headerName: 'Duration',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          {params.value}d
        </Typography>
      ),
    },
    {
      field: 'limits',
      headerName: 'Limits (P / S / B / Storage)',
      width: 220,
      valueGetter: (_value, row) =>
        `${row.maxProducts ?? '∞'} / ${row.maxStaff ?? '∞'} / ${row.maxBranches ?? '∞'} / ${row.maxStorageMb ?? '∞'}MB`,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: '#6b7280', fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'features',
      headerName: 'Features',
      width: 260,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, alignItems: 'center', py: 0.5 }}>
          {params.row.advancedReports && (
            <Chip
              label="Reports"
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 20,
                bgcolor: 'rgba(37,99,235,0.08)',
                color: '#2563eb',
                border: 'none',
                fontWeight: 600,
              }}
            />
          )}
          {params.row.loyaltySystem && (
            <Chip
              label="Loyalty"
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 20,
                bgcolor: 'rgba(139,92,246,0.08)',
                color: '#7c3aed',
                border: 'none',
                fontWeight: 600,
              }}
            />
          )}
          {params.row.multiBranch && (
            <Chip
              label="Multi-Branch"
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 20,
                bgcolor: 'rgba(16,185,129,0.08)',
                color: '#059669',
                border: 'none',
                fontWeight: 600,
              }}
            />
          )}
          {params.row.apiAccess && (
            <Chip
              label="API"
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 20,
                bgcolor: 'rgba(254,108,5,0.08)',
                color: '#FE6C05',
                border: 'none',
                fontWeight: 600,
              }}
            />
          )}
          {!params.row.advancedReports &&
            !params.row.loyaltySystem &&
            !params.row.multiBranch &&
            !params.row.apiAccess && (
              <Typography variant="caption" sx={{ color: '#d1d5db' }}>
                No features
              </Typography>
            )}
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            borderRadius: 1.5,
            bgcolor: params.value ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
            color: params.value ? '#059669' : '#6b7280',
          }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      sortable: false,
      renderCell: (params) => {
        const plan = params.row as SubscriptionPlan;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="Edit Plan">
              <IconButton
                size="small"
                onClick={() => handleEditClick(plan)}
                sx={{
                  color: '#222734',
                  bgcolor: 'rgba(34,39,52,0.06)',
                  borderRadius: 1.5,
                  '&:hover': { bgcolor: 'rgba(34,39,52,0.12)' },
                }}
              >
                <FiEdit size={15} />
              </IconButton>
            </Tooltip>

            {plan.isActive ? (
              <Tooltip title="Deactivate">
                <IconButton
                  size="small"
                  onClick={() => handleToggleActive(plan)}
                  sx={{
                    color: '#d97706',
                    bgcolor: 'rgba(217,119,6,0.08)',
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: 'rgba(217,119,6,0.15)' },
                  }}
                >
                  <FiX size={15} />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Activate">
                <IconButton
                  size="small"
                  onClick={() => handleToggleActive(plan)}
                  sx={{
                    color: '#059669',
                    bgcolor: 'rgba(5,150,105,0.08)',
                    borderRadius: 1.5,
                    '&:hover': { bgcolor: 'rgba(5,150,105,0.15)' },
                  }}
                >
                  <FiCheck size={15} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Delete Plan">
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(plan)}
                sx={{
                  color: '#dc2626',
                  bgcolor: 'rgba(220,38,38,0.06)',
                  borderRadius: 1.5,
                  '&:hover': { bgcolor: 'rgba(220,38,38,0.12)' },
                }}
              >
                <FiTrash size={15} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#222734', mb: 0.5 }}>
            Subscription Plans
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Create and manage all subscription plans for your platform.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<FiPlus size={16} />}
          onClick={() => setOpenCreate(true)}
          sx={{
            bgcolor: '#FE6C05',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
            py: 1.2,
            textTransform: 'none',
            fontSize: '0.875rem',
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

      {/* Summary Chips */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Chip
          label={`${plans.length} Total Plans`}
          sx={{
            bgcolor: 'rgba(34,39,52,0.06)',
            color: '#222734',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
        <Chip
          label={`${plans.filter((p) => p.isActive).length} Active`}
          sx={{
            bgcolor: 'rgba(16,185,129,0.1)',
            color: '#059669',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
        <Chip
          label={`${plans.filter((p) => !p.isActive).length} Inactive`}
          sx={{
            bgcolor: 'rgba(107,114,128,0.1)',
            color: '#6b7280',
            fontWeight: 600,
            fontSize: '0.75rem',
          }}
        />
      </Box>

      {/* Data Table */}
      <Paper
        elevation={0}
        sx={{
          height: 580,
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
          hideFooter
          rowHeight={58}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#fafafa',
              borderBottom: '1px solid #f0f0f0',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #fafafa',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: '#fafafa',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
          }}
        />
      </Paper>

      {/* Create Dialog */}
      <CreatePlanDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={loadPlans}
      />

      {/* Edit Dialog */}
      <EditPlanDialog
        open={openEdit}
        onClose={handleEditClose}
        plan={planToEdit}
        onUpdated={() => {
          loadPlans();
          handleEditClose();
        }}
      />

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#222734' }}>
          Delete Plan
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#6b7280' }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: '#222734' }}>{planToDelete?.name}</strong>?
            This action cannot be undone and may affect active subscriptions.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
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