import { Router } from 'express';
import { getTransactions, getFraudAlerts, getPlatformStats } from '../controllers/adminController';

const router = Router();

router.get('/admin/transactions', getTransactions);
router.get('/admin/fraud-alerts', getFraudAlerts);
router.get('/admin/stats', getPlatformStats);

export default router;
