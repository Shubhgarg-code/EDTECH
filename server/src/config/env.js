import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  // JWT secret – mandatory in production, must be ≥32 chars and contain letters+numbers
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // Razorpay credentials – optional but must come from env in production
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  // Storage driver – local (dev), b2 (Backblaze B2), or r2 (Cloudflare R2)
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
  // Backblaze B2 Configuration
  B2_KEY_ID: process.env.B2_KEY_ID,
  B2_APPLICATION_KEY: process.env.B2_APPLICATION_KEY,
  B2_BUCKET_NAME: process.env.B2_BUCKET_NAME,
  B2_ENDPOINT: process.env.B2_ENDPOINT,
  B2_REGION: process.env.B2_REGION,
  // Cloudflare R2 Configuration
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

// ----- Production validation -----
if (ENV.NODE_ENV === 'production') {
  if (!ENV.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET is required in production');
  }
  const strengthRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{32,}$/;
  if (!strengthRegex.test(ENV.JWT_SECRET)) {
    throw new Error('FATAL: JWT_SECRET is too weak (must be ≥32 chars with letters & numbers)');
  }
  if (!ENV.MONGODB_URI) {
    throw new Error('FATAL: MONGODB_URI is required in production');
  }

  // Backblaze B2 storage validation in production
  if (ENV.STORAGE_DRIVER === 'b2') {
    const missing = [];
    if (!process.env.B2_KEY_ID) missing.push('B2_KEY_ID');
    if (!process.env.B2_APPLICATION_KEY) missing.push('B2_APPLICATION_KEY');
    if (!process.env.B2_BUCKET_NAME) missing.push('B2_BUCKET_NAME');
    if (!process.env.B2_ENDPOINT) missing.push('B2_ENDPOINT');
    if (!process.env.B2_REGION) missing.push('B2_REGION');
    if (missing.length) {
      throw new Error(`FATAL: Missing required Backblaze B2 env vars in production: ${missing.join(', ')}`);
    }
  }

  // Cloudflare R2 storage validation in production
  if (ENV.STORAGE_DRIVER === 'r2') {
    const missing = [];
    if (!process.env.R2_ACCOUNT_ID) missing.push('R2_ACCOUNT_ID');
    if (!process.env.R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
    if (!process.env.R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');
    if (!process.env.R2_BUCKET_NAME) missing.push('R2_BUCKET_NAME');
    if (missing.length) {
      throw new Error(`FATAL: Missing required R2 env vars in production: ${missing.join(', ')}`);
    }
  }
}
