export type AuthRole = 'CUSTOMER' | 'WHOLESALE' | 'ADMIN';
export type TokenType = 'access' | 'refresh';

export interface AuthPayload {
  userId: string;
  email: string;
  role: AuthRole;
  tokenType: TokenType;
  exp?: number;
  nbf?: number;
}

function getRequiredSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET') {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

export function getAccessTokenSecret() {
  return getRequiredSecret('JWT_SECRET');
}

export function getRefreshTokenSecret() {
  return getRequiredSecret('JWT_REFRESH_SECRET');
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(paddedBase64);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function parseJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
}

function isAuthRole(value: unknown): value is AuthRole {
  return value === 'CUSTOMER' || value === 'WHOLESALE' || value === 'ADMIN';
}

function isAuthPayload(value: unknown, expectedType: TokenType): value is AuthPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.userId === 'string' &&
    typeof payload.email === 'string' &&
    isAuthRole(payload.role) &&
    payload.tokenType === expectedType &&
    typeof payload.exp === 'number' &&
    (payload.nbf === undefined || typeof payload.nbf === 'number')
  );
}

export async function verifyJwtToken(
  token: string,
  secret: string,
  expectedType: TokenType,
): Promise<AuthPayload | null> {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = parseJson<{ alg?: unknown }>(encodedHeader);

    if (header.alg !== 'HS256') {
      return null;
    }

    const payload = parseJson<unknown>(encodedPayload);

    if (!isAuthPayload(payload, expectedType)) {
      return null;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (
      payload.exp === undefined ||
      payload.exp <= currentTimestamp ||
      (payload.nbf !== undefined && payload.nbf > currentTimestamp)
    ) {
      return null;
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      {
        name: 'HMAC',
        hash: 'SHA-256',
      },
      false,
      ['verify'],
    );

    const isValidSignature = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );

    return isValidSignature ? payload : null;
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string) {
  return verifyJwtToken(token, getAccessTokenSecret(), 'access');
}

export function verifyRefreshToken(token: string) {
  return verifyJwtToken(token, getRefreshTokenSecret(), 'refresh');
}
