import { Router } from 'express';
import { 
  getLoans, 
  getLoanById, 
  requestLoan, 
  fundLoan, 
  repayLoan, 
  getCreditScore, 
  getCreditHistory 
} from '../controllers/loanController';

const router = Router();

router.get('/loans', getLoans);
router.get('/loans/:id', getLoanById);
router.post('/loans', requestLoan);
router.post('/loans/:id/fund', fundLoan);
router.post('/loans/:id/repay', repayLoan);

router.get('/credit-score/:userId', getCreditScore);
router.get('/credit-history/:userId', getCreditHistory);

export default router;
