import { jwtVerify, SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-key-change-in-production');
const ALGORITHM = 'HS256';

export interface JWTPayload {
  userId: number;
  tenantId: number;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  iat: number;
  exp: number;
}

export async function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  return token;
}

export async function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  return parts[1];
}
