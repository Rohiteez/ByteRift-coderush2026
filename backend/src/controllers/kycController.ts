import { Request, Response } from 'express';
import { dbService } from '../services/dbService';

export const getKycStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const kyc = await dbService.getKyc(userId);
    res.json({ success: true, data: kyc });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { docType, docNumber, fullName, dob, frontDocUrl, backDocUrl, selfieUrl } = req.body;

    if (!docType || !docNumber || !fullName || !dob || !frontDocUrl || !selfieUrl) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'All KYC fields and documents are required' },
      });
    }

    const kyc = await dbService.submitKyc(userId, {
      docType,
      docNumber,
      fullName,
      dob,
      frontDocUrl,
      backDocUrl,
      selfieUrl,
    });

    res.status(201).json({ success: true, data: kyc, message: 'Identity KYC submitted and verified' });
  } catch (err: any) {
    const status = err.message.startsWith('DUPLICATE_IDENTITY') ? 409 : 400;
    res.status(status).json({ success: false, error: { code: 'KYC_ERROR', message: err.message } });
  }
};

export const getStudentStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const student = await dbService.getStudentVerification(userId);
    res.json({ success: true, data: student });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const submitStudentVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { universityName, studentIdNumber, faculty, enrollmentYear, expectedGraduationYear, studentCardUrl } = req.body;

    if (!universityName || !studentIdNumber || !faculty || !studentCardUrl) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'All academic details and student card image are required' },
      });
    }

    const result = await dbService.submitStudentVerification(userId, {
      universityName,
      studentIdNumber,
      faculty,
      enrollmentYear: Number(enrollmentYear) || 2022,
      expectedGraduationYear: Number(expectedGraduationYear) || 2026,
      studentCardUrl,
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Student registry confirmed! Tier 1 credit limit unlocked (NPR 4,000).',
    });
  } catch (err: any) {
    const status = err.message.startsWith('DUPLICATE_STUDENT_ID') ? 409 : 400;
    res.status(status).json({ success: false, error: { code: 'STUDENT_VERIFICATION_ERROR', message: err.message } });
  }
};
