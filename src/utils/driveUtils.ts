export interface SimpleVideoItem {
  id: string;
  moduleId: string;
  driveFileId?: string;
}

export interface SimpleModuleItem {
  id: string;
  code: string;
  title: string;
}

export interface ModuleProgressStat {
  moduleId: string;
  code: string;
  title: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface OverallProgressResult {
  completedCount: number;
  totalCount: number;
  percentage: number;
  byModule: ModuleProgressStat[];
}

export type PlanTier = 'ESENCIAL' | 'COMPLETO' | 'VIP';

export interface AccessUser {
  role: 'admin' | 'student';
  plan: PlanTier;
  blocked?: boolean;
  unlockedBonusIds?: string[];
}

export interface AccessBonus {
  id: string;
  allowedPlans: PlanTier[];
}

export interface DriveRemoteFile {
  id: string;
  name: string;
  mimeType?: string;
  Embeddable?: boolean;
  capabilities?: {
    canCopy?: boolean;
    canDownload?: boolean;
  };
}

/**
 * Extracts a Google Drive File ID from various Google Drive link formats or raw ID.
 */
export function extractDriveFileId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match /file/d/<ID> or /d/<ID>
  const filePathMatch = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{10,})/);
  if (filePathMatch && filePathMatch[1]) {
    return filePathMatch[1];
  }

  // Match ?id=<ID> or &id=<ID>
  const queryIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (queryIdMatch && queryIdMatch[1]) {
    return queryIdMatch[1];
  }

  // Match raw ID (alphanumeric, dashes, underscores, 15-64 chars, no slashes or spaces)
  if (/^[a-zA-Z0-9_-]{15,64}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Extracts a Google Drive Folder ID from folder link formats or raw ID.
 */
export function extractDriveFolderId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match /folders/<ID>
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  // Match ?id=<ID>
  const queryIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (queryIdMatch && queryIdMatch[1]) {
    return queryIdMatch[1];
  }

  if (/^[a-zA-Z0-9_-]{15,64}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Builds the official Google Drive embedded preview URL for internal playback.
 * Never uses download URLs for video playback.
 */
export function buildDrivePreviewUrl(fileIdOrUrl: string): string {
  const fileId = extractDriveFileId(fileIdOrUrl);
  if (!fileId) return '';
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Builds a direct download URL for Google Drive PDFs/files when applicable.
 */
export function buildDriveDownloadUrl(fileIdOrUrl: string): string {
  const fileId = extractDriveFileId(fileIdOrUrl);
  if (!fileId) return fileIdOrUrl.trim();
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Calculates student completion percentage and per-module stats.
 */
export function calculateProgressStats(
  completedVideoIds: string[],
  allVideos: SimpleVideoItem[],
  modules: SimpleModuleItem[]
): OverallProgressResult {
  const validVideoIds = new Set(allVideos.map((v) => v.id));
  const uniqueCompleted = new Set(
    (completedVideoIds || []).filter((id) => validVideoIds.has(id))
  );

  const totalCount = allVideos.length;
  const completedCount = uniqueCompleted.size;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const byModule: ModuleProgressStat[] = modules.map((mod) => {
    const moduleVideos = allVideos.filter((v) => v.moduleId === mod.id);
    const modTotal = moduleVideos.length;
    const modCompleted = moduleVideos.filter((v) =>
      uniqueCompleted.has(v.id)
    ).length;
    const modPct =
      modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;

    return {
      moduleId: mod.id,
      code: mod.code,
      title: mod.title,
      completedCount: modCompleted,
      totalCount: modTotal,
      percentage: modPct,
    };
  });

  return {
    completedCount,
    totalCount,
    percentage,
    byModule,
  };
}

/**
 * Checks whether a user has permission to access/download a specific bonus.
 */
export function canAccessBonus(user: AccessUser, bonus: AccessBonus): boolean {
  if (!user || user.blocked) return false;
  if (user.role === 'admin') return true;
  if (
    Array.isArray(user.unlockedBonusIds) &&
    user.unlockedBonusIds.includes(bonus.id)
  ) {
    return true;
  }
  return bonus.allowedPlans.includes(user.plan);
}

/**
 * Checks whether a user can access the VIP live classes section.
 */
export function canAccessVipClasses(user: AccessUser): boolean {
  if (!user || user.blocked) return false;
  if (user.role === 'admin') return true;
  return user.plan === 'VIP';
}

/**
 * Filters candidate files from a Google Drive folder sync to avoid duplicates
 * and keep only valid video files.
 */
export function filterNonDuplicateDriveFiles(
  incomingFiles: DriveRemoteFile[],
  existingDriveIds: string[]
): {
  newFiles: DriveRemoteFile[];
  skippedDuplicates: DriveRemoteFile[];
} {
  const existingSet = new Set(existingDriveIds.map((id) => id.trim()));
  const seenInBatch = new Set<string>();
  const newFiles: DriveRemoteFile[] = [];
  const skippedDuplicates: DriveRemoteFile[] = [];

  for (const file of incomingFiles) {
    if (!file || !file.id) continue;
    const isVideo =
      !file.mimeType ||
      file.mimeType.startsWith('video/') ||
      /\.(mp4|mov|mkv|webm|m4v|avi)$/i.test(file.name);

    if (!isVideo) continue;

    if (existingSet.has(file.id) || seenInBatch.has(file.id)) {
      skippedDuplicates.push(file);
    } else {
      seenInBatch.add(file.id);
      newFiles.push(file);
    }
  }

  return { newFiles, skippedDuplicates };
}
