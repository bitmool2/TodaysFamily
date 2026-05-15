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
  errorMessage?: string;
}

/** 자동 업로드 한 번에 최대 처리 가능 장수 */
export const AUTO_UPLOAD_MAX_COUNT = 5;

/**
 * Orchestrates the full upload pipeline for one batch of assets:
 *   1. GET presigned URL from backend
 *   2. PUT file bytes directly to S3
 *   3. POST /posts to persist the record in the DB
 *
 * Assets are uploaded sequentially so progress feedback stays accurate.
 * A single asset failure does not abort the whole batch.
 * Auto-upload batches are capped at AUTO_UPLOAD_MAX_COUNT assets.
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
        assets: rawAssets, groupType, source,
        caption, isAiCaption = false, childId,
        onFileComplete,
      } = opts;

      // 자동 업로드 소스인 경우 최근 5장으로 제한
      const isAutoUpload = source === 'GALLERY' || source === 'KIDSNOTE';
      const assets = isAutoUpload && rawAssets.length > AUTO_UPLOAD_MAX_COUNT
        ? rawAssets.slice(0, AUTO_UPLOAD_MAX_COUNT)
        : rawAssets;

      if (!family) {
        const msg = '가족 그룹이 아직 설정되지 않았어요. 설정 > 가족 그룹 관리에서 먼저 가족을 등록해 주세요.';
        setError(msg);
        return { succeeded: 0, failed: assets.length, postIds: [], errorMessage: msg };
      }

      const groupId = resolveGroupId(groupType);
      if (!groupId) {
        const msg = '선택한 그룹에 등록된 가족이 없습니다. 가족 탭에서 해당 그룹에 가족을 먼저 등록해 주세요.';
        setError(msg);
        return { succeeded: 0, failed: assets.length, postIds: [], errorMessage: msg };
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
