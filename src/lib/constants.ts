
import type { LucideIcon, LucideIconName as ActualLucideIconName } from 'lucide-react'; // Keep LucideIcon for other uses
import { Home, FileText, Brain, CreditCard, QrCode, Users, UserCircle, Settings, ShieldCheck, Zap, Sparkles, BookOpen, Newspaper, Megaphone, Atom, Feather, CaseUpper } from 'lucide-react';
import type { Question, Subject as AppSubjectType } from './types'; // Import Subject type from types.ts


export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  keywords?: string; 
  children?: NavItem[]; 
}

export const mainNavItems: NavItem[] = [
  { href: '/', label: 'الرئيسية', icon: Home, keywords: 'dashboard home main page' },
  { href: '/study', label: 'الدراسة', icon: BookOpen, keywords: 'study learn subjects courses' },
  { href: '/exams', label: 'الاختبارات العامة', icon: FileText, keywords: 'tests quizzes exams practice' },
  { href: '/news', label: 'آخر الأخبار', icon: Newspaper, keywords: 'updates articles information' },
  { href: '/announcements', label: 'الإعلانات', icon: Megaphone, keywords: 'notifications alerts important' },
  { href: '/ai-analysis', label: 'تحليل الأداء', icon: Sparkles, keywords: 'ai intelligence insights performance' },
  { href: '/subscribe', label: 'الاشتراكات', icon: CreditCard, keywords: 'pricing plans subscription payment' },
  { href: '/activate-qr', label: 'تفعيل QR', icon: QrCode, keywords: 'scan code activation redeem' },
  { href: '/community', label: 'المجتمع', icon: Users, keywords: 'forum discussion help support' },
  { href: '/settings', label: 'الإعدادات', icon: Settings, keywords: 'settings configuration options account' },
];

export const teacherNavItems: NavItem[] = [ 
  { href: '/teacher/dashboard', label: 'لوحة تحكم المعلم', icon: Settings, keywords: 'teacher panel content management' },
  { href: '/teacher/questions', label: 'إدارة الأسئلة', icon: FileText, keywords: 'question bank create edit' },
  { href: '/teacher/analytics', label: 'تحليلات الطلاب', icon: Zap, keywords: 'student performance data insights' },
];

export const accountNavItems: NavItem[] = [
  { href: '/profile', label: 'الملف الشخصي', icon: UserCircle },
  { href: '/settings', label: 'الإعدادات', icon: Settings },
  { href: '/privacy', label: 'الخصوصية والأمان', icon: ShieldCheck },
];

// This interface is now slightly different from AppSubjectType in types.ts
// as AppSubjectType will get icon_name as string from DB.
// This constants.ts subjects array is more for mock/fallback or mapping string icon names.
export interface ConstantSubject {
  id: string; // In constants, this might still be a string like 'math'
  name: string;
  icon_name?: ActualLucideIconName | string; // Keep as string name
  branch: 'scientific' | 'literary' | 'common'; // Matches enum, but as string literals here
  // topics: string[]; // Topics are not directly on subjects table anymore, but could be on lessons or derived from questions.
}
// This array is deprecated as a primary source for subject listing.
// Use examService.getSubjects() instead.
// It might be used for very basic fallback or specific constants if needed.
export const subjects: ConstantSubject[] = [
  { id: 'math-legacy', name: 'الرياضيات (Legacy)', icon_name: 'Brain', branch: 'scientific' },
  { id: 'physics-legacy', name: 'الفيزياء (Legacy)', icon_name: 'Atom', branch: 'scientific' },
];


// allQuestions array is deprecated. Questions should be fetched from Supabase.
export const allQuestions: Question[] = []; 

export const teachers = [
  { id: 'teacher1', name: 'الأستاذ أحمد' },
  { id: 'teacher2', name: 'الأستاذة فاطمة' },
  { id: 'teacher3', name: 'الأستاذ خالد' },
  { id: 'teacher4', name: 'الأستاذة سارة' },
];

// mockExams array is deprecated. Exams should be fetched from Supabase.
export const mockExams = [];

