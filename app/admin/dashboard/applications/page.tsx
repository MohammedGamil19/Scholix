'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  ChevronDown,
  Trash2,
  Mail,
  Phone,
  CheckCircle2,
  Circle,
  User,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { Field, RadioGroup, CheckboxGroup } from '@/components/FormFields';
import { APPLICATIONS_COLLECTION } from '@/lib/applications';
import { FormAnswers, FormSchema, defaultFormSchema } from '@/lib/formSchema';

interface ApplicationDoc {
  id: string;
  createdAt?: Timestamp;
  status?: 'new' | 'contacted';
  formSchema?: FormSchema;
  [key: string]: unknown;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<FormAnswers | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setApplications(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ApplicationDoc, 'id'>) }))
        );
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  function getSchema(app: ApplicationDoc): FormSchema {
    return app.formSchema ?? defaultFormSchema;
  }

  async function toggleStatus(app: ApplicationDoc) {
    const newStatus = app.status === 'contacted' ? 'new' : 'contacted';
    try {
      await updateDoc(doc(db, APPLICATIONS_COLLECTION, app.id), { status: newStatus });
    } catch {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await deleteDoc(doc(db, APPLICATIONS_COLLECTION, id));
      toast.success('تم حذف الطلب');
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  }

  function startEdit(app: ApplicationDoc) {
    const schema = getSchema(app);
    const data: FormAnswers = {};
    for (const step of schema.steps) {
      for (const field of step.fields) {
        const value = app[field.id];
        data[field.id] = field.type === 'checkbox' ? ((value as string[]) ?? []) : ((value as string) ?? '');
        if (field.allowOther) {
          data[`${field.id}_other`] = (app[`${field.id}_other`] as string) ?? '';
        }
      }
    }
    setEditingId(app.id);
    setEditData(data);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditData(null);
  }

  function updateEdit(fieldId: string, value: string | string[]) {
    setEditData((prev) => (prev ? { ...prev, [fieldId]: value } : prev));
  }

  function toggleEditCheckbox(fieldId: string, value: string) {
    setEditData((prev) => {
      if (!prev) return prev;
      const arr = (prev[fieldId] as string[]) ?? [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [fieldId]: next };
    });
  }

  async function saveEdit(id: string) {
    if (!editData) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, APPLICATIONS_COLLECTION, id), { ...editData });
      toast.success('تم حفظ التعديلات');
      setEditingId(null);
      setEditData(null);
    } catch {
      toast.error('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  }

  function formatDate(ts?: Timestamp) {
    if (!ts) return '-';
    return ts.toDate().toLocaleString('ar', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function displayName(app: ApplicationDoc): string {
    const schema = getSchema(app);
    const nameField = schema.steps[0]?.fields[0];
    const value = nameField ? app[nameField.id] : undefined;
    return (typeof value === 'string' && value) || 'بدون اسم';
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue border-t-brand-orange" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-navy">طلبات التقديم</h1>
        <span className="rounded-full bg-brand-blue/20 px-4 py-1.5 text-sm font-bold text-brand-navy">
          {applications.length} طلب
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border-s-4 border-brand-blue bg-white p-10 text-center text-gray-500 shadow-[0_4px_20px_rgba(91,184,232,0.12)]">
          لا توجد طلبات تقديم حتى الآن.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isOpen = expandedId === app.id;
            const isEditing = editingId === app.id;
            const isContacted = app.status === 'contacted';
            const schema = getSchema(app);

            const email = app.email as string | undefined;
            const whatsapp = app.whatsapp as string | undefined;

            return (
              <div
                key={app.id}
                className="overflow-hidden rounded-xl border-s-4 border-brand-blue bg-white shadow-[0_4px_20px_rgba(91,184,232,0.12)]"
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : app.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-right transition-colors hover:bg-brand-cream"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-blue">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy">{displayName(app)}</p>
                      <p className="text-xs text-gray-500">{formatDate(app.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`hidden rounded-full px-3 py-1 text-xs font-bold sm:inline-block ${
                        isContacted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-brand-orange/15 text-brand-orange-dark'
                      }`}
                    >
                      {isContacted ? 'تم التواصل' : 'جديد'}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-brand-blue transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Details */}
                {isOpen && (
                  <div className="border-t border-gray-100 p-5">
                    {isEditing && editData ? (
                      <div className="space-y-4">
                        {schema.steps.map((stepDef) => (
                          <div key={stepDef.id} className="space-y-4">
                            <h3 className="text-sm font-extrabold text-brand-navy">{stepDef.title}</h3>
                            {stepDef.fields.map((field) => (
                              <Field key={field.id} label={field.label}>
                                {(field.type === 'text' || field.type === 'email' || field.type === 'date') && (
                                  <input
                                    type={field.type}
                                    value={(editData[field.id] as string) ?? ''}
                                    onChange={(e) => updateEdit(field.id, e.target.value)}
                                    className="text-input"
                                  />
                                )}
                                {field.type === 'radio' && (
                                  <RadioGroup
                                    name={`${field.id}-${app.id}`}
                                    options={field.options ?? []}
                                    value={(editData[field.id] as string) ?? ''}
                                    onChange={(v) => updateEdit(field.id, v)}
                                  />
                                )}
                                {field.type === 'checkbox' && (
                                  <>
                                    <CheckboxGroup
                                      options={field.options ?? []}
                                      values={(editData[field.id] as string[]) ?? []}
                                      onToggle={(v) => toggleEditCheckbox(field.id, v)}
                                    />
                                    {field.allowOther && (
                                      <div className="mt-2 flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`${field.id}-other-${app.id}`}
                                          checked={((editData[field.id] as string[]) ?? []).includes('أخرى')}
                                          onChange={() => toggleEditCheckbox(field.id, 'أخرى')}
                                          className="h-4 w-4 accent-brand-orange"
                                        />
                                        <label
                                          htmlFor={`${field.id}-other-${app.id}`}
                                          className="text-sm text-gray-700"
                                        >
                                          أخرى:
                                        </label>
                                        <input
                                          type="text"
                                          value={(editData[`${field.id}_other`] as string) ?? ''}
                                          onChange={(e) => updateEdit(`${field.id}_other`, e.target.value)}
                                          className="text-input flex-1"
                                          placeholder="اكتب الإجابة"
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                              </Field>
                            ))}
                          </div>
                        ))}

                        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                          <button
                            onClick={() => saveEdit(app.id)}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-full bg-brand-orange px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
                          >
                            <Save size={16} />
                            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-200"
                          >
                            <X size={16} />
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {schema.steps.flatMap((stepDef) =>
                            stepDef.fields.map((field) => {
                              const value = app[field.id];
                              let display: string;
                              if (field.type === 'checkbox') {
                                const arr = Array.isArray(value) ? (value as string[]) : [];
                                const other = app[`${field.id}_other`] as string | undefined;
                                display = [...arr, other].filter(Boolean).join('، ');
                              } else {
                                display = typeof value === 'string' ? value : '';
                              }

                              if (field.id === 'email') {
                                return (
                                  <DetailItem
                                    key={field.id}
                                    label={field.label}
                                    value={display}
                                    icon={<Mail size={14} />}
                                    href={email ? `mailto:${email}` : undefined}
                                  />
                                );
                              }
                              if (field.id === 'whatsapp') {
                                return (
                                  <DetailItem
                                    key={field.id}
                                    label={field.label}
                                    value={display}
                                    icon={<Phone size={14} />}
                                    href={
                                      whatsapp
                                        ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`
                                        : undefined
                                    }
                                  />
                                );
                              }
                              return (
                                <DetailItem
                                  key={field.id}
                                  label={field.label}
                                  value={display}
                                  full={field.type === 'checkbox'}
                                />
                              );
                            })
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                          <button
                            onClick={() => startEdit(app)}
                            className="flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-navy/90"
                          >
                            <Pencil size={16} />
                            تعديل
                          </button>
                          <button
                            onClick={() => toggleStatus(app)}
                            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                              isContacted
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-brand-blue text-white hover:bg-brand-navy'
                            }`}
                          >
                            {isContacted ? <Circle size={16} /> : <CheckCircle2 size={16} />}
                            {isContacted ? 'تحديد كجديد' : 'تحديد كتم التواصل'}
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="flex items-center gap-2 rounded-full bg-red-50 px-5 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                            حذف الطلب
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        .text-input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.625rem 1rem;
          text-align: right;
        }
        .text-input:focus {
          outline: none;
          border-color: #5bb8e8;
          box-shadow: 0 0 0 2px rgba(91, 184, 232, 0.3);
        }
      `}</style>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
  href,
  full,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  href?: string;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <p className="mb-1 text-xs font-bold text-gray-400">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-medium text-brand-blue hover:underline"
        >
          {icon}
          {value || '-'}
        </a>
      ) : (
        <p className="font-medium text-brand-navy">{value || '-'}</p>
      )}
    </div>
  );
}
