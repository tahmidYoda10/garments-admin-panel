// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid';
import api from '../api/http';
import { FiUsers, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import type { ApiResponse, DashboardResponse } from '../types/api';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: string;
}

const StatCard = ({ title, value, icon, color, bgColor, trend }: StatCardProps) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      border: '1px solid #f0f0f0',
      borderRadius: 3,
      transition: 'box-shadow 0.2s ease',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '0.7rem',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#222734',
              mt: 0.5,
              mb: trend ? 1 : 0,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
              {trend}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: bgColor,
            color: color,
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

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const theme = useTheme();

  useEffect(() => {
    api
      .get<ApiResponse<DashboardResponse>>('/api/v1/super-admin/dashboard')
      .then((res) => setData(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300,
        }}
      >
        <Typography color="text.secondary">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: '#222734', mb: 0.5 }}
        >
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Welcome back, Admin — here's what's happening with your platform today.
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Tenants"
            value={data.totalTenants}
            icon={<FiUsers size={22} />}
            color={theme.palette.primary.main}
            bgColor="rgba(37, 99, 235, 0.1)"
            trend="All registered shops"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Tenants"
            value={data.activeTenants}
            icon={<FiCheckCircle size={22} />}
            color="#10b981"
            bgColor="rgba(16, 185, 129, 0.1)"
            trend="Currently active"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Trial Users"
            value={data.trialTenants}
            icon={<FiClock size={22} />}
            color="#FE6C05"
            bgColor="rgba(254, 108, 5, 0.1)"
            trend="On free trial"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Revenue (This Month)"
            value={`৳${data.platformRevenueThisMonth}`}
            icon={<FiTrendingUp size={22} />}
            color="#8b5cf6"
            bgColor="rgba(139, 92, 246, 0.1)"
            trend="Platform earnings"
          />
        </Grid>
      </Grid>

      {/* Quick Info Section */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #f0f0f0',
              borderRadius: 3,
              p: 3,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: '#222734', mb: 2 }}
            >
              Platform Overview
            </Typography>
            {[
              { label: 'Total Tenants', value: data.totalTenants },
              { label: 'Active Tenants', value: data.activeTenants },
              { label: 'Trial Users', value: data.trialTenants },
              {
                label: 'Inactive Tenants',
                value: data.totalTenants - data.activeTenants - data.trialTenants,
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.2,
                  borderBottom: '1px solid #f8f8f8',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: '#222734' }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #f0f0f0',
              borderRadius: 3,
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1,
              background: 'linear-gradient(135deg, #222734 0%, #374151 100%)',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(254, 108, 5, 0.2)',
                color: '#FE6C05',
                mb: 1,
              }}
            >
              <FiTrendingUp size={32} />
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#ffffff' }}
            >
              ৳{data.platformRevenueThisMonth}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Total Revenue This Month
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;