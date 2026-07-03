import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { AppError } from './error-handler.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized: Missing token', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Si estamos en entorno de desarrollo con mock token
    if (process.env.NODE_ENV === 'development' && token === 'mock-token') {
      req.user = {
        id: 'mock-user-id',
        email: 'operator@example.com',
        role: 'operator',
      };
      return next();
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Unauthorized: Invalid token', 401);
    }

    // Opcional: Obtener rol adicional desde la tabla public.users
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'operator',
    };

    next();
  } catch (err) {
    next(err);
  }
};
