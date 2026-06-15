export interface SiteContent {
  logoUrl: string;
  whatsappNumber: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  step1Title: string;
  step1Price: string;
  step2Title: string;
  step2Price: string;
  step3Title: string;
  step3Price: string;
  facebookUrl: string;
  instagramUrl: string;
}

export const CONTENT_COLLECTION = 'content';
export const CONTENT_DOC_ID = 'main';

export const defaultContent: SiteContent = {
  logoUrl: '',
  whatsappNumber: '967700000000',
  heroHeadline: 'حقق حلمك بالدراسة في الخارج بكل سهولة',
  heroSubheadline:
    'مهمتنا هي مساعدتك وتقديم الدعم لتجهيز ملفاتك وفحصها وترتيبها بالشكل الصحيح لنرفع احتمالية قبولك بالمنحة.',
  heroImageUrl: '',
  step1Title: 'رسوم ترتيب ملفات الطالب وتقديمها للحساب',
  step1Price: '10',
  step2Title: 'قبول الطالب لمرحلة المقابلة',
  step2Price: '50',
  step3Title: 'قبول الطالب للمرحلة النهائية',
  step3Price: '250',
  facebookUrl: '',
  instagramUrl: '',
};
