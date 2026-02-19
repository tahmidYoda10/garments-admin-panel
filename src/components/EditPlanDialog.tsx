// src/components/EditPlanDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import api from '../api/http';
import type { ApiResponse, CreatePlanRequestPayload, SubscriptionPlan } from '../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onUpdated: () => void;
}

const EditPlanDialog: React.FC<Props> = ({ open, onClose, plan, onUpdated }) => {
  const [formData, setFormData] = useState<CreatePlanRequestPayload>({
    name: '',
    description: '',
    monthlyPrice: 0,
    durationDays: 30,
    maxProducts: undefined,
    maxStaff: undefined,
    maxBranches: undefined,
    maxStorageMb: undefined,
    advancedReports: false,
    loyaltySystem: false,
    multiBranch: false,
    apiAccess: false,
    sortOrder: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || '',
        monthlyPrice: plan.monthlyPrice,
        durationDays: plan.durationDays,
        maxProducts: plan.maxProducts ?? undefined,
        maxStaff: plan.maxStaff ?? undefined,
        maxBranches: plan.maxBranches ?? undefined,
        maxStorageMb: plan.maxStorageMb ?? undefined,
        advancedReports: plan.advancedReports,
        loyaltySystem: plan.loyaltySystem,
        multiBranch: plan.multiBranch,
        apiAccess: plan.apiAccess,
        sortOrder: plan.sortOrder,
      });
    }
  }, [plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!plan) return;
    setLoading(true);
    setError(null);
    try {
      await api.put<ApiResponse<SubscriptionPlan>>(
        `/api/v1/super-admin/plans/${plan.id}`,
        formData
      );
      onUpdated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInternal = () => {
    if (loading) return;
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseInternal} fullWidth maxWidth="md">
      <DialogTitle>Edit Plan: {plan?.name}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Plan Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Monthly Price"
              name="monthlyPrice"
              value={formData.monthlyPrice}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={2}
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Duration (Days)"
              name="durationDays"
              value={formData.durationDays}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              fullWidth
              type="number"
              label="Sort Order"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Features & Limits (Leave empty for unlimited)
            </Typography>
          </Grid>

          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Max Products"
              name="maxProducts"
              value={formData.maxProducts || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Max Staff"
              name="maxStaff"
              value={formData.maxStaff || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Max Branches"
              name="maxBranches"
              value={formData.maxBranches || ''}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.advancedReports}
                    onChange={handleChange}
                    name="advancedReports"
                  />
                }
                label="Advanced Reports"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.loyaltySystem}
                    onChange={handleChange}
                    name="loyaltySystem"
                  />
                }
                label="Loyalty System"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.multiBranch}
                    onChange={handleChange}
                    name="multiBranch"
                  />
                }
                label="Multi Branch"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.apiAccess}
                    onChange={handleChange}
                    name="apiAccess"
                  />
                }
                label="API Access"
              />
            </Box>
          </Grid>
        </Grid>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseInternal}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Update Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPlanDialog;