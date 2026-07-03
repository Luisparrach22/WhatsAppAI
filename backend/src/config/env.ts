import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url().default('https://example.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('mock-service-role-key'),
  WHATSAPP_VERIFY_TOKEN: z.string().default('mock-verify-token'),
  WHATSAPP_ACCESS_TOKEN: z.string().default('mock-access-token'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().default('mock-phone-id'),
  GEMINI_API_KEY: z.string().default('mock-gemini-key'),
  N8N_TRIP_CREATED_WEBHOOK: z.string().url().optional(),
  N8N_TRIP_CONFIRMED_WEBHOOK: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
