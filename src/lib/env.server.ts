import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsedEnv.error.format(), null, 4),
  );
  // Check if we are in a build environment where we might want to skip this?
  // For now, strict validation is good for preventing runtime errors.
}

export const env = parsedEnv.success
  ? parsedEnv.data
  : (process.env as unknown as z.infer<typeof envSchema>);
