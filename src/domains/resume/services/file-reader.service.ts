import type { Result } from '@/shared/core/result';
import { success, failure } from '@/shared/core/result';
import { ValidationError, InfrastructureError } from '@/shared/core/errors';

const REJECTED_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'bmp',
  'webp',
  'svg',
  'ico',
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'csv',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'json',
  'xml',
  'yaml',
  'yml',
]);

function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.slice(idx + 1).toLowerCase() : '';
}

async function readPdfAsText(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const doc = await pdfjs.getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
    pages.push(text);
  }
  return pages.join('\n\n');
}

async function readDocxAsText(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export interface FileReadResult {
  content: string;
  sourceType: 'pdf' | 'docx';
}

export class FileReaderService {
  async readAsText(file: File): Promise<Result<FileReadResult>> {
    const ext = getExtension(file.name);

    if (REJECTED_EXTENSIONS.has(ext)) {
      return failure(
        new ValidationError(
          `Unsupported file type: .${ext}. Only PDF and DOCX files are accepted.`,
        ),
      );
    }

    let sourceType: FileReadResult['sourceType'];
    if (ext === 'pdf') sourceType = 'pdf';
    else if (ext === 'docx') sourceType = 'docx';
    else
      return failure(
        new ValidationError(
          `Unsupported file type: .${ext}. Only PDF and DOCX files are accepted.`,
        ),
      );

    if (file.size === 0) return failure(new ValidationError('File is empty'));
    if (file.size > 10 * 1024 * 1024)
      return failure(new ValidationError('File exceeds 10MB limit'));

    try {
      const arrayBuffer = await file.arrayBuffer();

      let content: string;
      if (sourceType === 'pdf') {
        content = await readPdfAsText(arrayBuffer);
      } else {
        content = await readDocxAsText(arrayBuffer);
      }

      const trimmed = content.trim();
      if (trimmed.length === 0)
        return failure(new ValidationError('No extractable text found in file'));

      return success({ content: trimmed, sourceType });
    } catch (err) {
      return failure(new InfrastructureError(`Failed to read file: ${(err as Error).message}`));
    }
  }
}
