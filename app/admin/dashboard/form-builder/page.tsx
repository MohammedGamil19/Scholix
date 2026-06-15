'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  ListPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import {
  FORM_CONFIG_COLLECTION,
  FORM_CONFIG_DOC_ID,
  FormSchema,
  FormStepDef,
  FormFieldDef,
  FieldType,
  FIELD_TYPE_LABELS,
  defaultFormSchema,
  genId,
} from '@/lib/formSchema';

const FIELD_TYPES: FieldType[] = ['text', 'email', 'date', 'radio', 'checkbox'];

export default function FormBuilderPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, FORM_CONFIG_COLLECTION, FORM_CONFIG_DOC_ID));
        setSchema(snap.exists() ? (snap.data() as FormSchema) : defaultFormSchema);
      } catch {
        setSchema(defaultFormSchema);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!schema) return;
    setSaving(true);
    try {
      await setDoc(doc(db, FORM_CONFIG_COLLECTION, FORM_CONFIG_DOC_ID), schema);
      toast.success('تم حفظ نموذج التقديم بنجاح');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }

  function updateSchema(updater: (prev: FormSchema) => FormSchema) {
    setSchema((prev) => (prev ? updater(prev) : prev));
  }

  function addStep() {
    updateSchema((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { id: genId('step'), title: 'قسم جديد', fields: [] },
      ],
    }));
  }

  function removeStep(stepIndex: number) {
    if (!confirm('هل تريد حذف هذا القسم وجميع أسئلته؟')) return;
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== stepIndex),
    }));
  }

  function moveStep(stepIndex: number, dir: -1 | 1) {
    updateSchema((prev) => {
      const steps = [...prev.steps];
      const target = stepIndex + dir;
      if (target < 0 || target >= steps.length) return prev;
      [steps[stepIndex], steps[target]] = [steps[target], steps[stepIndex]];
      return { ...prev, steps };
    });
  }

  function updateStep(stepIndex: number, patch: Partial<FormStepDef>) {
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === stepIndex ? { ...s, ...patch } : s)),
    }));
  }

  function addField(stepIndex: number) {
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) =>
        i === stepIndex
          ? {
              ...s,
              fields: [
                ...s.fields,
                {
                  id: genId('field'),
                  label: 'سؤال جديد',
                  type: 'text',
                  required: false,
                },
              ],
            }
          : s
      ),
    }));
  }

  function removeField(stepIndex: number, fieldIndex: number) {
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) =>
        i === stepIndex ? { ...s, fields: s.fields.filter((_, fi) => fi !== fieldIndex) } : s
      ),
    }));
  }

  function moveField(stepIndex: number, fieldIndex: number, dir: -1 | 1) {
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => {
        if (i !== stepIndex) return s;
        const fields = [...s.fields];
        const target = fieldIndex + dir;
        if (target < 0 || target >= fields.length) return s;
        [fields[fieldIndex], fields[target]] = [fields[target], fields[fieldIndex]];
        return { ...s, fields };
      }),
    }));
  }

  function updateField(stepIndex: number, fieldIndex: number, patch: Partial<FormFieldDef>) {
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) =>
        i === stepIndex
          ? {
              ...s,
              fields: s.fields.map((f, fi) => (fi === fieldIndex ? { ...f, ...patch } : f)),
            }
          : s
      ),
    }));
  }

  function addOption(stepIndex: number, fieldIndex: number) {
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) =>
        i === stepIndex
          ? {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi === fieldIndex ? { ...f, options: [...(f.options ?? []), 'خيار جديد'] } : f
              ),
            }
          : s
      ),
    }));
  }

  function updateOption(stepIndex: number, fieldIndex: number, optionIndex: number, value: string) {
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) =>
        i === stepIndex
          ? {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi === fieldIndex
                  ? {
                      ...f,
                      options: (f.options ?? []).map((o, oi) => (oi === optionIndex ? value : o)),
                    }
                  : f
              ),
            }
          : s
      ),
    }));
  }

  function removeOption(stepIndex: number, fieldIndex: number, optionIndex: number) {
    updateSchema((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) =>
        i === stepIndex
          ? {
              ...s,
              fields: s.fields.map((f, fi) =>
                fi === fieldIndex
                  ? { ...f, options: (f.options ?? []).filter((_, oi) => oi !== optionIndex) }
                  : f
              ),
            }
          : s
      ),
    }));
  }

  if (loading || !schema) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue border-t-brand-orange" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-navy">تعديل نموذج التقديم</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-bold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
        >
          <Save size={20} />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* Form title */}
      <section className="rounded-xl border-s-4 border-brand-blue bg-white p-6 shadow-[0_4px_20px_rgba(91,184,232,0.12)]">
        <label className="mb-2 block text-sm font-bold text-brand-navy">عنوان النموذج</label>
        <input
          type="text"
          value={schema.formTitle}
          onChange={(e) => updateSchema((prev) => ({ ...prev, formTitle: e.target.value }))}
          className="text-input"
        />
      </section>

      {/* Steps */}
      {schema.steps.map((step, stepIndex) => (
        <section
          key={step.id}
          className="rounded-xl border-s-4 border-brand-blue bg-white p-6 shadow-[0_4px_20px_rgba(91,184,232,0.12)]"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange text-sm font-extrabold text-white">
              {stepIndex + 1}
            </span>
            <input
              type="text"
              value={step.title}
              onChange={(e) => updateStep(stepIndex, { title: e.target.value })}
              className="text-input flex-1 font-bold"
              placeholder="عنوان القسم"
            />
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => moveStep(stepIndex, -1)}
                disabled={stepIndex === 0}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-navy disabled:opacity-30"
                title="نقل لأعلى"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => moveStep(stepIndex, 1)}
                disabled={stepIndex === schema.steps.length - 1}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-navy disabled:opacity-30"
                title="نقل لأسفل"
              >
                <ChevronDown size={18} />
              </button>
              <button
                onClick={() => removeStep(stepIndex)}
                className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                title="حذف القسم"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {step.fields.map((field, fieldIndex) => (
              <div key={field.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <GripVertical size={18} className="mt-2 hidden shrink-0 text-gray-300 sm:block" />
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(stepIndex, fieldIndex, { label: e.target.value })}
                      className="text-input"
                      placeholder="نص السؤال"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(stepIndex, fieldIndex, { type: e.target.value as FieldType })
                        }
                        className="text-input w-auto"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {FIELD_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            updateField(stepIndex, fieldIndex, { required: e.target.checked })
                          }
                          className="h-4 w-4 accent-brand-orange"
                        />
                        إجباري
                      </label>
                      {(field.type === 'radio' || field.type === 'checkbox') && (
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            type="checkbox"
                            checked={field.allowOther ?? false}
                            onChange={(e) =>
                              updateField(stepIndex, fieldIndex, { allowOther: e.target.checked })
                            }
                            className="h-4 w-4 accent-brand-orange"
                          />
                          إضافة خيار &quot;أخرى&quot;
                        </label>
                      )}
                    </div>

                    {(field.type === 'radio' || field.type === 'checkbox') && (
                      <div className="space-y-2 rounded-lg bg-brand-cream/60 p-3">
                        <p className="text-xs font-bold text-gray-500">الخيارات</p>
                        {(field.options ?? []).map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                updateOption(stepIndex, fieldIndex, optIndex, e.target.value)
                              }
                              className="text-input flex-1 bg-white"
                            />
                            <button
                              onClick={() => removeOption(stepIndex, fieldIndex, optIndex)}
                              className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="حذف الخيار"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(stepIndex, fieldIndex)}
                          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold text-brand-blue transition-colors hover:bg-white"
                        >
                          <Plus size={16} />
                          إضافة خيار
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-1 sm:flex-col">
                    <button
                      onClick={() => moveField(stepIndex, fieldIndex, -1)}
                      disabled={fieldIndex === 0}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-navy disabled:opacity-30"
                      title="نقل لأعلى"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      onClick={() => moveField(stepIndex, fieldIndex, 1)}
                      disabled={fieldIndex === step.fields.length - 1}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-navy disabled:opacity-30"
                      title="نقل لأسفل"
                    >
                      <ChevronDown size={18} />
                    </button>
                    <button
                      onClick={() => removeField(stepIndex, fieldIndex)}
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="حذف السؤال"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => addField(stepIndex)}
            className="mt-4 flex items-center gap-2 rounded-lg border-2 border-dashed border-brand-blue px-4 py-2.5 text-sm font-bold text-brand-blue transition-colors hover:bg-brand-cream"
          >
            <ListPlus size={18} />
            إضافة سؤال
          </button>
        </section>
      ))}

      <button
        onClick={addStep}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-orange px-4 py-4 font-bold text-brand-orange transition-colors hover:bg-brand-cream"
      >
        <Plus size={20} />
        إضافة قسم جديد
      </button>

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
