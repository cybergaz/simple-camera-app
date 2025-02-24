import express from 'express';
import { signIn, signUp } from '../controllers/authControllers';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);

export { router as authRoutes };
