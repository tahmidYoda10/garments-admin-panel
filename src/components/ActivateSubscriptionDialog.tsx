// src/components/ActivateSubscriptionDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import api from '../api/http';
import type {
  ActivateSubscriptionRequestPayload,
  ApiResponse,
  Subscription,
  SubscriptionPlan,
} from '../types/api';

interface Props {
  open: boolean;
  onClose: () => void;
  tenantId: number;
  shopName: string;
  onActivated?: (subscription: Subscription) => void;
}

const paymentMethods = [
  'CASH',
  'BKASH',
  'NAGAD',
  'BANK_TRANSFER',
  'CARD',
  'OTHER',
];

const ActivateSubscriptionDialog: React.FC<Props> = ({
  open,
  onClose,
  tenantId,
  shopName,
  onActivated,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [planId, setPlanId] = useState<number | ''>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [transactionId, setTransactionId] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    api
      .get<ApiResponse<SubscriptionPlan[]>>('/api/v1/super-admin/plans')
      .then((res) => setPlans(res.data.data))
      .catch(() => setError('Failed to load plans'));
  }, [open]);

  const handleSubmit = async () => {
    if (!planId || !amount) {
      setError('Plan and amount are required');
      return;
    }
    const req: ActivateSubscriptionRequestPayload = {
      tenantId,
      planId: Number(planId),
      paymentAmount: Number(amount),
      paymentMethod,
      transactionId: transactionId || undefined,
      referenceNote: referenceNote || undefined,
    };
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<ApiResponse<Subscription>>(
        '/api/v1/super-admin/subscriptions/activate',
        req
      );
      if (onActivated) onActivated(res.data.data);
      handleCloseInternal();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'Failed to activate subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInternal = () => {
    if (loading) return;
    setPlanId('');
    setAmount('');
    setPaymentMethod('CASH');
    setTransactionId('');
    setReferenceNote('');
    setError(null);
    onClose();
  };

  const selectedPlan = plans.find((p) => p.id === planId);

  return (
    <Dialog
      open={open}
      onClose={handleCloseInternal}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#222734' }}>
          Activate Paid Subscription
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
          Shop:{' '}
          <strong style={{ color: '#FE6C05' }}>{shopName}</strong>
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Plan Select */}
          <TextField
            select
            label="Select Plan"
            fullWidth
            size="small"
            value={planId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setPlanId(id);
              const selected = plans.find((p) => p.id === id);
              if (selected) setAmount(String(selected.monthlyPrice));
            }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#222734',
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          >
            {plans.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#222734' }}>
                    {p.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    ৳{p.monthlyPrice} · {p.durationDays} days
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Plan Info Preview */}
          {selectedPlan && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'rgba(254,108,5,0.05)',
                border: '1px solid rgba(254,108,5,0.15)',
                borderRadius: 2,
                display: 'flex',
                gap: 3,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Duration
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#222734' }}>
                  {selectedPlan.durationDays} days
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Price
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#FE6C05' }}>
                  ৳{selectedPlan.monthlyPrice}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Payment Amount */}
          <TextField
            label="Payment Amount (৳)"
            fullWidth
            size="small"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#222734',
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          {/* Payment Method */}
          <TextField
            select
            label="Payment Method"
            fullWidth
            size="small"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#222734',
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          >
            {paymentMethods.map((m) => (
              <MenuItem key={m} value={m}>
                {m.replace('_', ' ')}
              </MenuItem>
            ))}
          </TextField>

          {/* Transaction ID */}
          <TextField
            label="Transaction ID (optional)"
            fullWidth
            size="small"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#222734',
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          {/* Reference Note */}
          <TextField
            label="Reference Note (optional)"
            fullWidth
            size="small"
            multiline
            minRows={2}
            value={referenceNote}
            onChange={(e) => setReferenceNote(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#222734',
              },
              '& .MuiInputLabel-root.Mui-focused': { color: '#222734' },
            }}
          />

          {/* Error */}
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
          {loading ? 'Activating...' : 'Activate Subscription'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivateSubscriptionDialog;