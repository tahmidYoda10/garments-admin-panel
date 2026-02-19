// src/pages/AdminLoginPage.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import api from '../api/http';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    name: string;
    email: string;
    userType: string;
    roleName?: string;
  };
  tenant?: {
    id: number;
    shopName: string;
    shopSlug: string;
    logoPath?: string | null;
    subscriptionStatus?: string | null;
    planName?: string | null;
  } | null;
}

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('superadmin@garments-saas.com');
  const [password, setPassword] = useState('SuperAdmin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<AuthResponseData>>(
        '/api/v1/super-admin/auth/login',
        { email, password }
      );
      const data = res.data.data;
      localStorage.setItem('adminAccessToken', data.accessToken);
      localStorage.setItem('adminRefreshToken', data.refreshToken);
      localStorage.setItem('adminUserName', data.user.name);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8f9fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        // Subtle background pattern
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -120,
          right: -120,
          width: 400,
          height: 400,
          borderRadius: '50%',
          bgcolor: 'rgba(254, 108, 5, 0.06)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -100,
          left: -100,
          width: 350,
          height: 350,
          borderRadius: '50%',
          bgcolor: 'rgba(34, 39, 52, 0.04)',
        },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Brand Mark */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#222734',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 24px rgba(34,39,52,0.2)',
            }}
          >
            <Typography
              sx={{
                color: '#FE6C05',
                fontWeight: 800,
                fontSize: '1.5rem',
                lineHeight: 1,
              }}
            >
              G
            </Typography>
          </Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: '#222734', mb: 0.5 }}
          >
            Garments SaaS
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Super Admin Portal
          </Typography>
        </Box>

        {/* Login Card */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #f0f0f0',
            borderRadius: 4,
            boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: '#222734', mb: 0.5 }}
            >
              Sign In
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
              Enter your credentials to access the admin panel.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Email Address"
                  fullWidth
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiMail size={16} color="#9ca3af" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#222734',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#222734',
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FiLock size={16} color="#9ca3af" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused fieldset': {
                        borderColor: '#222734',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#222734',
                    },
                  }}
                />

                {error && (
                  <Box
                    sx={{
                      px: 2,
                      py: 1.2,
                      bgcolor: 'rgba(220,38,38,0.06)',
                      borderRadius: 2,
                      border: '1px solid rgba(220,38,38,0.15)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: '#dc2626', fontWeight: 500 }}
                    >
                      {error}
                    </Typography>
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={!loading && <FiLogIn size={16} />}
                  sx={{
                    mt: 1,
                    py: 1.3,
                    bgcolor: '#222734',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#374151',
                      boxShadow: '0 4px 16px rgba(34,39,52,0.25)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(34,39,52,0.4)',
                      color: '#fff',
                    },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 3,
            color: '#9ca3af',
          }}
        >
          Garments SaaS © {new Date().getFullYear()} — Super Admin Only
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminLoginPage;