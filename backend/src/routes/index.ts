import { Router } from 'express';
import authRoutes from './authRoutes';
import kycRoutes from './kycRoutes';
import loanRoutes from './loanRoutes';
import adminRoutes from './adminRoutes';
import { isSupabaseConfigured } from '../config/supabase';

const router = Router();

// Health & Status check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Aafno Pay API Service',
    supabaseConnected: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// Mount modules
router.use(authRoutes);
router.use(kycRoutes);
router.use(loanRoutes);
router.use(adminRoutes);

export default router;
