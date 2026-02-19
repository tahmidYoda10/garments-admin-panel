// src/pages/TenantsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Avatar,
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
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import api from '../api/http';
import {
  FiEye,
  FiCheck,
  FiX,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiCalendar,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiZap,
} from 'react-icons/fi';
import type { ApiResponse, PagedResponse, Tenant } from '../types/api';
import CreateTenantDialog from '../components/CreateTenantDialog.tsx';
// ──────────────────────────── Stat Card ────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgColor, subtitle }) => (
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

// ──────────────────────────── Page Component ────────────────────────────
const TenantsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Activate with Trial dialog
  const [trialDialogOpen, setTrialDialogOpen] = useState(false);
  const [tenantForTrial, setTenantForTrial] = useState<Tenant | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);

  const loadTenants = () => {
    setLoading(true);
    api
      .get<ApiResponse<PagedResponse<Tenant>>>('/api/v1/super-admin/tenants', {
        params: {
          page: paginationModel.page,
          size: paginationModel.pageSize,
          search: searchQuery || undefined,
        },
      })
      .then((res) => {
        setTenants(res.data.data.content);
        setRowCount(res.data.data.totalElements);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, searchQuery]);

  // Search handler
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // Toggle Active
  const handleToggleActive = (e: React.MouseEvent, tenant: Tenant) => {
    e.stopPropagation();
    const url = tenant.isActive
      ? `/api/v1/super-admin/tenants/${tenant.id}/deactivate`
      : `/api/v1/super-admin/tenants/${tenant.id}/activate`;
    api
      .post(url)
      .then(() => loadTenants())
      .catch(console.error);
  };

  // Activate with Trial
  const handleActivateWithTrialClick = (e: React.MouseEvent, tenant: Tenant) => {
    e.stopPropagation();
    setTenantForTrial(tenant);
    setTrialDialogOpen(true);
  };

  const handleActivateWithTrialConfirm = async () => {
    if (!tenantForTrial) return;
    setTrialLoading(true);
    try {
      await api.post(`/api/v1/super-admin/tenants/${tenantForTrial.id}/activate-with-trial`);
      loadTenants();
      setTrialDialogOpen(false);
      setTenantForTrial(null);
    } catch (err) {
      console.error('Failed to activate with trial:', err);
    } finally {
      setTrialLoading(false);
    }
  };

  // Delete Tenant
  const handleDeleteClick = (e: React.MouseEvent, tenant: Tenant) => {
    e.stopPropagation();
    setTenantToDelete(tenant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/api/v1/super-admin/tenants/${tenantToDelete.id}`);
      loadTenants();
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
    } catch (err) {
      console.error('Failed to delete tenant:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Stats ──
  const activeTenants = tenants.filter((t) => t.isActive).length;
  const inactiveTenants = tenants.filter((t) => !t.isActive).length;

  // ──────────────────────────── Columns ────────────────────────────
  const columns: GridColDef[] = [
    {
      field: 'shopName',
      headerName: 'Shop',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => {
        const tenant = params.row as Tenant;
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 1,
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {tenant.logoPath ? (
              <Avatar src={tenant.logoPath} sx={{ width: 38, height: 38, flexShrink: 0 }} />
            ) : (
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: '#222734',
                  color: '#FE6C05',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                }}
              >
                {tenant.shopName?.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 700, color: '#222734', lineHeight: 1.3 }}
              >
                {tenant.shopName}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: '#9ca3af', fontSize: '0.7rem', display: 'block' }}
              >
                @{tenant.shopSlug}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'ownerName',
      headerName: 'Owner',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: '#374151' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
          <FiMail size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
          <Typography variant="caption" noWrap sx={{ color: '#6b7280', fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <FiPhone size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
            {params.value || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 115,
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
                flexShrink: 0,
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
      field: 'createdAt',
      headerName: 'Registered',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <FiCalendar size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 500 }}>
            {params.value
              ? new Date(params.value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 180,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const tenant = params.row as Tenant;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {/* View Details */}
            <Tooltip title="View Details" arrow>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/tenants/${tenant.id}`);
                }}
                sx={{
                  color: '#222734',
                  bgcolor: 'rgba(34,39,52,0.06)',
                  borderRadius: 1.5,
                  width: 32,
                  height: 32,
                  '&:hover': { bgcolor: 'rgba(34,39,52,0.12)' },
                }}
              >
                <FiEye size={14} />
              </IconButton>
            </Tooltip>

            {/* Activate/Deactivate */}
            {tenant.isActive ? (
              <Tooltip title="Deactivate" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => handleToggleActive(e, tenant)}
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
              <>
                {/* Simple Activate */}
                <Tooltip title="Activate" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => handleToggleActive(e, tenant)}
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

                {/* Activate with Trial */}
                <Tooltip title="Activate with Free Trial" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => handleActivateWithTrialClick(e, tenant)}
                    sx={{
                      color: '#FE6C05',
                      bgcolor: 'rgba(254,108,5,0.08)',
                      borderRadius: 1.5,
                      width: 32,
                      height: 32,
                      '&:hover': { bgcolor: 'rgba(254,108,5,0.15)' },
                    }}
                  >
                    <FiZap size={14} />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {/* Delete */}
            <Tooltip title="Delete Tenant" arrow>
              <IconButton
                size="small"
                onClick={(e) => handleDeleteClick(e, tenant)}
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
              Tenants
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Manage all registered shops on your platform.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              startIcon={<FiRefreshCw size={15} />}
              onClick={loadTenants}
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
              onClick={() => setCreateDialogOpen(true)}
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
              Create Tenant
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Total Tenants"
            value={rowCount}
            icon={<FiUsers size={20} />}
            color="#222734"
            bgColor="rgba(34,39,52,0.06)"
            subtitle="All registered"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Active"
            value={activeTenants}
            icon={<FiUserCheck size={20} />}
            color="#059669"
            bgColor="rgba(16,185,129,0.1)"
            subtitle="Currently active"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="Inactive"
            value={inactiveTenants}
            icon={<FiUserX size={20} />}
            color="#6b7280"
            bgColor="rgba(107,114,128,0.08)"
            subtitle="Deactivated"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="This Month"
            value={
              tenants.filter((t) => {
                if (!t.createdAt) return false;
                const created = new Date(t.createdAt);
                const now = new Date();
                return (
                  created.getMonth() === now.getMonth() &&
                  created.getFullYear() === now.getFullYear()
                );
              }).length
            }
            icon={<FiClock size={20} />}
            color="#FE6C05"
            bgColor="rgba(254,108,5,0.1)"
            subtitle="New signups"
          />
        </Grid>
      </Grid>

      {/* ── Search & Filter Bar ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: '1px solid #f0f0f0',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <TextField
          placeholder="Search by shop name, owner, email..."
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          sx={{
            flex: 1,
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&.Mui-focused fieldset': { borderColor: '#222734' },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FiSearch size={16} color="#9ca3af" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{
            bgcolor: '#222734',
            color: '#fff',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#374151' },
          }}
        >
          Search
        </Button>
        {searchQuery && (
          <Button
            onClick={handleClearSearch}
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(107,114,128,0.08)' },
            }}
          >
            Clear
          </Button>
        )}

        {/* Quick Chips */}
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          <Chip
            icon={<FiUsers size={12} />}
            label={`${rowCount} Total`}
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
            label={`${activeTenants} Active`}
            sx={{
              bgcolor: 'rgba(16,185,129,0.1)',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: 2,
              '& .MuiChip-icon': { color: '#059669' },
            }}
          />
        </Box>
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
          rows={tenants}
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
          onRowClick={(params) => navigate(`/admin/tenants/${params.row.id}`)}
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
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'rgba(254,108,5,0.03)',
              },
            },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #f0f0f0',
              bgcolor: '#fafafa',
            },
          }}
        />
      </Paper>

      {/* ── Create Tenant Dialog ── */}
      <CreateTenantDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={() => {
          loadTenants();
          setCreateDialogOpen(false);
        }}
      />

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 0.5, minWidth: 400 } }}
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
              Delete Tenant
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {tenantToDelete && (
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
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#222734',
                  color: '#FE6C05',
                  fontWeight: 800,
                  fontSize: '1rem',
                }}
              >
                {tenantToDelete.shopName?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#222734' }}>
                  {tenantToDelete.shopName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {tenantToDelete.email}
                </Typography>
              </Box>
            </Box>
          )}

          <DialogContentText sx={{ color: '#6b7280' }}>
            Are you sure you want to delete this tenant? This action will{' '}
            <strong style={{ color: '#dc2626' }}>deactivate the shop</strong> and{' '}
            <strong>suspend their subscription</strong>. The data will be soft-deleted.
          </DialogContentText>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
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
            disabled={deleteLoading}
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
            {deleteLoading ? 'Deleting...' : 'Delete Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Activate with Trial Dialog ── */}
      <Dialog
        open={trialDialogOpen}
        onClose={() => setTrialDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 0.5, minWidth: 400 } }}
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
              <FiZap size={18} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734' }}>
              Activate with Free Trial
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {tenantForTrial && (
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(254,108,5,0.04)',
                border: '1px solid rgba(254,108,5,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: '#222734',
                  color: '#FE6C05',
                  fontWeight: 800,
                  fontSize: '1rem',
                }}
              >
                {tenantForTrial.shopName?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#222734' }}>
                  {tenantForTrial.shopName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  {tenantForTrial.ownerName} · {tenantForTrial.email}
                </Typography>
              </Box>
            </Box>
          )}

          <DialogContentText sx={{ color: '#6b7280' }}>
            This will <strong style={{ color: '#059669' }}>activate</strong> the tenant and start a{' '}
            <strong style={{ color: '#FE6C05' }}>7-day free trial</strong>. The shop owner will be
            able to login and use the platform immediately.
          </DialogContentText>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setTrialDialogOpen(false)}
            disabled={trialLoading}
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
            onClick={handleActivateWithTrialConfirm}
            variant="contained"
            disabled={trialLoading}
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
            }}
          >
            {trialLoading ? 'Activating...' : 'Activate with Trial'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantsPage;