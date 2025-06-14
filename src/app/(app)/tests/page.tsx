'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TestFilterForm } from '@/components/tests/TestFilterForm';
import { TestListItem } from '@/components/tests/TestListItem';
import type { Test } from '@/types';
import { mockTests, mockSubjects, mockTeachers } from '@/lib/constants';
import Link from 'next/link';
import { PlusCircle, ListFilter } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function TestsPage() {
  const [filteredError, setFilteredError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ subject?: string; teacher?: string }>({});
  
  const [allTests, setAllTests] = useState<Test[]>(mockTests); // In a real app, fetch this

  const handleFilterChange = (newFilters: { subject?: string; teacher?: string }) => {
    setFilters(newFilters);
  };

  const displayedTests = allTests.filter(test => {
    const subjectMatch = !filters.subject || mockSubjects.find(s => s.id === filters.subject)?.name === test.subject;
    const teacherMatch = !filters.teacher || mockTeachers.find(t => t.id === filters.teacher)?.name === test.teacher;
    return subjectMatch && teacherMatch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold font-headline">الاختبارات</h1>
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden">
                <ListFilter className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                تصفية
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[75vh]">
              <SheetHeader>
                <SheetTitle>تصفية الاختبارات</SheetTitle>
                <SheetDescription>
                  اختر المادة أو المعلم لتصفية قائمة الاختبارات.
                </SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <TestFilterForm onFilterChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>
          <Button asChild>
            <Link href="/tests/new">
              <PlusCircle className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
              إنشاء اختبار جديد
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="hidden sm:block">
         <TestFilterForm onFilterChange={handleFilterChange} />
      </div>

      {filteredError && <p className="text-red-500 text-center mb-4">{filteredError}</p>}

      {displayedTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTests.map((test) => (
            <TestListItem key={test.id} test={test} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">لم يتم العثور على اختبارات تطابق معايير البحث.</p>
          <p className="mt-2">حاول تعديل الفلاتر أو إنشاء اختبار جديد.</p>
        </div>
      )}
    </div>
  );
}
