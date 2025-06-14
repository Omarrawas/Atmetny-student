import type { ReactNode } from 'react';
import { Logo } from '@/components/icons/Logo';
import { APP_NAME_AR } from '@/lib/constants';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
           <Logo className="h-16 w-auto text-primary mx-auto" />
           <h1 className="text-3xl font-bold mt-2 font-headline">{APP_NAME_AR}</h1>
        </Link>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
