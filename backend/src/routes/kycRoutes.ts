import { Router } from 'express';
import { 
  getKycStatus, 
  submitKyc, 
  getStudentStatus, 
  submitStudentVerification 
} from '../controllers/kycController';

const router = Router();

router.get('/kyc/:userId', getKycStatus);
router.post('/kyc/:userId', submitKyc);

router.get('/student/:userId', getStudentStatus);
router.post('/student/:userId', submitStudentVerification);

export default router;
