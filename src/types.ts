import { PlanTier } from './utils/driveUtils';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  plan: PlanTier;
  blocked: boolean;
  unlockedBonusIds: string[];
  createdAt: string;
}

export interface ModuleItem {
  id: string;
  code: string;
  title: string;
  description: string;
  coverTheme: string;
  coverUrl?: string;
  order: number;
}

export interface VideoItem {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: string;
  driveLink: string;
  driveFileId: string;
  thumbnailUrl?: string;
  order: number;
  embedAllowed: boolean;
  createdAt: string;
}

export interface BonusItem {
  id: string;
  code: string;
  title: string;
  description: string;
  coverTheme: string;
  coverUrl?: string;
  pdfDriveLink?: string;
  pdfFileName?: string;
  allowedPlans: PlanTier[];
  contentSections: string[];
  createdAt: string;
  hasAccess: boolean;
}

export interface UserProgress {
  userId: string;
  completedVideoIds: string[];
  favoriteVideoIds: string[];
  lastWatchedVideoId: string | null;
  updatedAt: string;
}

export interface LiveClassItem {
  id: string;
  title: string;
  date: string;
  time: string;
  instructor: string;
  streamUrl: string;
  createdAt: string;
}

export interface PlatformSettings {
  whatsappVipUrl: string;
  supportEmail: string;
  platformAnnouncement: string;
}

export interface StudentWithProgress extends UserProfile {
  progress: UserProgress;
}

export interface BootstrapPayload {
  user: UserProfile;
  modules: ModuleItem[];
  videos: VideoItem[];
  bonuses: BonusItem[];
  progress: UserProgress;
  liveClasses: LiveClassItem[];
  vipAllowed: boolean;
  settings: PlatformSettings;
  adminData: {
    students: StudentWithProgress[];
  } | null;
}

export type StudentTab = 'inicio' | 'entrenamientos' | 'bonos' | 'progreso' | 'perfil';
export type AdminTab = 'dashboard' | 'videos' | 'modulos' | 'bonos' | 'alumnos' | 'configuracion';
