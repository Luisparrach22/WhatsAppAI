import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { AppError } from '../middlewares/error-handler.js';

export class AuthController {
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Mock login para desarrollo local si no hay Supabase configurado
      if (process.env.NODE_ENV === 'development' && email === 'operator@example.com' && password === 'password') {
        res.status(200).json({
          user: {
            id: 'mock-user-id',
            email: 'operator@example.com',
            role: 'operator',
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_in: 3600,
          },
        });
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        throw new AppError('Invalid email or password', 401);
      }

      // Obtener rol del perfil
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      res.status(200).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'operator',
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
