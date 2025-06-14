export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceQuarterly: number;
  priceAnnually: number;
  features: string[];
  trialDays?: number;
  isPopular?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  imageUrl?: string;
  content?: string; // Full content for dedicated news page
  dataAiHint?: string;
}

export interface Test {
  id: string;
  subject: string;
  teacher: string;
  dateTaken: string;
  score?: number; // Optional if test is not yet taken/graded
  status: 'Completed' | 'Pending' | 'In Progress';
}

export interface Subject {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  name: string;
}
