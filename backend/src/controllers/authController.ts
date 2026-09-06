import { Request, Response } from 'express';
import { dbService } from '../services/dbService';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await dbService.getUsers();
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await dbService.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Email or User ID required' } });
    }

    const users = await dbService.getUsers();
    const matched = users.find(
      u => u.email.toLowerCase() === identifier.toLowerCase() || u.id === identifier
    );

    if (!matched) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Invalid credentials' } });
    }

    res.json({ success: true, data: matched, message: 'Authentication successful' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, role } = req.body;
    if (!fullName || !email || !phone || !role) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Missing required registration fields' } });
    }

    const newUser = await dbService.createUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
    });

    res.status(201).json({ success: true, data: newUser, message: 'User registered successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'REGISTRATION_FAILED', message: err.message } });
  }
};
