'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  MessageCircle,
  FileCheck2,
  UserCheck,
  GraduationCap,
  Wallet,
  Landmark,
  ArrowLeftRight,
  Smartphone,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { CONTENT_COLLECTION, CONTENT_DOC_ID, defaultContent, SiteContent } from '@/lib/content';
import { FacebookIcon, InstagramIcon, WhatsappIcon } from '@/components/SocialIcons';

function waLink(number: string, text?: string) {
  const clean = number.replace(/[^0-9]/g, '');
  const base = `https://wa.me/${clean}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export default function Home() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, CONTENT_COLLECTION, CONTENT_DOC_ID);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setContent({ ...defaultContent, ...(snap.data() as Partial<SiteContent>) });
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-blue border-t-brand-orange" />
        <p className="text-brand-navy font-semibold">جاري تحميل الموقع...</p>
      </div>
    );
  }

  const steps = [
    { icon: FileCheck2, title: content.step1Title, price: content.step1Price },
    { icon: UserCheck, title: content.step2Title, price: content.step2Price },
    { icon: GraduationCap, title: content.step3Title, price: content.step3Price },
  ];

  const paymentMethods = [
    { icon: Wallet, title: 'باي بال', desc: 'PayPal' },
    { icon: Landmark, title: 'مصرف الكريمي', desc: 'الكريمي إكسبرس' },
    { icon: ArrowLeftRight, title: 'شبكات الصرافة المحلية', desc: 'النجم - الامتياز' },
    { icon: Smartphone, title: 'المحافظ الإلكترونية', desc: 'جوالي - فلوسك' },
  ];

  return (
    <>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-brand-navy shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {content.logoUrl ? (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={content.logoUrl}
                  alt="Scholix"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-lg font-bold text-brand-navy">
                S
              </div>
            )}
            <span className="text-xl font-extrabold text-white">Scholix</span>
          </div>
          <a
            href={waLink(content.whatsappNumber, 'مرحباً، أرغب بالاستفسار عن خدمات Scholix')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-brand-orange px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-orange-dark sm:text-base"
          >
            تواصل معنا
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-10 px-4 py-12 md:flex-row md:py-20">
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl font-extrabold leading-tight text-brand-navy md:text-5xl">
              {content.heroHeadline}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-gray-600 md:text-lg">
              {content.heroSubheadline}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
              <Link
                href="/apply"
                className="inline-flex animate-pulse-orange items-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-brand-orange-dark"
              >
                ابدأ رحلتك الآن
              </Link>
              <a
                href={waLink(content.whatsappNumber, 'مرحباً، أرغب ببدء رحلتي مع Scholix')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand-blue px-8 py-4 text-lg font-bold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
              >
                تواصل معنا
              </a>
            </div>
          </div>
          <div className="flex-1">
            {content.heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.heroImageUrl}
                alt="Scholix"
                className="mx-auto w-full max-w-md rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="mx-auto flex h-64 w-full max-w-md items-center justify-center rounded-2xl bg-brand-blue/20 text-brand-navy md:h-80">
                <GraduationCap size={72} />
              </div>
            )}
          </div>
        </section>

        {/* How to Apply */}
        <section className="bg-white py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-extrabold text-brand-navy md:text-3xl">
              كيفية التقديم
            </h2>
            <p className="mt-4 text-base text-gray-600 md:text-lg">
              يتم إرسال جميع الملفات إلى رقم الواتس آب
            </p>
            <a
              href={waLink(content.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-3 rounded-full border-2 border-brand-blue px-8 py-4 text-lg font-bold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
            >
              <MessageCircle size={28} />
              تواصل عبر واتس آب
            </a>
          </div>
        </section>

        {/* Pricing & Phases */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-extrabold text-brand-navy md:text-3xl">
              مراحل ورسوم التقديم
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={i}
                    className="relative rounded-xl border-s-4 border-brand-blue bg-white p-6 shadow-[0_4px_20px_rgba(91,184,232,0.12)] transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-lg font-extrabold text-white">
                        {i + 1}
                      </div>
                      <Icon className="text-brand-blue" size={32} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-brand-navy">{step.title}</h3>
                    <p className="mt-4 text-2xl font-extrabold text-brand-orange">
                      ${step.price}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-extrabold text-brand-navy md:text-3xl">
              طرق الدفع المتاحة
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {paymentMethods.map((method, i) => {
                const Icon = method.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-3 rounded-xl border-t-4 border-brand-blue bg-brand-cream p-6 text-center shadow-[0_4px_20px_rgba(91,184,232,0.12)] transition-transform hover:-translate-y-1"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/20 text-brand-navy">
                      <Icon size={28} />
                    </div>
                    <h3 className="font-bold text-brand-navy">{method.title}</h3>
                    <p className="text-sm text-gray-500">{method.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center">
          <div className="flex items-center gap-2 text-xl font-extrabold">
            <GraduationCap className="text-brand-blue" />
            Scholix
          </div>
          <div className="flex gap-4">
            {content.facebookUrl && (
              <a
                href={content.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 transition-colors hover:text-brand-orange"
              >
                <FacebookIcon size={22} />
              </a>
            )}
            {content.instagramUrl && (
              <a
                href={content.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 transition-colors hover:text-brand-orange"
              >
                <InstagramIcon size={22} />
              </a>
            )}
            <a
              href={waLink(content.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 transition-colors hover:text-brand-orange"
            >
              <WhatsappIcon size={22} />
            </a>
          </div>
          <p className="text-sm text-white/60">Scholix © 2026 - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </>
  );
}
