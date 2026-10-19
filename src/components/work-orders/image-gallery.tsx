'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ImageIcon, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WorkOrderImage } from '@/types/work-orders';
import { useUploadImageMutation } from '@/hooks/use-work-orders';
import { formatApiError } from '@/lib/api-errors';

interface ImageGalleryProps {
  workOrderId: string;
  images: WorkOrderImage[];
  canUpload?: boolean;
}

export function ImageGallery({
  workOrderId,
  images,
  canUpload = true,
}: ImageGalleryProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadImageMutation(workOrderId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 5) {
      toast.error('Maximum of 5 images allowed per work order');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, WebP)');
      return;
    }

    try {
      await uploadMutation.mutateAsync(file);
      toast.success('Image uploaded successfully');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(formatApiError(err).message);
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Incident Attachments</CardTitle>
          </div>
          <CardDescription>Visual evidence and diagnostic photos ({images.length}/5)</CardDescription>
        </div>
        {canUpload && images.length < 5 && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={uploadMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Upload Photo
                </>
              )}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 italic">
            No image attachments provided for this work order.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted cursor-pointer shadow-sm hover:opacity-95 transition-opacity"
                onClick={() => setSelectedImageUrl(img.secureUrl)}
              >
                <Image
                  src={img.secureUrl}
                  alt="Work order attachment"
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog
        open={Boolean(selectedImageUrl)}
        onOpenChange={(open) => !open && setSelectedImageUrl(null)}
      >
        <DialogContent className="max-w-3xl p-2 border-0 bg-transparent shadow-none">
          {selectedImageUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/90">
              <Image
                src={selectedImageUrl}
                alt="Enlarged attachment"
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                onClick={() => setSelectedImageUrl(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

