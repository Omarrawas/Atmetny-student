'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/Logo';
import { APP_NAME_AR, mainNavItems } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { UserCircle } from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <Logo className="h-8 w-auto text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">{APP_NAME_AR}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.title, className: 'text-xs' }}
                  className="justify-start"
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    {item.label && (
                      <SidebarMenuBadge className="ml-auto group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </SidebarMenuBadge>
                    )}
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4 mt-auto">
        <Link href="/profile" legacyBehavior passHref>
          <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center">
              <UserCircle className="h-5 w-5" />
              <span className="ml-2 group-data-[collapsible=icon]:hidden rtl:mr-2 rtl:ml-0">الملف الشخصي</span>
          </Button>
        </Link>
      </SidebarFooter>
    </>
  );
}
