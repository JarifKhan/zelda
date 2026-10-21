'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutAdmin } from '@/actions/auth';

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/login?redirectTo=/admin');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-neutral-700 hover:border-rose-500/40 hover:bg-neutral-800"
      title="Sign out of Admin"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Sign Out</span>
    </button>
  );
}
