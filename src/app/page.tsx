import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // In a real app, this page could be a landing page or handle auth redirection.
  // For now, we redirect directly to the dashboard.
  return null;
}
