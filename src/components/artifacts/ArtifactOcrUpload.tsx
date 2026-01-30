'use client';

import { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiUpload } from '@/lib/apiClient';
import type { OcrUploadResponse } from '@/types/artifact';

interface ArtifactOcrUploadProps {
  accountId: string;
  onOcrResult: (result: OcrUploadResponse) => void;
  onCancel: () => void;
}

export function ArtifactOcrUpload({ accountId, onOcrResult, onCancel }: ArtifactOcrUploadProps) {
  const tOcr = useTranslations('artifactOcr');
  const tCommon = useTranslations('common');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selectedFile: File) => {
    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(tOcr('errors.invalidType'));
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(tOcr('errors.tooLarge'));
      return;
    }

    setError(null);
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await apiUpload<OcrUploadResponse>(
        `/accounts/${accountId}/artifacts/ocr`,
        file
      );
      onOcrResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : tOcr('errors.processingFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Camera className="h-4 w-4" />
        <span>{tOcr('intro')}</span>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-input hover:border-muted-foreground/50',
          preview && 'border-solid'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={tOcr('previewAlt')}
              className="mx-auto max-h-64 rounded-lg object-contain p-2"
            />
            <button
              type="button"
              onClick={clearFile}
              className="absolute right-2 top-2 rounded-full bg-destructive/80 p-1 text-destructive-foreground hover:bg-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 p-8">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {tOcr('dropzoneTitle')}
            </span>
            <span className="text-xs text-muted-foreground">{tOcr('dropzoneHint')}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        )}
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {/* Tips */}
      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{tOcr('tipsTitle')}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>{tOcr('tips.0')}</li>
          <li>{tOcr('tips.1')}</li>
          <li>{tOcr('tips.2')}</li>
          <li>{tOcr('tips.3')}</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {tCommon('cancel')}
        </Button>
        <Button onClick={handleUpload} disabled={!file || isUploading} className="flex-1">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tOcr('processing')}
            </>
          ) : (
            tOcr('scanAction')
          )}
        </Button>
      </div>
    </div>
  );
}
