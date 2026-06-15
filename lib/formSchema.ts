export const FORM_CONFIG_COLLECTION = 'formConfig';
export const FORM_CONFIG_DOC_ID = 'application';

export type FieldType = 'text' | 'email' | 'date' | 'radio' | 'checkbox';

export interface FormFieldDef {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  allowOther?: boolean;
}

export interface FormStepDef {
  id: string;
  title: string;
  fields: FormFieldDef[];
}

export interface FormSchema {
  formTitle: string;
  steps: FormStepDef[];
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: 'نص قصير',
  email: 'بريد إلكتروني',
  date: 'تاريخ',
  radio: 'اختيار واحد',
  checkbox: 'اختيار متعدد',
};

export const defaultFormSchema: FormSchema = {
  formTitle: 'نموذج تقييم لتحديد المنحة الدراسية الأنسب لمؤهلاتك',
  steps: [
    {
      id: 'personal',
      title: 'البيانات الشخصية',
      fields: [
        {
          id: 'fullName',
          label: 'الاسم الكامل (باللغة الإنجليزية كما في جواز السفر)',
          type: 'text',
          required: true,
        },
        {
          id: 'nationality',
          label: 'الجنسية ومكان الإقامة الحالي',
          type: 'text',
          required: true,
        },
        {
          id: 'dob',
          label: 'تاريخ الميلاد',
          type: 'date',
          required: true,
        },
        {
          id: 'email',
          label: 'البريد الإلكتروني',
          type: 'email',
          required: true,
        },
        {
          id: 'whatsapp',
          label: 'رقم الواتس اب (للتواصل لاحقاً)',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      id: 'academic',
      title: 'الخلفية الدراسية والأكاديمية',
      fields: [
        {
          id: 'lastDegree',
          label: 'آخر مؤهل علمي تم الحصول عليه',
          type: 'radio',
          required: true,
          options: ['ثانوية عامة', 'بكالوريوس', 'ماجستير'],
        },
        {
          id: 'gpa',
          label: 'المعدل التراكمي أو النسبة المئوية الأخيرة (مثال: 3.5/4 أو 90%)',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      id: 'ambition',
      title: 'الطموح الأكاديمي المستقبلي',
      fields: [
        {
          id: 'major',
          label: 'التخصص أو المجال الدراسي المطلوب التقديم عليه',
          type: 'text',
          required: true,
        },
        {
          id: 'destinations',
          label: 'الوجهة الدراسية المفضلة',
          type: 'checkbox',
          required: true,
          allowOther: true,
          options: ['الصين', 'اندونيسيا', 'روسيا', 'ماليزيا', 'تركيا'],
        },
      ],
    },
    {
      id: 'readiness',
      title: 'المهارات والجاهزية',
      fields: [
        {
          id: 'englishCert',
          label: 'هل تمتلك شهادة إتقان لغة إنجليزية حالية؟',
          type: 'checkbox',
          required: true,
          options: [
            'نعم، IELTS',
            'نعم، TOEFL',
            'نعم, دبلوم',
            'نعم, شهادة معهد',
            'اريد مساعدتكم في الحصول على شهادة لغة انجليزية',
            'ليس لدي اي خلفية باللغة الانجليزية ( اذا اخترت هذه الخيار سوف نساعدك للتعلم والحصول على شهادة)',
          ],
        },
        {
          id: 'documentsReady',
          label: 'ما هي الأوراق والمستندات الجاهزة لديك حالياً؟',
          type: 'checkbox',
          required: true,
          options: [
            'جواز سفر ساري المفعول',
            'كشف الدرجات والشهادات المترجمة والمصدقة',
            'رسائل التوصية (Recommendation Letters)',
            'السيرة الذاتية (CV) الأكاديمية',
            'رسالة الدافع / الخطاب الشخصي (Motivation Letter)',
            'جاري العمل على استخراج الاوراق',
            'لا يوجد شيء جاهز حالياً',
          ],
        },
        {
          id: 'fundingType',
          label: 'ما هو نوع الدعم المالي الذي تحتاجه بشكل أساسي؟',
          type: 'checkbox',
          required: true,
          options: [
            'منحة ممولة بالكامل (تغطي الرسوم، السكن، راتب شهري، وتذاكر الطيران)',
            'منحة جزيئة تغطي رسوم الدراسة والفيزا والسكن',
            'منحة تغطي الرسوم الدراسية فقط (أستطيع تحمل تكاليف المعيشة بنفسي)',
            'منحة جزئية / تخفيض رسوم دراسية',
          ],
        },
        {
          id: 'applyViaScholix',
          label: 'هل تريد التقديم عن طريق فريقنا (Scholix)؟',
          type: 'radio',
          required: true,
          options: ['نعم', 'لا'],
        },
      ],
    },
  ],
};

export type FormAnswers = Record<string, string | string[]>;

export function emptyAnswers(schema: FormSchema): FormAnswers {
  const answers: FormAnswers = {};
  for (const step of schema.steps) {
    for (const field of step.fields) {
      answers[field.id] = field.type === 'checkbox' ? [] : '';
      if (field.allowOther && (field.type === 'checkbox' || field.type === 'radio')) {
        answers[`${field.id}_other`] = '';
      }
    }
  }
  return answers;
}

export function isFieldAnswered(field: FormFieldDef, answers: FormAnswers): boolean {
  const value = answers[field.id];
  if (field.type === 'checkbox') {
    return Array.isArray(value) && value.length > 0;
  }
  return typeof value === 'string' && value.trim().length > 0;
}

export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
