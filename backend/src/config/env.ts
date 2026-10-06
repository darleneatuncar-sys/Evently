import 'dotenv/config'

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: process.env.JWT_SECRET ?? 'evently-dev-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  AI_API_KEY: process.env.AI_API_KEY ?? '',
  AI_BASE_URL: process.env.AI_BASE_URL ?? 'https://api.openai.com/v1',
  AI_MODEL: process.env.AI_MODEL ?? 'gpt-4o-mini',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY ?? '',
  EMAIL_HOST: process.env.EMAIL_HOST ?? '',
  EMAIL_PORT: Number(process.env.EMAIL_PORT ?? 587),
  EMAIL_USER: process.env.EMAIL_USER ?? '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ?? '',
  EMAIL_FROM: process.env.EMAIL_FROM ?? 'Evently <no-reply@evently.com>',
}
