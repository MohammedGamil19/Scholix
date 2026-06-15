'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LogIn, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { EMERGENCY_EMAIL, EMERGENCY_PASSWORD } from '@/lib/emergencyAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, loginEmergency } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    if (email === EMERGENCY_EMAIL && password === EMERGENCY_PASSWORD) {
      loginEmergency();
      toast.success('تم تسجيل الدخول بنجاح');
      router.replace('/admin/dashboard');
      setSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('تم تسجيل الدخول بنجاح');
      router.replace('/admin/dashboard');
    } catch {
      toast.error('بيانات الدخول غير صحيحة');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-brand-cream px-4">
      <div className="w-full max-w-md rounded-2xl border-t-4 border-brand-blue bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy text-brand-blue">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-navy">تسجيل دخول الإدارة</h1>
          <p className="text-sm text-gray-500">لوحة تحكم Scholix</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-brand-navy">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-right focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="admin@scholix.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-brand-navy">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-right focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-orange px-4 py-3 font-bold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
          >
            <LogIn size={20} />
            {submitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
