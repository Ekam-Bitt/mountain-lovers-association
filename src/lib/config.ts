
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Process Env validation
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsedEnv.error.format(), null, 4));
    // In strict production, we might want to throw. For now, we warn.
    // If defaults are needed, handle fallback logic carefully.
}

export const config = {
    env: parsedEnv.success ? parsedEnv.data.NODE_ENV : (process.env.NODE_ENV as 'development' | 'production' | 'test' || 'development'),
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    jwt: {
        secret: process.env.JWT_SECRET || 'super-secret-dev-key-change-this-in-env-file-please',
    },
    db: {
        url: process.env.DATABASE_URL,
    }
};
