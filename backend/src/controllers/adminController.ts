import { Request, Response } from 'express';
import { dbService } from '../services/dbService';

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await dbService.getTransactions();
    res.json({ success: true, data: transactions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getFraudAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await dbService.getFraudAlerts();
    res.json({ success: true, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const [transactions, loans, users, fraudAlerts] = await Promise.all([
      dbService.getTransactions(),
      dbService.getLoans(),
      dbService.getUsers(),
      dbService.getFraudAlerts(),
    ]);

    const totalVolumePaisa = transactions
      .filter(t => t.type === 'DISBURSEMENT' || t.type === 'REPAYMENT')
      .reduce((sum, t) => sum + t.amountPaisa, 0);

    const platformReservePaisa = Math.round((totalVolumePaisa * 100) / 10000);
    const universityFundPaisa = Math.round((totalVolumePaisa * 100) / 10000);

    const stats = {
      totalVolumePaisa,
      platformReservePaisa,
      universityFundPaisa,
      totalUsers: users.length,
      activeBorrowers: users.filter(u => u.role === 'BORROWER').length,
      activeLenders: users.filter(u => u.role === 'LENDER').length,
      totalLoans: loans.length,
      activeLoansCount: loans.filter(l => l.status === 'ACTIVE').length,
      marketplaceLoansCount: loans.filter(l => ['MATCHING', 'PARTIALLY_FUNDED'].includes(l.status)).length,
      fraudAlertsCount: fraudAlerts.length,
    };

    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
