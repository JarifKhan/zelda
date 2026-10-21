let isOnline: boolean | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 15000; // Cache connection status for 15 seconds

export async function isSupabaseAvailable(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    url.includes('placeholder-url') ||
    url.includes('your-project') ||
    !anonKey ||
    anonKey.includes('placeholder-anon-key')
  ) {
    return false;
  }

  const now = Date.now();
  if (isOnline !== null && now - lastCheckTime < CACHE_TTL_MS) {
    return isOnline;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600); // 600ms quick check

    const res = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    // Supabase REST endpoint returns 200 or swagger json if alive
    isOnline = res.ok || res.status < 500;
  } catch {
    isOnline = false;
  }

  lastCheckTime = now;
  return isOnline;
}
