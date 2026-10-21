'use server';

import { cookies } from 'next/headers';

export async function loginDemoAdmin() {
  const cookieStore = await cookies();
  cookieStore.set('zelda_admin_session', 'true', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  });
  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('zelda_admin_session');
  return { success: true };
}
