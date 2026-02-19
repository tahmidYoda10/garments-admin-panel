// src/pages/TenantDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/http';
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
  DialogTitle,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Link, useParams } from 'react-router-dom';
import ActivateSubscriptionDialog from '../components/ActivateSubscriptionDialog';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiCreditCard,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiZap,
  FiShield,
  FiEdit2,
  FiHome,
  FiHash,
  FiAlertCircle,
  FiFileText,
} from 'react-icons/fi';
import type { ApiResponse, Subscription, SubscriptionPayment, Tenant } from '../types/api';

// ──────────────────────────── Info Item ────────────────────────────
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}

const InfoItem = ({ icon, label, value, color = '#222734' }: InfoItemProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      py: 1.5,
      borderBottom: '1px solid #f8f8f8',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.5,
        bgcolor: 'rgba(34,39,52,0.05)',
        color: '#6b7280',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        mt: 0.2,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          color: '#9ca3af',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontSize: '0.65rem',
          display: 'block',
          mb: 0.3,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color, fontWeight: 600, wordBreak: 'break-word' }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

// ──────────────────────────── Quick Stat ────────────────────────────
interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

const QuickStat = ({ icon, label, value, color, bgColor }: QuickStatProps) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2.5,
      bgcolor: bgColor,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    }}
  >
    <Box sx={{ color }}>{icon}</Box>
    <Box>
      <Typography
        variant="caption"
        sx={{ color: '#6b7280', fontWeight: 600, fontSize: '0.65rem', display: 'block' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#222734' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

// ──────────────────────────── Payment Method Style ────────────────────────────
const getPaymentMethodStyle = (method: string) => {
  switch (method) {
    case 'BKASH':
      return { bgcolor: 'rgba(233,30,99,0.08)', color: '#e91e63' };
    case 'NAGAD':
      return { bgcolor: 'rgba(255,87,34,0.08)', color: '#ff5722' };
    case 'BANK_TRANSFER':
      return { bgcolor: 'rgba(33,150,243,0.08)', color: '#2196f3' };
    case 'CARD':
      return { bgcolor: 'rgba(103,58,183,0.08)', color: '#673ab7' };
    case 'CASH':
      return { bgcolor: 'rgba(16,185,129,0.08)', color: '#059669' };
    default:
      return { bgcolor: 'rgba(34,39,52,0.06)', color: '#222734' };
  }
};

// ──────────────────────────── Subscription Status Style ────────────────────────────
const getSubStatusStyle = (status?: string) => {
  switch (status) {
    case 'ACTIVE':
      return { bgcolor: 'rgba(16,185,129,0.1)', color: '#059669', label: 'Active' };
    case 'TRIAL':
      return { bgcolor: 'rgba(254,108,5,0.1)', color: '#FE6C05', label: 'Free Trial' };
    case 'EXPIRED':
      return { bgcolor: 'rgba(220,38,38,0.08)', color: '#dc2626', label: 'Expired' };
    case 'SUSPENDED':
      return { bgcolor: 'rgba(107,114,128,0.08)', color: '#6b7280', label: 'Suspended' };
    default:
      return { bgcolor: 'rgba(107,114,128,0.08)', color: '#6b7280', label: 'No Subscription' };
  }
};

// ──────────────────────────── Page Component ────────────────────────────
const TenantDetailPage: React.FC = () => {
  const { id } = useParams();
  const tenantId = Number(id);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    businessType: '',
  });

  // ✅ NEW: Payment states
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const loadTenant = useCallback(() => {
    api
      .get<ApiResponse<Tenant>>(`/api/v1/super-admin/tenants/${tenantId}`)
      .then((res) => {
        setTenant(res.data.data);
        setEditForm({
          shopName: res.data.data.shopName || '',
          ownerName: res.data.data.ownerName || '',
          phone: res.data.data.phone || '',
          address: res.data.data.address || '',
          businessType: res.data.data.businessType || '',
        });
      })
      .catch((err) => console.error(err));
  }, [tenantId]);

  // ✅ NEW: Load payments
  const loadPayments = useCallback(() => {
    setPaymentsLoading(true);
    api
      .get<ApiResponse<SubscriptionPayment[]>>(
        `/api/v1/super-admin/subscriptions/payments/tenant/${tenantId}`
      )
      .then((res) => setPayments(res.data.data))
      .catch(console.error)
      .finally(() => setPaymentsLoading(false));
  }, [tenantId]);

  // ✅ NEW: Load all data together
  const loadAllData = useCallback(() => {
    loadTenant();
    loadPayments();
  }, [loadTenant, loadPayments]);

  useEffect(() => {
    if (tenantId) loadAllData();
  }, [tenantId, loadAllData]);

  const handleToggleActive = () => {
    if (!tenant) return;
    const url = tenant.isActive
      ? `/api/v1/super-admin/tenants/${tenant.id}/deactivate`
      : `/api/v1/super-admin/tenants/${tenant.id}/activate`;
    api
      .post(url)
      .then(() => loadAllData()) // ✅ Reload everything
      .catch((err) => console.error(err));
  };

  const handleSubscriptionActivated = (_sub: Subscription) => {
    loadAllData(); // ✅ Reload everything — all cards update
    setActivateDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (!tenant) return;
    setEditLoading(true);
    try {
      await api.put(`/api/v1/super-admin/tenants/${tenant.id}`, editForm);
      loadAllData(); // ✅ Reload everything
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Failed to update tenant:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ NEW: Computed values for Payment Summary
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const daysRemaining = tenant?.currentSubscriptionEndDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(tenant.currentSubscriptionEndDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : tenant?.currentSubscription?.endDate
      ? Math.max(
          0,
          Math.ceil(
            (new Date(tenant.currentSubscription.endDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const subStatusStyle = getSubStatusStyle(
    tenant?.currentSubscriptionStatus || tenant?.currentSubscription?.status
  );

  // ✅ NEW: Payment History Columns
  const paymentColumns: GridColDef[] = [
    {
      field: 'paymentDate',
      headerName: 'Date',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <FiCalendar size={13} color="#9ca3af" />
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
      field: 'amount',
      headerName: 'Amount',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
          ৳{params.value?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      field: 'paymentMethod',
      headerName: 'Method',
      width: 130,
      renderCell: (params) => {
        const style = getPaymentMethodStyle(params.value as string);
        return (
          <Chip
            label={(params.value as string)?.replace('_', ' ') || '—'}
            size="small"
            sx={{
              ...style,
              fontWeight: 700,
              fontSize: '0.7rem',
              borderRadius: 1.5,
              height: 24,
            }}
          />
        );
      },
    },
    {
      field: 'transactionId',
      headerName: 'Transaction ID',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <FiHash size={13} color="#9ca3af" />
          <Typography variant="caption" noWrap sx={{ color: '#6b7280' }}>
            {params.value || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'planInfo',
      headerName: 'Plan',
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
          {params.row.subscription?.plan?.name || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'confirmedBy',
      headerName: 'Confirmed By',
      width: 130,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          {params.value || '—'}
        </Typography>
      ),
    },
  ];

  if (!tenant) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 400,
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 3,
            bgcolor: 'rgba(254,108,5,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 0.6 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0.6 },
            },
          }}
        >
          <FiHome size={28} color="#FE6C05" />
        </Box>
        <Typography color="text.secondary">Loading tenant details...</Typography>
      </Box>
    );
  }

  // Get current subscription info
  const currentPlan =
    tenant.currentSubscriptionPlanName ||
    tenant.currentSubscription?.planName ||
    'Free Trial';
  const subscriptionStatus =
    tenant.currentSubscriptionStatus ||
    tenant.currentSubscription?.status ||
    'TRIAL';
  const subscriptionEndDate =
    tenant.currentSubscriptionEndDate ||
    tenant.currentSubscription?.endDate;

  return (
    <Box>
      {/* ── Back Button ── */}
      <Button
        component={Link}
        to="/admin/tenants"
        startIcon={<FiArrowLeft size={16} />}
        sx={{
          color: '#6b7280',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 2,
          mb: 3,
          '&:hover': { bgcolor: 'rgba(107,114,128,0.08)', color: '#222734' },
        }}
      >
        Back to Tenants
      </Button>

      {/* ── Header Card ── */}
      <Card
        elevation={0}
        sx={{
          border: tenant.isActive ? '1px solid #f0f0f0' : '1px solid rgba(220,38,38,0.2)',
          borderRadius: 3,
          mb: 3,
          overflow: 'hidden',
        }}
      >
        {/* Gradient Banner */}
        <Box
          sx={{
            height: 110,
            background: tenant.isActive
              ? 'linear-gradient(135deg, #222734 0%, #374151 50%, #FE6C05 100%)'
              : 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 50%, #f87171 100%)',
            position: 'relative',
          }}
        >
          {!tenant.isActive && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <FiAlertCircle size={14} color="#fff" />
              <Typography
                variant="caption"
                sx={{ color: '#fff', fontWeight: 700, fontSize: '0.7rem' }}
              >
                DEACTIVATED
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ px: 3, pt: 0, pb: '24px !important' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 2,
              mt: '-44px',
              mb: 2.5,
              flexWrap: 'wrap',
            }}
          >
            {tenant.logoPath ? (
              <Avatar
                src={tenant.logoPath}
                sx={{
                  width: 88,
                  height: 88,
                  border: tenant.isActive ? '4px solid #fff' : '4px solid #fecaca',
                  boxShadow: tenant.isActive
                    ? '0 4px 20px rgba(0,0,0,0.12)'
                    : '0 4px 20px rgba(220,38,38,0.2)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  bgcolor: tenant.isActive ? '#222734' : '#dc2626',
                  color: tenant.isActive ? '#FE6C05' : '#fff',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  border: tenant.isActive ? '4px solid #fff' : '4px solid #fecaca',
                  boxShadow: tenant.isActive
                    ? '0 4px 20px rgba(0,0,0,0.12)'
                    : '0 4px 20px rgba(220,38,38,0.2)',
                  flexShrink: 0,
                }}
              >
                {tenant.shopName.charAt(0).toUpperCase()}
              </Avatar>
            )}

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                ml: 'auto',
                pb: 0.5,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<FiEdit2 size={13} />}
                onClick={() => setEditDialogOpen(true)}
                sx={{
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  fontSize: '0.78rem',
                  '&:hover': { borderColor: '#d1d5db', bgcolor: 'rgba(0,0,0,0.02)' },
                }}
              >
                Edit
              </Button>

              {tenant.isActive ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FiX size={13} />}
                  onClick={handleToggleActive}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: '#fbbf24',
                    color: '#d97706',
                    fontSize: '0.78rem',
                    '&:hover': { borderColor: '#f59e0b', bgcolor: 'rgba(217,119,6,0.04)' },
                  }}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FiCheck size={13} />}
                  onClick={handleToggleActive}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    bgcolor: '#059669',
                    color: '#fff',
                    fontSize: '0.78rem',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#047857', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' },
                  }}
                >
                  Activate Now
                </Button>
              )}
            </Box>
          </Box>

          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                mb: 0.5,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: '#222734', lineHeight: 1.2 }}
              >
                {tenant.shopName}
              </Typography>

              <Chip
                label={tenant.isActive ? 'Active' : 'Deactivated'}
                size="small"
                icon={tenant.isActive ? <FiCheck size={11} /> : <FiX size={11} />}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  borderRadius: 2,
                  height: 24,
                  bgcolor: tenant.isActive
                    ? 'rgba(16,185,129,0.1)'
                    : 'rgba(220,38,38,0.1)',
                  color: tenant.isActive ? '#059669' : '#dc2626',
                  '& .MuiChip-icon': {
                    color: tenant.isActive ? '#059669' : '#dc2626',
                  },
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: '#9ca3af',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              @{tenant.shopSlug}
            </Typography>
          </Box>

          {!tenant.isActive && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(220,38,38,0.1)',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FiAlertCircle size={16} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#dc2626' }}>
                  This tenant is currently deactivated
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  The shop cannot access the platform until reactivated.
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── Main Content ── */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Contact Info Card */}
          <Card
            elevation={0}
            sx={{ border: '1px solid #f0f0f0', borderRadius: 3, p: 3, mb: 3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: 'rgba(254,108,5,0.1)',
                  color: '#FE6C05',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiUser size={18} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222734' }}>
                Contact Information
              </Typography>
            </Box>

            <InfoItem icon={<FiUser size={14} />} label="Owner Name" value={tenant.ownerName} />
            <InfoItem icon={<FiMail size={14} />} label="Email Address" value={tenant.email} />
            <InfoItem icon={<FiPhone size={14} />} label="Phone Number" value={tenant.phone} />
            <InfoItem
              icon={<FiMapPin size={14} />}
              label="Address"
              value={tenant.address || 'Not provided'}
            />
          </Card>

          {/* Business Info Card */}
          <Card
            elevation={0}
            sx={{ border: '1px solid #f0f0f0', borderRadius: 3, p: 3, mb: 3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: 'rgba(34,39,52,0.06)',
                  color: '#222734',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiBriefcase size={18} />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222734' }}>
                Business Details
              </Typography>
            </Box>

            <InfoItem
              icon={<FiBriefcase size={14} />}
              label="Business Type"
              value={tenant.businessType || 'Not specified'}
            />
            <InfoItem
              icon={<FiDollarSign size={14} />}
              label="Currency"
              value={tenant.currency || 'Not specified'}
            />
            <InfoItem
              icon={<FiCalendar size={14} />}
              label="Registered On"
              value={
                tenant.createdAt
                  ? new Date(tenant.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'
              }
            />
          </Card>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <QuickStat
                icon={<FiClock size={18} />}
                label="Days Active"
                value={
                  tenant.createdAt
                    ? `${Math.floor(
                        (Date.now() - new Date(tenant.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}`
                    : '—'
                }
                color="#FE6C05"
                bgColor="rgba(254,108,5,0.06)"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <QuickStat
                icon={<FiShield size={18} />}
                label="Status"
                value={tenant.isActive ? 'Active' : 'Deactivated'}
                color={tenant.isActive ? '#059669' : '#dc2626'}
                bgColor={
                  tenant.isActive ? 'rgba(5,150,105,0.06)' : 'rgba(220,38,38,0.06)'
                }
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <QuickStat
                icon={<FiZap size={18} />}
                label="Plan"
                value={currentPlan}
                color="#7c3aed"
                bgColor="rgba(124,58,237,0.06)"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <QuickStat
                icon={<FiHash size={18} />}
                label="Slug"
                value={`@${tenant.shopSlug}`}
                color="#222734"
                bgColor="rgba(34,39,52,0.04)"
              />
            </Grid>
          </Grid>

          {/* ═══════════════════════════════════════════════
              ✅ NEW: Payment Summary Cards
              ═══════════════════════════════════════════════ */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222734', mb: 2 }}>
              Payment Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Card
                  elevation={0}
                  sx={{
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
                      <Box>
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
                          Total Paid
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669', mt: 0.5 }}>
                          ৳{totalPaid.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.3,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(16,185,129,0.1)',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiDollarSign size={20} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Card
                  elevation={0}
                  sx={{
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
                      <Box>
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
                          Payments
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#222734', mt: 0.5 }}>
                          {payments.length}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.3,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(34,39,52,0.06)',
                          color: '#222734',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiCreditCard size={20} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Card
                  elevation={0}
                  sx={{
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
                      <Box>
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
                          Days Remaining
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: daysRemaining <= 7 ? '#dc2626' : '#FE6C05',
                            mt: 0.5,
                          }}
                        >
                          {daysRemaining}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.3,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(254,108,5,0.1)',
                          color: '#FE6C05',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiCalendar size={20} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Card
                  elevation={0}
                  sx={{
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
                      <Box>
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
                          Sub Status
                        </Typography>
                        <Chip
                          label={subStatusStyle.label}
                          size="small"
                          sx={{
                            bgcolor: subStatusStyle.bgcolor,
                            color: subStatusStyle.color,
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            borderRadius: 1.5,
                            mt: 1,
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          p: 1.3,
                          borderRadius: 2.5,
                          bgcolor: subStatusStyle.bgcolor,
                          color: subStatusStyle.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FiFileText size={20} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* ═══════════════════════════════════════════════
              ✅ NEW: Payment History Table
              ═══════════════════════════════════════════════ */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #f0f0f0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#222734' }}>
                  Payment History
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  All subscription payments for this tenant
                </Typography>
              </Box>
              <Chip
                label={`${payments.length} records`}
                size="small"
                sx={{
                  bgcolor: 'rgba(34,39,52,0.06)',
                  color: '#222734',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
            </Box>

            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={payments}
                columns={paymentColumns}
                getRowId={(row) => row.id}
                loading={paymentsLoading}
                disableRowSelectionOnClick
                disableColumnMenu
                rowHeight={58}
                pageSizeOptions={[10, 20]}
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
                  '& .MuiDataGrid-row:hover': {
                    bgcolor: 'rgba(254,108,5,0.03)',
                  },
                  '& .MuiDataGrid-columnSeparator': { display: 'none' },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #f0f0f0',
                    bgcolor: '#fafafa',
                  },
                  '& .MuiDataGrid-overlay': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right Column — Subscription Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #f0f0f0',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'sticky',
              top: 100,
            }}
          >
            <Box
              sx={{
                p: 2.5,
                background: 'linear-gradient(135deg, #222734 0%, #374151 100%)',
                color: '#fff',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(254,108,5,0.2)',
                    color: '#FE6C05',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FiCreditCard size={20} />
                </Box>
                <Box>
                  <Typography component="span" sx={{ fontWeight: 700, display: 'block' }}>
                    Subscription
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Current plan details
                  </Typography>
                </Box>
              </Box>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor:
                    subscriptionStatus === 'ACTIVE'
                      ? 'rgba(5,150,105,0.04)'
                      : 'rgba(254,108,5,0.04)',
                  border:
                    subscriptionStatus === 'ACTIVE'
                      ? '1px dashed rgba(5,150,105,0.3)'
                      : '1px dashed rgba(254,108,5,0.3)',
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#9ca3af', fontWeight: 600, display: 'block', mb: 0.5 }}
                >
                  Current Plan
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: subscriptionStatus === 'ACTIVE' ? '#059669' : '#FE6C05',
                  }}
                >
                  {currentPlan}
                </Typography>
                <Chip
                  label={subscriptionStatus}
                  size="small"
                  sx={{
                    mt: 1,
                    height: 22,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    bgcolor:
                      subscriptionStatus === 'ACTIVE'
                        ? 'rgba(5,150,105,0.1)'
                        : subscriptionStatus === 'TRIAL'
                          ? 'rgba(254,108,5,0.1)'
                          : 'rgba(107,114,128,0.1)',
                    color:
                      subscriptionStatus === 'ACTIVE'
                        ? '#059669'
                        : subscriptionStatus === 'TRIAL'
                          ? '#FE6C05'
                          : '#6b7280',
                  }}
                />
                {subscriptionEndDate && (
                  <Typography
                    variant="caption"
                    sx={{ color: '#6b7280', display: 'block', mt: 1 }}
                  >
                    Expires: {new Date(subscriptionEndDate).toLocaleDateString()}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Button
                variant="contained"
                fullWidth
                startIcon={<FiZap size={16} />}
                onClick={() => setActivateDialogOpen(true)}
                disabled={!tenant.isActive}
                sx={{
                  bgcolor: '#FE6C05',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1.3,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#e55f00',
                    boxShadow: '0 4px 16px rgba(254,108,5,0.35)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(107,114,128,0.2)',
                    color: '#9ca3af',
                  },
                }}
              >
                {subscriptionStatus === 'ACTIVE' ? 'Change Plan' : 'Activate Paid Plan'}
              </Button>

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  mt: 2,
                  color: '#9ca3af',
                }}
              >
                {tenant.isActive
                  ? 'Upgrade to unlock premium features'
                  : 'Tenant must be active to manage subscription'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Edit Tenant Dialog ── */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
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
                bgcolor: 'rgba(34,39,52,0.06)',
                color: '#222734',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiEdit2 size={18} />
            </Box>
            <Box>
              <Typography
                component="span"
                sx={{ fontWeight: 700, color: '#222734', display: 'block' }}
              >
                Edit Tenant
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                Update tenant information
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Shop Name"
              fullWidth
              size="small"
              value={editForm.shopName}
              onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: '#222734' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
              }}
            />
            <TextField
              label="Owner Name"
              fullWidth
              size="small"
              value={editForm.ownerName}
              onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: '#222734' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
              }}
            />
            <TextField
              label="Phone"
              fullWidth
              size="small"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: '#222734' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
              }}
            />
            <TextField
              label="Address"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused fieldset': { borderColor: '#222734' },
                },
                '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
              }}
            />
            <TextField
              label="Business Type"
              fullWidth
              size="small"
              value={editForm.businessType}
              onChange={(e) => setEditForm({ ...editForm, businessType: e.target.value })}
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
            onClick={() => setEditDialogOpen(false)}
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
            onClick={handleEditSubmit}
            variant="contained"
            disabled={editLoading}
            sx={{
              bgcolor: '#222734',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#374151',
                boxShadow: '0 4px 12px rgba(34,39,52,0.3)',
              },
            }}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Activate Subscription Dialog ── */}
      <ActivateSubscriptionDialog
        open={activateDialogOpen}
        onClose={() => setActivateDialogOpen(false)}
        tenantId={tenant.id}
        shopName={tenant.shopName}
        onActivated={handleSubscriptionActivated}
      />
    </Box>
  );
};

export default TenantDetailPage;