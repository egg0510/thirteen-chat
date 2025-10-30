require('dotenv').config();
const { z } = require('zod');

const EnvSchema = z.object({
  PORT: z.string().default('8787'),
  // 默认放开 CORS（生产同源访问不被误拦，可按需在环境变量收紧）
  CORS_ORIGINS: z.string().default('*'),
  MODEL_ENDPOINT: z.string().url().optional(),
  MODEL_NAME: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  LOG_LEVEL: z.string().default('info')
});

const env = EnvSchema.parse(process.env);
module.exports = { env };