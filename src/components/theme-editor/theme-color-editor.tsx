
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCustomTheme } from '@/contexts/custom-theme-provider';
import type { ColorTheme } from '@/lib/color-themes';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThemeColorEditorProps {
  themeId: string;
  colorMode: 'light' | 'dark';
  colorKey: keyof ColorTheme['colors']['light']; // Assuming light & dark have same keys
  initialValue: string;
  children: React.ReactNode; // For the trigger button
}

export const ThemeColorEditor: React.FC<ThemeColorEditorProps> = ({
  themeId,
  colorMode,
  colorKey,
  initialValue,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const { updateThemeColorValue } = useCustomTheme();
  const { toast } = useToast();

  const handleSave = () => {
    updateThemeColorValue(themeId, colorMode, colorKey, currentValue);
    toast({
      title: "تم تحديث اللون",
      description: `تم تحديث قيمة "${String(colorKey)}" في وضع "${colorMode === 'light' ? 'الفاتح' : 'الداكن'}".`,
    });
    setIsOpen(false);
  };

  // Update internal state if initialValue changes (e.g. theme switch)
  React.useEffect(() => {
    setCurrentValue(initialValue);
  }, [initialValue]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">تعديل اللون</h4>
            <p className="text-sm text-muted-foreground">
              تعديل قيمة خاصية اللون: <span className="font-semibold text-primary">{String(colorKey)}</span>
              <br/>
              للثيم: <span className="font-semibold text-primary">{themeId}</span> ({colorMode === 'light' ? 'فاتح' : 'داكن'})
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`color-value-${colorKey}`}>{String(colorKey)}</Label>
            <Input
              id={`color-value-${colorKey}`}
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="col-span-2 h-8"
              placeholder="مثال: 210 40% 98% أو #ffffff أو linear-gradient(...)"
            />
            <p className="text-xs text-muted-foreground">
              أدخل قيمة HSL (مثل: 210 40% 98%)، HEX (مثل: #fafafa)، أو تدرج CSS (مثل: linear-gradient(...)).
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => {setCurrentValue(initialValue); setIsOpen(false);}}>
                <X className="ms-1 h-4 w-4" />
                إلغاء
            </Button>
            <Button size="sm" onClick={handleSave}>
                <Check className="ms-1 h-4 w-4" />
                حفظ
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

