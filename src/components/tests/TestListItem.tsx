import type { Test } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, CheckCircle, Edit3, Percent, User, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestListItemProps {
  test: Test;
}

export function TestListItem({ test }: TestListItemProps) {
  const getStatusBadgeVariant = (status: Test['status']) => {
    switch (status) {
      case 'Completed':
        return 'default'; // Greenish or primary
      case 'Pending':
        return 'secondary'; // Yellowish or secondary
      case 'In Progress':
        return 'outline'; // Bluish or accent
      default:
        return 'secondary';
    }
  };
  
  const getStatusTextClass = (status: Test['status']) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 dark:text-green-400';
      case 'Pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'In Progress':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  }


  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="font-headline text-lg mb-1">{test.subject}</CardTitle>
          <Badge variant={getStatusBadgeVariant(test.status)} className={cn("whitespace-nowrap", getStatusTextClass(test.status))}>
            {test.status === 'Completed' && <CheckCircle className="mr-1 h-3 w-3 rtl:ml-1 rtl:mr-0" />}
            {test.status}
          </Badge>
        </div>
        <CardDescription className="text-xs space-y-1">
          <div className="flex items-center"><User className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0 text-muted-foreground" /> المعلم: {test.teacher}</div>
          <div className="flex items-center"><Calendar className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0 text-muted-foreground" /> تاريخ الاختبار: {test.dateTaken}</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {test.status === 'Completed' && typeof test.score === 'number' && (
          <div className="flex items-center text-primary">
            <Percent className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            <p className="text-xl font-semibold">الدرجة: {test.score}%</p>
          </div>
        )}
         {test.status !== 'Completed' && (
          <p className="text-sm text-muted-foreground">هذا الاختبار لم يكتمل بعد أو لم يتم تصحيحه.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={test.status === 'Completed' ? 'default' : 'outline'}>
          <Link href={`/tests/${test.id}`}>
            {test.status === 'Completed' ? 'عرض النتائج والتحليل' : (test.status === 'Pending' ? 'بدء الاختبار' : 'متابعة الاختبار')}
            {test.status !== 'Completed' && <Edit3 className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
