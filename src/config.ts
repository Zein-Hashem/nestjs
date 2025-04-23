import * as dotenv from 'dotenv'
import * as process from 'process'
import { APP } from './app.constants'

dotenv.config()
process.env.TZ = APP.DEFAULT_TIMEZONE

// the following contains the configuration loaded for the application
export const config = {
  environment: process.env.NODE_ENV || 'develop',
  port: process.env.PORT || 4000,
  bodyMaxSize: process.env.BODY_MAX_SIZE || '20mb',
  backendUrl: process.env.BACKEND_URL || 'https://api.Onex.com',
  frontendUrl: process.env.FRONTEND_URL || 'https://app.Onex.com',
  database: {
    type: process.env.DATABASE_TYPE || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || '',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' || false,
    logging: process.env.DATABASE_LOGGING === 'true' || false,
    max: process.env.DATABASE_MAX_CONNECTIONS || 100,
    ssl: process.env.DATABASE_SSL_ENABLED === 'true' || false,
    rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true' || '',
    ca: process.env.DATABASE_CA === 'true' || undefined,
    key: process.env.DATABASE_KEY === 'true' || undefined,
    cert: process.env.DATABASE_CERT === 'true' || undefined,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
  },
  s3: {
    bucketName: process.env.S3_BUCKET_NAME || '',
    region: process.env.S3_REGION || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
  auth: {
    azureAppId: process.env.AUTH_AZURE_APP_ID || '1340010d-f0b7-4cce-8eb6-93c22409c072',
    googleClientID:
      process.env.AUTH_GOOGLE_CLIENT_ID ||
      '415921804925-quod0hu8fqe4ejcfi7nmph86qcg58n9v.apps.googleusercontent.com',
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN || 'api.Onex.com',
    jwtPrivateKey: process.env.AUTH_JWT_PRIVATE_KEY,
    jwtOtpShortExpiry: Number(process.env.AUTH_JWT_OTP_SHORT_EXPIRY_SECONDS) || 180000,
    jwtExpiry: Number(process.env.AUTH_JWT_EXPIRY_SECONDS) || 86400000,
    invitationExpiry: process.env.INVITATION_EXPIRY || 14 * 24 * 3600,
  },
  mail: {
    apiKey:
      process.env.BREVO_API_KEY ||
      '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',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'youssef.jradeh@gmail.com',
    senderName: process.env.BREVO_SENDER_NAME || 'Onex',
  },
  swagger: {
    password: process.env.SWAGGER_PASS || 'swagger',
  },
  bullmq: {
    username: process.env.BULLMQ_DASHBOARD_USERNAME || 'mech_elak',
    password: process.env.BULLMQ_DASHBOARD_PASSWORD || 'za7et7e7-a7eh',
  },
}