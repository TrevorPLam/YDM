import { z } from 'zod';

// Environment variable schema with validation
const envSchema = z.object({
  // Database Configuration
  DATABASE_URL: z.string().url({
    message: "DATABASE_URL must be a valid URL"
  }).refine(
    (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
    { message: "DATABASE_URL must be a PostgreSQL connection string" }
  ),

  // Server Configuration
  PORT: z.string().transform(Number).pipe(
    z.number().int().positive().max(65535)
  ).default(3000),
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Authentication Configuration
  ADMIN_API_KEY: z.string().min(1, { message: "ADMIN_API_KEY is required" }),
  
  JWT_SECRET: z.string().min(32, { 
    message: "JWT_SECRET must be at least 32 characters" 
  }),

  // Email Service Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  SMTP_SECURE: z.string().transform(val => val === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_TO: z.string().email().optional(),

  // Security Configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Infer TypeScript type from schema
export type Env = z.infer<typeof envSchema>;

// Validate environment variables and return typed config
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
}

// Export validated configuration
export const config = validateEnv();

// Export derived configuration helpers
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// Export configuration object for easy consumption
export const appConfig = {
  // Server
  port: config.PORT,
  nodeEnv: config.NODE_ENV,
  isDevelopment,
  isProduction,
  isTest,
  
  // Database
  database: {
    url: config.DATABASE_URL,
  },
  
  // Authentication
  auth: {
    adminApiKey: config.ADMIN_API_KEY,
    jwtSecret: config.JWT_SECRET,
  },
  
  // Email (optional)
  email: config.SMTP_HOST ? {
    host: config.SMTP_HOST,
    port: config.SMTP_PORT || 587,
    secure: config.SMTP_SECURE || false,
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
    from: config.EMAIL_FROM,
    to: config.EMAIL_TO,
  } : null,
  
  // CORS
  cors: {
    origins: config.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  },
  
  // Logging
  logLevel: config.LOG_LEVEL,
};

// Export default for convenience
export default appConfig;
