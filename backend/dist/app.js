"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_js_1 = require("./config/env.js");
const error_handler_js_1 = require("./middlewares/error-handler.js");
// Routers
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const trips_routes_js_1 = __importDefault(require("./routes/trips.routes.js"));
const whatsapp_routes_js_1 = __importDefault(require("./routes/whatsapp.routes.js"));
const app = (0, express_1.default)();
// Middlewares globales de seguridad e información
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // En producción delimitar a los dominios del frontend
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, morgan_1.default)(env_js_1.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express_1.default.json());
// Endpoints base
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: env_js_1.env.SUPABASE_SERVICE_ROLE_KEY === 'mock-service-role-key' ? 'mocked' : 'connected',
    });
});
// Rutas de módulos
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/trips', trips_routes_js_1.default);
app.use('/api/webhooks/whatsapp', whatsapp_routes_js_1.default);
// Manejador centralizado de errores (Debe ser el último middleware cargado)
app.use(error_handler_js_1.errorHandler);
const PORT = env_js_1.env.PORT;
app.listen(PORT, () => {
    console.log(`🚀 Server running in ${env_js_1.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`👉 Webhook verify endpoint: http://localhost:${PORT}/api/webhooks/whatsapp`);
});
exports.default = app;
