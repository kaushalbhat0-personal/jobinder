'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/shared/ui/organisms';
import { Heading, Text, Button, ProgressBar } from '@/shared/ui/atoms';
import { Card, CardBody } from '@/shared/ui/molecules';
import { useAuth } from '@/hooks/use-auth';
import { UploadResumeUseCase } from '@/domains/resume/use-cases/upload-resume.use-case';
import { FileReaderService } from '@/domains/resume/services/file-reader.service';
import { TextResumeParser } from '@/domains/resume/services/text-resume-parser';
import { InMemoryResumeStorageService } from '@/domains/resume/services/resume-storage.service';
import { InMemoryResumeRepository } from '@/domains/resume/repositories/in-memory-resume-repository';
import { useResumeStore } from '@/domains/resume/stores/resume-store';
import { cn } from '@/shared/utils/cn';

const fileReader = new FileReaderService();
const parser = new TextResumeParser();
const storage = new InMemoryResumeStorageService();
const repo = new InMemoryResumeRepository();
const uploadUseCase = new UploadResumeUseCase(fileReader, storage, parser, repo);

const ACCEPTED_TYPES = '.pdf,.docx';
const MAX_SIZE_MB = 10;

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const setResume = useResumeStore((s) => s.setResume);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (f: File): string | null => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) return 'Only PDF and DOCX files are accepted.';
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File exceeds ${MAX_SIZE_MB}MB limit.`;
    if (f.size === 0) return 'File is empty.';
    return null;
  };

  const handleFile = (f: File) => {
    const validationError = isValidFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 300);

    try {
      const result = await uploadUseCase.execute(user.id, file);
      clearInterval(interval);
      setProgress(100);

      if (result.isFailure()) {
        setError(result.error?.message ?? 'Upload failed');
        setUploading(false);
        return;
      }

      setResume(result.value.resume);

      setTimeout(() => {
        router.push(`/review?resumeId=${result.value.resume.id}`);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Text variant="body-md" className="text-neutral-500">
          Please sign in to upload.
        </Text>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Upload Resume" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardBody className="flex flex-col gap-4">
            <Heading variant="heading-sm">Upload your resume</Heading>
            <Text variant="body-sm" className="text-neutral-500">
              We support PDF and DOCX files up to {MAX_SIZE_MB}MB.
            </Text>

            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-all',
                dragOver
                  ? 'border-primary-500 bg-primary-50'
                  : 'bg-background border-neutral-300 hover:border-neutral-400',
                uploading && 'pointer-events-none opacity-50',
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                onChange={handleInputChange}
                className="sr-only"
              />
              {file ? (
                <div className="flex flex-col items-center gap-1">
                  <Text variant="body-md" className="font-semibold">
                    {file.name}
                  </Text>
                  <Text variant="caption" className="text-neutral-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </Text>
                </div>
              ) : (
                <>
                  <Text variant="body-md" className="text-primary-500 font-semibold">
                    Click to browse or drag & drop
                  </Text>
                  <Text variant="caption" className="text-neutral-400">
                    PDF or DOCX
                  </Text>
                </>
              )}
            </div>

            {error && (
              <Text variant="body-sm" className="text-danger-500">
                {error}
              </Text>
            )}

            {uploading && (
              <div className="flex flex-col gap-1">
                <ProgressBar value={progress} showLabel />
                <Text variant="caption" className="text-neutral-400">
                  {progress < 100 ? 'Reading and parsing your resume...' : 'Complete!'}
                </Text>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="flex-1" />

        <Button
          fullWidth
          size="lg"
          onClick={handleUpload}
          disabled={!file || uploading}
          loading={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload & Parse'}
        </Button>
      </div>
    </>
  );
}
