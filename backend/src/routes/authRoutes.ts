import { Router } from 'express';
import { getUsers, getUserById, login, register } from '../controllers/authController';

const router = Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/auth/login', login);
router.post('/auth/register', register);

export default router;
