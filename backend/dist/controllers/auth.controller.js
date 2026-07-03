"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const supabase_js_1 = require("../config/supabase.js");
const error_handler_js_1 = require("../middlewares/error-handler.js");
class AuthController {
    static async login(req, res, next) {
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
            const { data, error } = await supabase_js_1.supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error || !data.user || !data.session) {
                throw new error_handler_js_1.AppError('Invalid email or password', 401);
            }
            // Obtener rol del perfil
            const { data: profile } = await supabase_js_1.supabase
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
