"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const supabase_js_1 = require("../config/supabase.js");
const error_handler_js_1 = require("./error-handler.js");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_handler_js_1.AppError('Unauthorized: Missing token', 401);
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
        const { data: { user }, error } = await supabase_js_1.supabase.auth.getUser(token);
        if (error || !user) {
            throw new error_handler_js_1.AppError('Unauthorized: Invalid token', 401);
        }
        // Opcional: Obtener rol adicional desde la tabla public.users
        const { data: profile } = await supabase_js_1.supabase
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
    }
    catch (err) {
        next(err);
    }
};
exports.authenticate = authenticate;
