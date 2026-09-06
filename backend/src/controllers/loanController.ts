import { Request, Response } from 'express';
import { dbService } from '../services/dbService';

export const getLoans = async (req: Request, res: Response) => {
  try {
    const { borrowerId, status } = req.query;
    const loans = await dbService.getLoans({
      borrowerId: borrowerId as string,
      status: status as string,
    });
    res.json({ success: true, data: loans });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getLoanById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const loan = await dbService.getLoanById(id);
    if (!loan) {
      return res.status(404).json({ success: false, error: { code: 'LOAN_NOT_FOUND', message: 'Loan not found' } });
    }
    res.json({ success: true, data: loan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const requestLoan = async (req: Request, res: Response) => {
  try {
    const { borrowerId, purposeCategory, purposeDescription, amountRequestedPaisa, tenureDays } = req.body;

    if (!borrowerId || !purposeCategory || !purposeDescription || !amountRequestedPaisa) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Borrower ID, purpose, and amount are required' },
      });
    }

    const newLoan = await dbService.requestLoan(borrowerId, {
      purposeCategory,
      purposeDescription,
      amountRequestedPaisa: Number(amountRequestedPaisa),
      tenureDays: Number(tenureDays) || 30,
    });

    res.status(201).json({
      success: true,
      data: newLoan,
      message: 'Emergency loan request successfully listed on marketplace',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'LOAN_REQUEST_FAILED', message: err.message } });
  }
};

export const fundLoan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { lenderId, amountPaisa } = req.body;

    if (!lenderId || !amountPaisa || amountPaisa <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Valid lender ID and amount are required' },
      });
    }

    const result = await dbService.fundLoan(id, lenderId, Number(amountPaisa));
    res.json({
      success: true,
      data: result,
      message: 'Investment confirmed. Digital loan agreement registered in ledger.',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'FUNDING_FAILED', message: err.message } });
  }
};

export const repayLoan = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { borrowerId, idempotencyKey } = req.body;

    if (!borrowerId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Borrower ID is required' },
      });
    }

    const keyToUse = idempotencyKey || `idem-repay-${id}-${Date.now()}`;
    const result = await dbService.repayLoan(id, borrowerId, keyToUse);

    res.json({
      success: true,
      data: result,
      message: 'Loan successfully repaid! Credit score upgraded and peer lenders reimbursed.',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'REPAYMENT_FAILED', message: err.message } });
  }
};

export const getCreditScore = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const score = await dbService.getCreditScore(userId);
    res.json({ success: true, data: score });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getCreditHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const history = await dbService.getCreditHistory(userId);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};
