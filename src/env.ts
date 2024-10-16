import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  BASE_URL: z.string(),
  SENTRY_DSN: z.string().optional(),
})

export const env = envSchema.parse(process.env)
