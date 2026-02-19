// src/components/CreateTenantDialog.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiShoppingBag,
  FiPlus,
} from 'react-icons/fi';
import api from '../api/http';

interface CreateTenantRequest {
  shopName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  businessType?: string;
}

interface CreateTenantDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateTenantDialog: React.FC<CreateTenantDialogProps> = ({ open, onClose, onCreated }) => {
  const [formData, setFormData] = useState<CreateTenantRequest>({
    shopName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    businessType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseInternal = () => {
    if (loading) return;
    setFormData({
      shopName: '',
      ownerName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      businessType: '',
    });
    setError(null);
    onClose();
  };

  // ✅ Helper function to generate slug from shop name
  const generateSlug = (shopName: string): string => {
    if (!shopName || shopName.trim() === '') {
      return 'shop-' + Date.now();
    }
    return shopName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .replace(/^-|-$/g, '')         // Remove leading/trailing hyphens
      .trim();
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.shopName ||
      !formData.ownerName ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Auto-generate shopSlug from shopName
      const shopSlug = generateSlug(formData.shopName);

      // ✅ Build the payload with all required fields
      const payload = {
        shopName: formData.shopName.trim(),
        shopSlug: shopSlug,  // ✅ This fixes the "Shop slug already exists: null" error
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address?.trim() || '',
        businessType: formData.businessType?.trim() || 'Retail',
        currency: 'BDT',  // ✅ Default currency
      };

      console.log('Creating tenant with payload:', payload);

      await api.post('/api/v1/super-admin/tenants', payload);
      
      onCreated();
      handleCloseInternal();
      
    } catch (err: unknown) {
      console.error('Error creating tenant:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseInternal}
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
            <FiPlus size={18} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734' }}>
              Create New Tenant
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Add a new shop to the platform
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Shop Name *"
            name="shopName"
            fullWidth
            size="small"
            value={formData.shopName}
            onChange={handleChange}
            placeholder="e.g., Fashion House BD"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiShoppingBag size={16} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: '#222734' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          <TextField
            label="Owner Name *"
            name="ownerName"
            fullWidth
            size="small"
            value={formData.ownerName}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiUser size={16} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: '#222734' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          <TextField
            label="Email Address *"
            name="email"
            type="email"
            fullWidth
            size="small"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g., owner@shop.com"
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
                '&.Mui-focused fieldset': { borderColor: '#222734' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          <TextField
            label="Password *"
            name="password"
            type="password"
            fullWidth
            size="small"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 6 characters"
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
                '&.Mui-focused fieldset': { borderColor: '#222734' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          <TextField
            label="Phone Number *"
            name="phone"
            fullWidth
            size="small"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., 01712345678"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiPhone size={16} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: '#222734' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          <TextField
            label="Address (Optional)"
            name="address"
            fullWidth
            size="small"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g., Dhaka, Bangladesh"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiMapPin size={16} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: '#222734' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          <TextField
            label="Business Type (Optional)"
            name="businessType"
            fullWidth
            size="small"
            value={formData.businessType}
            onChange={handleChange}
            placeholder="e.g., Garments, Retail, etc."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FiBriefcase size={16} color="#9ca3af" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused fieldset': { borderColor: '#222734' },
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          {error && (
            <Box
              sx={{
                px: 2,
                py: 1.2,
                bgcolor: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.15)',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 500 }}>
                {error}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: 'rgba(34,39,52,0.03)',
              border: '1px solid #f0f0f0',
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              💡 The tenant will be created in <strong>inactive</strong> state. You can activate
              them with a <strong style={{ color: '#FE6C05' }}>7-day free trial</strong> or paid plan afterwards.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleCloseInternal}
          disabled={loading}
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
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
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
          {loading ? 'Creating...' : 'Create Tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTenantDialog;