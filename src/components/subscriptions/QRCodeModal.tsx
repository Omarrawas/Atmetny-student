'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, ScanLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function QRCodeModal() {
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleActivate = () => {
    if (qrCodeValue.trim() === '') {
      toast({
        title: "خطأ في الإدخال",
        description: "الرجاء إدخال رمز QR.",
        variant: "destructive",
      });
      return;
    }
    // Simulate activation
    console.log('Activating with QR Code:', qrCodeValue);
    toast({
      title: "نجاح",
      description: `تم تفعيل الاشتراك بالرمز: ${qrCodeValue}`,
    });
    setQrCodeValue('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
          تفعيل الاشتراك عبر QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">تفعيل الاشتراك برمز QR</DialogTitle>
          <DialogDescription>
            أدخل الرمز الموجود على بطاقة الاشتراك الخاصة بك، أو قم بمسح الرمز ضوئياً.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-md aspect-square bg-muted/50">
            <ScanLine className="h-24 w-24 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-sm text-muted-foreground">محاكاة لمسح QR (غير فعال)</p>
          </div>
          <div className="grid grid-cols-1 items-center gap-4">
            <Label htmlFor="qr-code" className="text-right rtl:text-right">
              أو أدخل الرمز يدوياً
            </Label>
            <Input
              id="qr-code"
              value={qrCodeValue}
              onChange={(e) => setQrCodeValue(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">إلغاء</Button>
          </DialogClose>
          <Button type="button" onClick={handleActivate}>تفعيل</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
