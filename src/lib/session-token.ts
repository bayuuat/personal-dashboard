export const SESSION_COOKIE_NAME = "pd_session";
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7;

export async function createSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE_S * 1000;
  const payload = JSON.stringify({ exp });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  const sigB64 = Buffer.from(sig).toString("base64url");
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (!payloadB64 || !sigB64) return false;
  const enc = new TextEncoder();
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
  } catch {
    return false;
  }
  let sig: BufferSource;
  try {
    sig = Buffer.from(sigB64, "base64url");
  } catch {
    return false;
  }
  const ok = await crypto.subtle.verify("HMAC", key, sig, enc.encode(payloadB64));
  if (!ok) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
