import api from './client';
import axios from 'axios';

export interface PresignedUrlResponse {
  uploadUrl: string;
  imageUrl: string;
  key: string;
}

/**
 * Step 1 — Ask backend for a one-time S3 presigned URL.
 */
export async function getPresignedUrl(
  fileName: string,
  contentType: string,
  folder?: string,
): Promise<PresignedUrlResponse> {
  const { data } = await api.post<PresignedUrlResponse>('/upload/presigned-url', {
    fileName,
    contentType,
    folder,
  });
  return data;
}

/**
 * Step 2 — Upload file bytes directly to S3 using the presigned PUT URL.
 * Reports per-byte progress via onProgress(0..1).
 */
export async function uploadToS3(
  presignedUrl: string,
  fileUri: string,
  contentType: string,
  onProgress?: (ratio: number) => void,
): Promise<void> {
  // expo-file-system gives us a local file:// URI.
  // fetch() can read it as a blob on React Native ≥ 0.71.
  const response = await fetch(fileUri);
  const blob = await response.blob();

  await axios.put(presignedUrl, blob, {
    headers: {
      'Content-Type': contentType,
      // Presigned URL already embeds auth — no Authorization header
    },
    // Strip the JWT interceptor for this request (direct S3 call)
    transformRequest: [(data) => data],
    onUploadProgress: (evt) => {
      if (evt.total && onProgress) {
        onProgress(evt.loaded / evt.total);
      }
    },
  });
}

/**
 * Derive a safe MIME type from a file URI / file name.
 */
export function mimeFromUri(uri: string): string {
  const ext = uri.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    heic: 'image/heic',
    heif: 'image/heif',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
  };
  return map[ext ?? ''] ?? 'image/jpeg';
}
