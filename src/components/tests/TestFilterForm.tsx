'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockSubjects, mockTeachers, educationalIcons } from "@/lib/constants";
import { Filter, RotateCcw } from "lucide-react";

const testFilterSchema = z.object({
  subject: z.string().optional(),
  teacher: z.string().optional(),
});

type TestFilterFormValues = z.infer<typeof testFilterSchema>;

interface TestFilterFormProps {
  onFilterChange: (filters: TestFilterFormValues) => void;
}

export function TestFilterForm({ onFilterChange }: TestFilterFormProps) {
  const form = useForm<TestFilterFormValues>({
    resolver: zodResolver(testFilterSchema),
    defaultValues: {
      subject: "",
      teacher: "",
    },
  });

  function onSubmit(data: TestFilterFormValues) {
    onFilterChange(data);
  }

  function handleReset() {
    form.reset({ subject: "", teacher: ""});
    onFilterChange({});
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg bg-card mb-6 shadow">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><educationalIcons.Subject className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />المادة</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  {mockSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="teacher"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><educationalIcons.Teacher className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />المعلم</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المعلم" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  {mockTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 md:col-span-1">
          <Button type="submit" className="w-full">
            <Filter className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
            تطبيق الفلتر
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className="w-auto" aria-label="Reset filters">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
