
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { teachers as teacherOptions } from "@/lib/constants"; // Teacher filtering can be added back if teacher_id is reliable
import { getPublicExams, getSubjects } from "@/lib/examService";
import type { Exam, Subject } from "@/lib/types";
import { Filter, FileText, Clock, User, Loader2, AlertCircle, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subjectsList, setSubjectsList] = useState<Subject[]>([]); 
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const { toast } = useToast();

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  // const [selectedTeacher, setSelectedTeacher] = useState<string>(""); // Teacher filter temporarily removed

  const [activeFilters, setActiveFilters] = useState<{ subjectId?: string; /* teacherId?: string */ }>( {});

  useEffect(() => {
    const fetchSubjectOptions = async () => {
      setIsLoadingSubjects(true);
      try {
        const fetchedSubjects = await getSubjects(); 
        setSubjectsList(fetchedSubjects);
        if (fetchedSubjects.length === 0) {
            // toast({ title: "تنبيه", description: "قائمة المواد فارغة.", variant: "default" });
        }
      } catch (e) {
        console.error("Failed to fetch subject options:", e);
        toast({ title: "خطأ", description: "فشل تحميل قائمة المواد للفلترة.", variant: "destructive" });
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    fetchSubjectOptions();
  }, [toast]);

  useEffect(() => {
    const fetchExams = async () => {
      setIsLoadingExams(true);
      setError(null);
      try {
        const fetchedExams = await getPublicExams(activeFilters); 
        setExams(fetchedExams);
         if (fetchedExams.length === 0 && Object.keys(activeFilters).length === 0) {
            // toast({ title: "تنبيه", description: "لا توجد اختبارات عامة متاحة حالياً.", variant: "default" });
        }
      } catch (e: any) {
        console.error("Failed to fetch exams:", e);
        setError(e.message || "فشل تحميل قائمة الاختبارات. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsLoadingExams(false);
      }
    };
    fetchExams();
  }, [activeFilters, toast]);

  const handleApplyFilter = () => {
    const newActiveFilters: { subjectId?: string; /* teacherId?: string */ } = {};
    if (selectedSubject && selectedSubject !== 'all' && selectedSubject !== '') {
      newActiveFilters.subjectId = selectedSubject;
    }
    // if (selectedTeacher && selectedTeacher !== 'all' && selectedTeacher !== '') {
    //   newActiveFilters.teacherId = selectedTeacher;
    // }
    setActiveFilters(newActiveFilters);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Filter className="h-8 w-8 text-primary" />
            <span>تصفية الاختبارات العامة</span>
          </CardTitle>
          <CardDescription>ابحث عن الاختبارات العامة بناءً على المادة.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="subject-filter" className="block text-sm font-medium text-foreground mb-1">المادة</label>
            <Select 
              dir="rtl" 
              onValueChange={setSelectedSubject} 
              value={selectedSubject}
              disabled={isLoadingSubjects || subjectsList.length === 0}
            >
              <SelectTrigger id="subject-filter" className="w-full">
                <SelectValue placeholder={isLoadingSubjects ? "جاري تحميل المواد..." : (subjectsList.length === 0 ? "لا مواد متاحة" : "اختر المادة")} />
              </SelectTrigger>
              <SelectContent>
                {!isLoadingSubjects && subjectsList.length > 0 && (
                  <>
                    <SelectItem value="all">الكل</SelectItem>
                    {subjectsList.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          {/* <div>
            <label htmlFor="teacher-filter" className="block text-sm font-medium text-foreground mb-1">الأستاذ</label>
            <Select dir="rtl" onValueChange={setSelectedTeacher} value={selectedTeacher}>
              <SelectTrigger id="teacher-filter" className="w-full">
                <SelectValue placeholder="اختر الأستاذ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {teacherOptions.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <div className="md:col-start-2 md:self-end">
            <Button className="w-full" onClick={handleApplyFilter} disabled={isLoadingSubjects || isLoadingExams}>
              {isLoadingExams && !isLoadingSubjects ? <Loader2 className="ms-2 h-4 w-4 animate-spin" /> : <Filter className="ms-2 h-4 w-4" />}
              تطبيق الفلتر
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-6">الاختبارات العامة المتاحة</h2>
        {isLoadingExams && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ms-3 text-lg">جاري تحميل الاختبارات...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-10 text-red-600 bg-red-100 dark:bg-red-900/30 p-4 rounded-md">
             <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-lg">{error}</p>
          </div>
        )}
        {!isLoadingExams && !error && exams.length === 0 && (
          <p className="text-center text-muted-foreground mt-8 text-lg">
            {Object.values(activeFilters).some(val => val !== undefined)
              ? "لا توجد اختبارات تطابق معايير الفلترة الحالية."
              : "لا توجد اختبارات عامة متاحة حالياً."}
          </p>
        )}
        {!isLoadingExams && !error && exams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48 w-full">
                  <Image
                    src={exam.image || "https://placehold.co/600x400.png"}
                    alt={exam.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={exam.image_hint || "education exam"}
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{exam.title}</CardTitle>
                  <CardDescription>{exam.subjectName}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="ms-1 h-4 w-4" />
                    <span>الأستاذ: {exam.teacher_name || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="ms-1 h-4 w-4" />
                    <span>المدة: {exam.duration ? `${exam.duration} دقيقة` : 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="ms-1 h-4 w-4" />
                    <span>عدد الأسئلة: {exam.totalQuestions ?? 'غير محدد'}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/exams/${exam.id}/setup`}>
                      <Settings className="ms-2 h-4 w-4" />
                      إعداد وبدء الاختبار
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
