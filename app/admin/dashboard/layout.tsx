'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { FileEdit, LogOut, GraduationCap, ClipboardList, FormInput } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated, logoutEmergency } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [loading, isAuthenticated, router]);

  async function handleLogout() {
    if (user) {
      await signOut(auth);
    }
    logoutEmergency();
    toast.success('تم تسجيل الخروج');
    router.replace('/admin/login');
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-brand-cream">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue border-t-brand-orange" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-brand-cream">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 start-0 flex w-64 flex-col overflow-y-auto bg-brand-navy text-white">
        <div className="flex items-center gap-2 border-b border-white/10 p-5">
          <GraduationCap className="text-brand-blue" />
          <span className="text-lg font-extrabold">Scholix - الإدارة</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-bold transition-colors ${
              pathname === '/admin/dashboard'
                ? 'bg-brand-orange text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <FileEdit size={20} />
            تعديل المحتوى
          </Link>
          <Link
            href="/admin/dashboard/applications"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-bold transition-colors ${
              pathname === '/admin/dashboard/applications'
                ? 'bg-brand-orange text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <ClipboardList size={20} />
            طلبات التقديم
          </Link>
          <Link
            href="/admin/dashboard/form-builder"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-bold transition-colors ${
              pathname === '/admin/dashboard/form-builder'
                ? 'bg-brand-orange text-white'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <FormInput size={20} />
            تعديل نموذج التقديم
          </Link>
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="ms-64 min-h-screen flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
