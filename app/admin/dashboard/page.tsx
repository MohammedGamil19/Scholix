'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { CONTENT_COLLECTION, CONTENT_DOC_ID, defaultContent, SiteContent } from '@/lib/content';

export default function DashboardPage() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const ref_ = doc(db, CONTENT_COLLECTION, CONTENT_DOC_ID);
      const snap = await getDoc(ref_);
      if (snap.exists()) {
        setContent({ ...defaultContent, ...(snap.data() as Partial<SiteContent>) });
      }
      setLoading(false);
    }
    load();
  }, []);

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setDoc(doc(db, CONTENT_COLLECTION, CONTENT_DOC_ID), content, { merge: true });
      toast.success('تم حفظ التغييرات بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue border-t-brand-orange" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-navy">تعديل محتوى الموقع</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-bold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
        >
          <Save size={20} />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="rounded-xl border-s-4 border-brand-blue bg-white p-6 shadow-[0_4px_20px_rgba(91,184,232,0.12)]">
        <h2 className="mb-4 text-lg font-extrabold text-brand-navy">القسم الرئيسي (Hero)</h2>
        <div className="space-y-4">
          <Field label="العنوان الرئيسي">
            <textarea
              value={content.heroHeadline}
              onChange={(e) => update('heroHeadline', e.target.value)}
              rows={2}
              className="textarea-input"
            />
          </Field>
          <Field label="العنوان الفرعي">
            <textarea
              value={content.heroSubheadline}
              onChange={(e) => update('heroSubheadline', e.target.value)}
              rows={3}
              className="textarea-input"
            />
          </Field>
          <Field label="رقم الواتس آب (مع رمز الدولة، بدون +)">
            <input
              type="text"
              value={content.whatsappNumber}
              onChange={(e) => update('whatsappNumber', e.target.value)}
              className="text-input"
              placeholder="967700000000"
            />
          </Field>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-xl border-s-4 border-brand-blue bg-white p-6 shadow-[0_4px_20px_rgba(91,184,232,0.12)]">
        <h2 className="mb-4 text-lg font-extrabold text-brand-navy">الصور</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageUrlField
            label="رابط الشعار (Logo)"
            value={content.logoUrl}
            onChange={(v) => update('logoUrl', v)}
          />
          <ImageUrlField
            label="رابط صورة القسم الرئيسي"
            value={content.heroImageUrl}
            onChange={(v) => update('heroImageUrl', v)}
          />
        </div>
        <p className="mt-3 text-xs text-gray-400">
          ألصق رابط صورة مباشر (مثل رابط من Imgur أو أي مستضيف صور آخر).
        </p>
      </section>

      {/* Pricing */}
      <section className="rounded-xl border-s-4 border-brand-blue bg-white p-6 shadow-[0_4px_20px_rgba(91,184,232,0.12)]">
        <h2 className="mb-4 text-lg font-extrabold text-brand-navy">مراحل ورسوم التقديم</h2>
        <div className="space-y-6">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="grid gap-4 sm:grid-cols-3 sm:items-end">
              <div className="sm:col-span-2">
                <Field label={`عنوان المرحلة ${n}`}>
                  <input
                    type="text"
                    value={content[`step${n}Title` as keyof SiteContent] as string}
                    onChange={(e) => update(`step${n}Title` as keyof SiteContent, e.target.value)}
                    className="text-input"
                  />
                </Field>
              </div>
              <Field label="السعر ($)">
                <input
                  type="text"
                  value={content[`step${n}Price` as keyof SiteContent] as string}
                  onChange={(e) => update(`step${n}Price` as keyof SiteContent, e.target.value)}
                  className="text-input"
                />
              </Field>
            </div>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="rounded-xl border-s-4 border-brand-blue bg-white p-6 shadow-[0_4px_20px_rgba(91,184,232,0.12)]">
        <h2 className="mb-4 text-lg font-extrabold text-brand-navy">روابط التواصل الاجتماعي</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="رابط فيسبوك">
            <input
              type="text"
              value={content.facebookUrl}
              onChange={(e) => update('facebookUrl', e.target.value)}
              className="text-input"
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="رابط انستجرام">
            <input
              type="text"
              value={content.instagramUrl}
              onChange={(e) => update('instagramUrl', e.target.value)}
              className="text-input"
              placeholder="https://instagram.com/..."
            />
          </Field>
        </div>
      </section>

      <style jsx global>{`
        .text-input,
        .textarea-input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.625rem 1rem;
          text-align: right;
        }
        .text-input:focus,
        .textarea-input:focus {
          outline: none;
          border-color: #5bb8e8;
          box-shadow: 0 0 0 2px rgba(91, 184, 232, 0.3);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-brand-navy">{label}</label>
      {children}
    </div>
  );
}

function ImageUrlField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-brand-navy">{label}</label>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-brand-cream">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="text-gray-400" size={20} />
          )}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-input"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}
