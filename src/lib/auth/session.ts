export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

interface AdminSessionPayload {
  email: string;
  exp: number;
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXT_SUPABASE_SECRET_KEY ||
    process.env.ADMINS_SHARED_PASSWORD ||
    "we-love-chess-for-real"
  );
}

function getAllowedEmailsList(): string[] {
  const raw =
    process.env.NEXT_PUBLIC_ALLOWED_EMAILS ||
    process.env.ALLOWED_ADMIN_EMAILS ||
    "";

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function getHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedAdminEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return getAllowedEmailsList().includes(normalized);
}

export function getSharedAdminPassword(): string {
  return process.env.ADMINS_SHARED_PASSWORD || "we-love-chess-for-real";
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const payload: AdminSessionPayload = {
    email: normalizeEmail(email),
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS,
  };

  const encodedPayload = bytesToBase64Url(
    textEncoder.encode(JSON.stringify(payload))
  );

  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(encodedPayload)
  );

  const encodedSignature = bytesToBase64Url(new Uint8Array(signatureBuffer));

  return `${encodedPayload}.${encodedSignature}`;
}

export async function verifyAdminSessionToken(token: string): Promise<AdminSessionPayload | null> {
  const [encodedPayload, encodedSignature] = token.split(".");

  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const key = await getHmacKey();
  const signatureBytes = base64UrlToBytes(encodedSignature);

  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes as BufferSource,
    textEncoder.encode(encodedPayload)
  );

  if (!isValid) {
    return null;
  }

  try {
    const payloadRaw = textDecoder.decode(base64UrlToBytes(encodedPayload));
    const payload = JSON.parse(payloadRaw) as AdminSessionPayload;

    if (!payload.email || !payload.exp) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
