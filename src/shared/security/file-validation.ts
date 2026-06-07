import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError } from '@/shared/core/errors';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface FileValidationResult {
  fileName: string;
  mimeType: string;
  size: number;
}

export function validateResumeFile(file: {
  name: string;
  type: string;
  size: number;
}): Result<FileValidationResult> {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return failure(
      new ValidationError(
        `Invalid file extension "${extension}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      ),
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return failure(
      new ValidationError(`Invalid file type "${file.type}". Allowed: PDF, DOCX, DOC`),
    );
  }

  if (file.size === 0) {
    return failure(new ValidationError('File is empty'));
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return failure(
      new ValidationError(`File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit`),
    );
  }

  return success({ fileName: file.name, mimeType: file.type, size: file.size });
}
