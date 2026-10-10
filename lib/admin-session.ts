import { createHmac, timingSafeEqual } from "crypto"

// Signed admin-PIN session cookie. The old cookie was the literal string "true",
// so anyone could forge it from the browser console. This one is an HMAC-signed
// expiry timestamp that only the server can produce.

export const ADMIN_COOKIE = "admin_pin_session"
const MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error("ADMIN_SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be set")
  return s
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex")
}

export function createAdminToken(): { value: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS
  return { value: `${exp}.${sign(String(exp))}`, maxAge: MAX_AGE_SECONDS }
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false
  const [exp, sig] = token.split(".")
  if (!exp || !sig) return false
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false
  try {
    const a = Buffer.from(sig, "hex")
    const b = Buffer.from(sign(exp), "hex")
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function pinMatches(input: string): boolean {
  const correct = process.env.ADMIN_PIN
  if (!correct) return false // no default PIN: must be configured
  const a = Buffer.from(input)
  const b = Buffer.from(correct)
  return a.length === b.length && timingSafeEqual(a, b)
}
