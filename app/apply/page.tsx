'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, ArrowLeft, Send, CheckCircle2, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { Field, RadioGroup, CheckboxGroup } from '@/components/FormFields';
import { APPLICATIONS_COLLECTION } from '@/lib/applications';
import {
  FORM_CONFIG_COLLECTION,
  FORM_CONFIG_DOC_ID,
  FormSchema,
  FormAnswers,
  defaultFormSchema,
  emptyAnswers,
  isFieldAnswered,
} from '@/lib/formSchema';

export default function ApplyPage() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, FORM_CONFIG_COLLECTION, FORM_CONFIG_DOC_ID));
        const loaded = snap.exists() ? (snap.data() as FormSchema) : defaultFormSchema;
        setSchema(loaded);
        setAnswers(emptyAnswers(loaded));
      } catch {
        setSchema(defaultFormSchema);
        setAnswers(emptyAnswers(defaultFormSchema));
      }
    }
    load();
  }, []);

  if (!schema) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-blue border-t-brand-orange" />
      </div>
    );
  }

  const totalSteps = schema.steps.length;
  const currentStep = schema.steps[step - 1];

  function updateValue(fieldId: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  }

  function toggleCheckbox(fieldId: string, value: string) {
    setAnswers((prev) => {
      const arr = (prev[fieldId] as string[]) ?? [];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [fieldId]: next };
    });
  }

  function isStepValid(): boolean {
    return currentStep.fields
      .filter((f) => f.required)
      .every((f) => isFieldAnswered(f, answers));
  }

  function handleNext() {
    if (!isStepValid()) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isStepValid()) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, APPLICATIONS_COLLECTION), {
        ...answers,
        formSchema: schema,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch {
      toast.error('حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <CheckCircle2 size={64} className="text-brand-blue" />
        <h1 className="text-2xl font-extrabold text-brand-navy md:text-3xl">
          تم إرسال طلبك بنجاح!
        </h1>
        <p className="max-w-md text-gray-600">
          شكراً لتعبئة النموذج. سيقوم فريق Scholix بمراجعة بياناتك والتواصل معك في أقرب وقت عبر
          الواتس آب أو البريد الإلكتروني.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-full bg-brand-orange px-8 py-3 font-bold text-white transition-colors hover:bg-brand-orange-dark"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy text-brand-blue">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-xl font-extrabold text-brand-navy md:text-2xl">{schema.formTitle}</h1>
          <p className="text-sm text-gray-500">Scholix - نموذج التقديم</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-brand-orange transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm font-bold text-brand-navy">
            الخطوة {step} من {totalSteps}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border-s-4 border-brand-blue bg-white p-6 shadow-[0_4px_20px_rgba(91,184,232,0.12)] md:p-8"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-brand-navy">{currentStep.title}</h2>
            {currentStep.fields.map((field) => (
              <Field key={field.id} label={field.label} required={field.required}>
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={(answers[field.id] as string) ?? ''}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                    className="text-input"
                  />
                )}
                {field.type === 'email' && (
                  <input
                    type="email"
                    value={(answers[field.id] as string) ?? ''}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                    className="text-input"
                  />
                )}
                {field.type === 'date' && (
                  <input
                    type="date"
                    value={(answers[field.id] as string) ?? ''}
                    onChange={(e) => updateValue(field.id, e.target.value)}
                    className="text-input"
                  />
                )}
                {field.type === 'radio' && (
                  <RadioGroup
                    name={field.id}
                    options={field.options ?? []}
                    value={(answers[field.id] as string) ?? ''}
                    onChange={(v) => updateValue(field.id, v)}
                  />
                )}
                {field.type === 'checkbox' && (
                  <>
                    <CheckboxGroup
                      options={field.options ?? []}
                      values={(answers[field.id] as string[]) ?? []}
                      onToggle={(v) => toggleCheckbox(field.id, v)}
                    />
                    {field.allowOther && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`${field.id}-other`}
                          checked={((answers[field.id] as string[]) ?? []).includes('أخرى')}
                          onChange={() => toggleCheckbox(field.id, 'أخرى')}
                          className="h-4 w-4 accent-brand-orange"
                        />
                        <label htmlFor={`${field.id}-other`} className="text-sm text-gray-700">
                          أخرى:
                        </label>
                        <input
                          type="text"
                          value={(answers[`${field.id}_other`] as string) ?? ''}
                          onChange={(e) => updateValue(`${field.id}_other`, e.target.value)}
                          className="text-input flex-1"
                          placeholder="اكتب إجابتك"
                        />
                      </div>
                    )}
                  </>
                )}
              </Field>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 rounded-full border-2 border-brand-blue px-6 py-2.5 font-bold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
              >
                <ArrowRight size={18} />
                السابق
              </button>
            ) : (
              <span />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-full bg-brand-orange px-6 py-2.5 font-bold text-white transition-colors hover:bg-brand-orange-dark"
              >
                التالي
                <ArrowLeft size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-full bg-brand-orange px-6 py-2.5 font-bold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
              >
                <Send size={18} />
                {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            )}
          </div>
        </form>
      </div>

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
