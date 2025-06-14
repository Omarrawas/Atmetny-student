import type { NavItem, NewsItem, SubscriptionPlan, Test, Subject, Teacher } from '@/types';
import { LayoutDashboard, CreditCard, FileText, PlusCircle, Newspaper, Settings, LogOut, QrCode, User, School, BookOpen } from 'lucide-react';

export const APP_NAME = "Atmetny";
export const APP_NAME_AR = "أتقني";

export const mainNavItems: NavItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { title: 'الاشتراكات', href: '/subscriptions', icon: CreditCard },
  { title: 'اختباراتي', href: '/tests', icon: FileText },
  { title: 'إنشاء اختبار', href: '/tests/new', icon: PlusCircle },
  { title: 'الأخبار والإعلانات', href: '/news', icon: Newspaper },
];

export const userNavItems: NavItem[] = [
  { title: 'الملف الشخصي', href: '/profile', icon: User },
  { title: 'الإعدادات', href: '/settings', icon: Settings },
  { title: 'تسجيل الخروج', href: '/auth/logout', icon: LogOut },
];

export const mockSubjects: Subject[] = [
  { id: 'math', name: 'الرياضيات' },
  { id: 'physics', name: 'الفيزياء' },
  { id: 'chemistry', name: 'الكيمياء' },
  { id: 'arabic', name: 'اللغة العربية' },
  { id: 'history', name: 'التاريخ' },
];

export const mockTeachers: Teacher[] = [
  { id: 'teacher1', name: 'أ. أحمد عبدالله' },
  { id: 'teacher2', name: 'أ. فاطمة علي' },
  { id: 'teacher3', name: 'د. خالد محمود' },
  { id: 'teacher4', name: 'أ. سارة إبراهيم' },
];

export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'الخطة الشهرية',
    description: 'وصول كامل لجميع الميزات لمدة شهر.',
    priceMonthly: 10,
    priceQuarterly: 0, // Not applicable for monthly
    priceAnnually: 0,  // Not applicable for monthly
    features: ['وصول لجميع الاختبارات', 'تحليل أداء بالذكاء الاصطناعي', 'دعم فني'],
    trialDays: 7,
  },
  {
    id: 'quarterly',
    name: 'الخطة الربع سنوية',
    description: 'وصول كامل لمدة 3 أشهر مع توفير.',
    priceMonthly: 0, // Not applicable
    priceQuarterly: 25, // Price for 3 months
    priceAnnually: 0,   // Not applicable
    features: ['جميع ميزات الخطة الشهرية', 'خصم 15%'],
    isPopular: true,
  },
  {
    id: 'annual',
    name: 'الخطة السنوية',
    description: 'أفضل قيمة مع وصول كامل لمدة سنة.',
    priceMonthly: 0, // Not applicable
    priceQuarterly: 0, // Not applicable
    priceAnnually: 80,  // Price for 12 months
    features: ['جميع ميزات الخطة الربع سنوية', 'خصم 30%', 'أولوية في الدعم'],
  },
];

export const mockNewsItems: NewsItem[] = [
  {
    id: 'news1',
    title: 'إطلاق تحديث جديد للمنصة',
    date: '2024-05-15',
    summary: 'يسرنا الإعلان عن إطلاق تحديث جديد لمنصة أتقني يتضمن ميزات محسنة وأداء أفضل.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'technology update',
    content: 'تفاصيل أوفى حول التحديث الجديد والميزات التي تم إضافتها لتحسين تجربة المستخدمين. نأمل أن ينال هذا التحديث إعجابكم.',
  },
  {
    id: 'news2',
    title: 'نصائح للاستعداد للاختبارات النهائية',
    date: '2024-05-10',
    summary: 'مع اقتراب الاختبارات النهائية، نقدم لكم مجموعة من النصائح لمساعدتكم في الاستعداد بشكل فعال.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'study tips',
    content: 'نصائح مفصلة حول كيفية تنظيم الوقت، المراجعة الفعالة، والتعامل مع قلق الاختبارات. نتمنى لجميع طلابنا التوفيق والنجاح.',
  },
  {
    id: 'news3',
    title: 'ورشة عمل مجانية حول استخدام الذكاء الاصطناعي في التعليم',
    date: '2024-05-01',
    summary: 'ندعوكم لحضور ورشة عمل مجانية لاستكشاف كيف يمكن للذكاء الاصطناعي أن يعزز تجربتكم التعليمية.',
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'AI workshop',
    content: 'تفاصيل الورشة، الموعد، وكيفية التسجيل. فرصة رائعة لمعرفة المزيد عن تطبيقات الذكاء الاصطناعي في مجال التعليم.',
  },
];

export const mockTests: Test[] = [
  {
    id: 'test1',
    subject: 'الرياضيات',
    teacher: 'أ. أحمد عبدالله',
    dateTaken: '2024-05-12',
    score: 85,
    status: 'Completed',
  },
  {
    id: 'test2',
    subject: 'الفيزياء',
    teacher: 'أ. فاطمة علي',
    dateTaken: '2024-05-10',
    score: 92,
    status: 'Completed',
  },
  {
    id: 'test3',
    subject: 'الكيمياء',
    teacher: 'د. خالد محمود',
    dateTaken: '2024-05-18',
    status: 'Pending',
  },
];

export const educationalIcons = {
  Subject: BookOpen,
  Teacher: School,
  QRCode: QrCode,
};
