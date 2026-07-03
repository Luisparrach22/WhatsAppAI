"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('4000').transform(Number),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    SUPABASE_URL: zod_1.z.string().url().default('https://example.supabase.co'),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().default('mock-service-role-key'),
    WHATSAPP_VERIFY_TOKEN: zod_1.z.string().default('mock-verify-token'),
    WHATSAPP_ACCESS_TOKEN: zod_1.z.string().default('mock-access-token'),
    WHATSAPP_PHONE_NUMBER_ID: zod_1.z.string().default('mock-phone-id'),
    GEMINI_API_KEY: zod_1.z.string().default('mock-gemini-key'),
    N8N_TRIP_CREATED_WEBHOOK: zod_1.z.string().url().optional(),
    N8N_TRIP_CONFIRMED_WEBHOOK: zod_1.z.string().url().optional(),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}
exports.env = parsedEnv.data;
