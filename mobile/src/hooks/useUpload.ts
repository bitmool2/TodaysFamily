import { useCallback, useRef } from 'react';
import { useUploadStore } from '@/store/uploadStore';
import { useFamilyStore } from '@/store/familyStore';
import { getPresignedUrl, uploadToS3, mimeFromUri } from '@/api/upload';
import { createPost } from '@/api/posts';
import type { UploadAsset, GroupType, SourceType } from '@/types';

export interface UploadOptions {
  assets: UploadAsset[];
  groupType: GroupType;
  source: SourceType;
  caption?: string;
  isAiCaption?: boolean;
  childId?: string;
  /** Called after every individual asset finishes uploading */
  onFileComplete?: (index: number, total: number) => void;
}

export interface UploadResult {
  succeeded: number;
  failed: number;
  postIds: string[];
}

/**
 * Orchestrates the full upload pipeline for one batch of assets:
 *   1. GET presigned URL from backend
 *   2. PUT file bytes directly to S3
 *   3. POST /posts to persist the record in the DB
 *
 * Assets are uploaded sequentially so progress feedback stays accurate.
 * A single asset failure does not abort the whole batch.
 */
export function useUpload() {
  const {
    updateProgress,
    setUploadComplete,
    setError,
    setIsUploading,
  } = useUploadStore();

  const { family, groups } = useFamilyStore();
  const abortRef = useRef(false);

  const resolveGroupId = useCallback(
    (groupType: GroupType): string | null => {
      return groups.find((g) => g.type === groupType)?.id ?? null;
    },
    [groups],
  );

  const upload = useCallback(
    async (opts: UploadOptions): Promise<UploadResult> => {
      const {
        assets, groupType, source,
        caption, isAiCaption = false, childId,
        onFileComplete,
      } = opts;

      if (!family) {
        setError('가족 정보를 찾을 수 없습니다.');
        return { succeeded: 0, failed: assets.length, postIds: [] };
      }

      const groupId = resolveGroupId(groupType);
      if (!groupId) {
        setError('그룹 정보를 찾을 수 없습니다.');
        return { succeeded: 0, failed: assets.length, postIds: [] };
      }

      abortRef.current = false;
      setIsUploading(true);
      setError(null);
      updateProgress(0, assets.length);

      let succeeded = 0;
      let failed = 0;
      const postIds: string[] = [];

      for (let i = 0; i < assets.length; i++) {
        if (abortRef.current) break;

        const asset = assets[i];
        try {
          const fileName = asset.filename ?? `photo_${Date.now()}_${i}.jpg`;
          const contentType = mimeFromUri(asset.uri);

          // ── Step 1: presigned URL ────────────────────────────────────────
          const { uploadUrl, imageUrl, key } = await getPresignedUrl(
            fileName,
            contentType,
            `families/${family.id}`,
          );

          // ── Step 2: upload to S3 ─────────────────────────────────────────
          await uploadToS3(uploadUrl, asset.uri, contentType);

          // ── Step 3: create post record ───────────────────────────────────
          const post = await createPost({
            familyId:   family.id,
            groupId,
            childId,
            imageUrl,
            imageKey:   key,
            caption:    caption ?? undefined,
            source,
            isAiCaption,
          });

          postIds.push(post.id);
          succeeded++;
        } catch (err) {
          console.warn(`[useUpload] asset ${i} failed:`, err);
          failed++;
        }

        updateProgress(i + 1, assets.length);
        onFileComplete?.(i + 1, assets.length);
      }

      setIsUploading(false);
      if (!abortRef.current) setUploadComplete();

      return { succeeded, failed, postIds };
    },
    [family, resolveGroupId, updateProgress, setUploadComplete, setError, setIsUploading],
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { upload, abort };
}
