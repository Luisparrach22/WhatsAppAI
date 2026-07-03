import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validation.js';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Format email incorrect'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

router.post('/login', validate(loginSchema), AuthController.login);

export default router;
