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
  // Storage driver – local (dev) or r2 (production)
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
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
  // R2 storage validation – abort if any credential missing
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
