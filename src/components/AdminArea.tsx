import React, { useState } from 'react';
import {
  Plus,
  FolderSync,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Users,
  Video,
  Layers,
  FileText,
  Calendar,
  Settings,
  ShieldOff,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import {
  AdminTab,
  BonusItem,
  LiveClassItem,
  ModuleItem,
  PlatformSettings,
  StudentWithProgress,
  VideoItem,
} from '../types';
import {
  buildDrivePreviewUrl,
  calculateProgressStats,
  DriveRemoteFile,
  extractDriveFileId,
  PlanTier,
} from '../utils/driveUtils';
import { googleSignIn } from '../services/googleAuth';
import { ConfirmModal } from './ConfirmModal';

interface AdminAreaProps {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  token: string;
  driveAccessToken: string | null;
  onSetDriveAccessToken: (token: string) => void;
  modules: ModuleItem[];
  videos: VideoItem[];
  bonuses: BonusItem[];
  students: StudentWithProgress[];
  liveClasses: LiveClassItem[];
  settings: PlatformSettings;
  onRefreshData: () => Promise<void>;
  onPreviewVideo: (video: VideoItem) => void;
}

export const AdminArea: React.FC<AdminAreaProps> = ({
  activeTab,
  onChangeTab,
  token,
  driveAccessToken,
  onSetDriveAccessToken,
  modules,
  videos,
  bonuses,
  students,
  liveClasses,
  settings,
  onRefreshData,
  onPreviewVideo,
}) => {
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Video Form State
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoModuleId, setVideoModuleId] = useState(modules[0]?.id || 'mod-01');
  const [videoDriveLink, setVideoDriveLink] = useState('');
  const [videoThumb, setVideoThumb] = useState('');
  const [videoDuration, setVideoDuration] = useState('15:00');
  const [videoOrder, setVideoOrder] = useState<number>(1);
  const [videoEmbedAllowed, setVideoEmbedAllowed] = useState(true);
  const [videoFilterModuleId, setVideoFilterModuleId] = useState<string>('ALL');
  const [adminVisibleCount, setAdminVisibleCount] = useState<number>(25);

  // Google Drive Folder Sync State
  const [showFolderSync, setShowFolderSync] = useState(false);
  const [folderInput, setFolderInput] = useState('');
  const [syncTargetModuleId, setSyncTargetModuleId] = useState(modules[0]?.id || 'mod-01');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncPreviewResult, setSyncPreviewResult] = useState<{
    folderId: string;
    totalFound: number;
    newFiles: DriveRemoteFile[];
    skippedDuplicates: DriveRemoteFile[];
  } | null>(null);

  // Module Form State
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [modCode, setModCode] = useState('');
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modCoverUrl, setModCoverUrl] = useState('');

  // Bonus Form State
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [editingBonusId, setEditingBonusId] = useState<string | null>(null);
  const [bonusCode, setBonusCode] = useState('BONO 06');
  const [bonusTitle, setBonusTitle] = useState('');
  const [bonusDesc, setBonusDesc] = useState('');
  const [bonusCoverUrl, setBonusCoverUrl] = useState('');
  const [bonusDriveLink, setBonusDriveLink] = useState('');
  const [bonusPdfFileName, setBonusPdfFileName] = useState('');
  const [bonusPdfBase64, setBonusPdfBase64] = useState('');
  const [bonusAllowedPlans, setBonusAllowedPlans] = useState<PlanTier[]>(['COMPLETO', 'VIP']);

  // Student Form State
  const [studentSearch, setStudentSearch] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentPlan, setNewStudentPlan] = useState<PlanTier>('COMPLETO');
  const [expandedStudentBonusId, setExpandedStudentBonusId] = useState<string | null>(null);

  // Live Class & Settings State
  const [liveTitle, setLiveTitle] = useState('');
  const [liveDate, setLiveDate] = useState('');
  const [liveTime, setLiveTime] = useState('');
  const [liveInstructor, setLiveInstructor] = useState('');
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState(settings.whatsappVipUrl);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [announcement, setAnnouncement] = useState(settings.platformAnnouncement);

  // Confirmation Modal State
  const [confirmTarget, setConfirmTarget] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Error en la operación administrativa.');
    }
    return data;
  };

  // ==========================================
  // HANDLERS: VIDEOS & DRIVE SYNC
  // ==========================================

  const openNewVideoForm = () => {
    setEditingVideoId(null);
    setVideoTitle('');
    setVideoDesc('');
    setVideoModuleId(modules[0]?.id || 'mod-01');
    setVideoDriveLink('');
    setVideoThumb('');
    setVideoDuration('15:00');
    setVideoOrder(videos.filter((v) => v.moduleId === (modules[0]?.id || 'mod-01')).length + 1);
    setVideoEmbedAllowed(true);
    setShowVideoForm(true);
  };

  const openEditVideoForm = (v: VideoItem) => {
    setEditingVideoId(v.id);
    setVideoTitle(v.title);
    setVideoDesc(v.description);
    setVideoModuleId(v.moduleId);
    setVideoDriveLink(v.driveLink);
    setVideoThumb(v.thumbnailUrl || '');
    setVideoDuration(v.duration);
    setVideoOrder(v.order);
    setVideoEmbedAllowed(v.embedAllowed);
    setShowVideoForm(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVideoId) {
        await apiCall(`/api/admin/videos/${editingVideoId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: videoTitle,
            description: videoDesc,
            moduleId: videoModuleId,
            driveLink: videoDriveLink,
            thumbnailUrl: videoThumb,
            duration: videoDuration,
            order: Number(videoOrder),
            embedAllowed: videoEmbedAllowed,
          }),
        });
        notify('ok', 'Video actualizado correctamente.');
      } else {
        await apiCall('/api/admin/videos', {
          method: 'POST',
          body: JSON.stringify({
            title: videoTitle,
            description: videoDesc,
            moduleId: videoModuleId,
            driveLink: videoDriveLink,
            thumbnailUrl: videoThumb,
            duration: videoDuration,
            order: Number(videoOrder),
            embedAllowed: videoEmbedAllowed,
          }),
        });
        notify('ok', 'Video agregado a la biblioteca.');
      }
      setShowVideoForm(false);
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    }
  };

  const handleReorderVideo = async (videoId: string, direction: 'up' | 'down') => {
    try {
      await apiCall(`/api/admin/videos/${videoId}/reorder`, {
        method: 'POST',
        body: JSON.stringify({ direction }),
      });
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    }
  };

  const handleDeleteVideoRequest = (v: VideoItem) => {
    setConfirmTarget({
      title: `¿Eliminar "${v.title}"?`,
      description:
        'Esta acción eliminará la clase del módulo en Thai Elite México. El archivo original en tu Google Drive no será eliminado.',
      onConfirm: async () => {
        await apiCall(`/api/admin/videos/${v.id}`, { method: 'DELETE' });
        setConfirmTarget(null);
        notify('ok', 'Video eliminado.');
        await onRefreshData();
      },
    });
  };

  const handleConnectGoogleDrive = async () => {
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        onSetDriveAccessToken(res.accessToken);
        notify('ok', 'Cuenta de Google Drive conectada para sincronización.');
      }
    } catch (err: any) {
      notify('err', err.message || 'No se pudo autorizar Google Drive.');
    }
  };

  const handlePreviewDriveFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncLoading(true);
    setSyncPreviewResult(null);
    try {
      const data = await apiCall('/api/admin/drive/preview-folder', {
        method: 'POST',
        body: JSON.stringify({
          folderInput,
          driveAccessToken: driveAccessToken || undefined,
        }),
      });
      setSyncPreviewResult(data);
    } catch (err: any) {
      notify('err', err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleConfirmImportFolder = async () => {
    if (!syncPreviewResult || syncPreviewResult.newFiles.length === 0) return;
    setSyncLoading(true);
    try {
      const res = await apiCall('/api/admin/drive/import-files', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: syncTargetModuleId,
          files: syncPreviewResult.newFiles,
        }),
      });
      notify('ok', `Se importaron ${res.importedCount} videos reales al módulo seleccionado.`);
      setSyncPreviewResult(null);
      setFolderInput('');
      setShowFolderSync(false);
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  // ==========================================
  // HANDLERS: MODULES
  // ==========================================

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await apiCall(`/api/admin/modules/${editingModule.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            code: modCode,
            title: modTitle,
            description: modDesc,
            coverUrl: modCoverUrl,
          }),
        });
        notify('ok', 'Módulo actualizado correctamente.');
      } else {
        await apiCall('/api/admin/modules', {
          method: 'POST',
          body: JSON.stringify({
            code: modCode,
            title: modTitle,
            description: modDesc,
            coverUrl: modCoverUrl,
          }),
        });
        notify('ok', 'Nuevo módulo creado.');
      }
      setEditingModule(null);
      setModCode('');
      setModTitle('');
      setModDesc('');
      setModCoverUrl('');
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    }
  };

  // ==========================================
  // HANDLERS: BONUSES
  // ==========================================

  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBonusPdfFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      setBonusPdfBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const toggleAllowedPlan = (plan: PlanTier) => {
    setBonusAllowedPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan]
    );
  };

  const handleSaveBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: bonusCode,
        title: bonusTitle,
        description: bonusDesc,
        coverUrl: bonusCoverUrl,
        pdfDriveLink: bonusDriveLink,
        pdfFileName: bonusPdfFileName || undefined,
        pdfBase64: bonusPdfBase64 || undefined,
        allowedPlans: bonusAllowedPlans.length > 0 ? bonusAllowedPlans : ['COMPLETO', 'VIP'],
      };
      if (editingBonusId) {
        await apiCall(`/api/admin/bonuses/${editingBonusId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        notify('ok', 'Bono actualizado.');
      } else {
        await apiCall('/api/admin/bonuses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify('ok', 'Nuevo bono en PDF registrado.');
      }
      setShowBonusForm(false);
      setEditingBonusId(null);
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    }
  };

  // ==========================================
  // HANDLERS: STUDENTS
  // ==========================================

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify({
          name: newStudentName,
          email: newStudentEmail,
          password: newStudentPassword || undefined,
          plan: newStudentPlan,
        }),
      });
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentPassword('');
      notify('ok', 'Alumno registrado exitosamente.');
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    }
  };

  const handleUpdateStudent = async (
    studentId: string,
    updates: Partial<{ plan: PlanTier; blocked: boolean; unlockedBonusIds: string[] }>
  ) => {
    try {
      await apiCall(`/api/admin/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      notify('ok', 'Permisos del alumno actualizados.');
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    }
  };

  // ==========================================
  // HANDLERS: LIVE CLASSES & SETTINGS
  // ==========================================

  const handleCreateLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall('/api/admin/live-classes', {
        method: 'POST',
        body: JSON.stringify({
          title: liveTitle,
          date: liveDate,
          time: liveTime,
          instructor: liveInstructor,
          streamUrl: liveStreamUrl,
        }),
      });
      setLiveTitle('');
      setLiveDate('');
      setLiveTime('');
      setLiveInstructor('');
      setLiveStreamUrl('');
      notify('ok', 'Clase en vivo VIP registrada.');
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiCall('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          whatsappVipUrl: whatsappUrl,
          supportEmail,
          platformAnnouncement: announcement,
        }),
      });
      notify('ok', 'Configuración de la plataforma guardada.');
      await onRefreshData();
    } catch (err: any) {
      notify('err', err.message);
    }
  };

  const parsedPreviewId = extractDriveFileId(videoDriveLink);
  const videosWithoutEmbed = videos.filter((v) => !v.embedAllowed);

  return (
    <div className="space-y-8 pb-24 lg:pb-12">
      <ConfirmModal
        open={Boolean(confirmTarget)}
        title={confirmTarget?.title || ''}
        description={confirmTarget?.description || ''}
        onConfirm={() => confirmTarget?.onConfirm()}
        onCancel={() => setConfirmTarget(null)}
      />

      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'ok'
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
              : 'bg-[#E50914]/15 border-[#E50914]/50 text-red-200'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-300 hover:text-white ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ==========================================
          ADMIN TAB 1: DASHBOARD
      ========================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
                Panel de Control Administrativo
              </p>
              <h1
                className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                GESTIÓN THAI ELITE MÉXICO
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onChangeTab('videos');
                  openNewVideoForm();
                }}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ AGREGAR VIDEO</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeTab('videos');
                  setShowFolderSync(true);
                }}
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#171717] hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <FolderSync className="w-4 h-4 text-[#E50914]" />
                <span>SINCRONIZAR CARPETA</span>
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-[#171717] border border-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Total de Videos Reales</span>
                <Video className="w-4 h-4 text-[#E50914]" />
              </div>
              <div
                className="text-4xl font-extrabold text-white tabular-nums mt-2"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {videos.length}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Distribuidos en {modules.length} módulos
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#171717] border border-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Alumnos Registrados</span>
                <Users className="w-4 h-4 text-[#E50914]" />
              </div>
              <div
                className="text-4xl font-extrabold text-white tabular-nums mt-2"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {students.filter((s) => s.role === 'student').length}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Planes Esencial, Completo y VIP
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#171717] border border-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Bonos Descargables (PDF)</span>
                <FileText className="w-4 h-4 text-[#E50914]" />
              </div>
              <div
                className="text-4xl font-extrabold text-white tabular-nums mt-2"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {bonuses.length}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Descarga directa habilitada
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#171717] border border-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Clases en Vivo VIP</span>
                <Calendar className="w-4 h-4 text-[#E50914]" />
              </div>
              <div
                className="text-4xl font-extrabold text-white tabular-nums mt-2"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {liveClasses.length}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Sesiones programadas
              </div>
            </div>
          </div>

          {videosWithoutEmbed.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 space-y-1">
                <p className="font-bold">
                  Aviso de Incorporación de Google Drive ({videosWithoutEmbed.length} video/s)
                </p>
                <p>
                  Hay videos marcados sin permiso de incorporación interna. Verifica que en Google Drive tengan acceso &quot;Cualquier persona con el enlace&quot; para que los alumnos puedan reproducirlos dentro de la app.
                </p>
              </div>
            </div>
          )}

          {/* Quick Overview of Modules & Real Video Count */}
          <div className="rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl font-bold text-white uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Estado de los 10 Módulos
              </h2>
              <button
                type="button"
                onClick={() => onChangeTab('modulos')}
                className="text-xs text-[#E50914] hover:underline font-semibold cursor-pointer"
              >
                Editar módulos
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs text-neutral-400">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Nombre del Módulo</th>
                    <th className="py-3 px-3 text-right">Videos Reales</th>
                    <th className="py-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70">
                  {modules.map((m) => {
                    const count = videos.filter((v) => v.moduleId === m.id).length;
                    return (
                      <tr key={m.id} className="hover:bg-neutral-800/40">
                        <td className="py-3 px-3 font-mono text-xs text-[#E50914] font-bold tabular-nums">
                          {m.code}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">{m.title}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-neutral-300">
                          {count}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFilterModuleId(m.id);
                              onChangeTab('videos');
                            }}
                            className="text-xs text-neutral-300 hover:text-white underline cursor-pointer"
                          >
                            Administrar clases
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ADMIN TAB 2: VIDEOS & GOOGLE DRIVE SYNC
      ========================================== */}
      {activeTab === 'videos' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
                Biblioteca Conectada a Google Drive
              </p>
              <h1
                className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                ADMINISTRACIÓN DE VIDEOS
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openNewVideoForm}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ AGREGAR VIDEO</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFolderSync((prev) => !prev)}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#171717] hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <FolderSync className="w-4 h-4 text-[#E50914]" />
                <span>SINCRONIZAR CARPETA</span>
              </button>
            </div>
          </div>

          {/* SECCIÓN: GOOGLE DRIVE — SINCRONIZAR CARPETA */}
          {showFolderSync && (
            <div className="rounded-2xl bg-[#171717] border border-neutral-700 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
                <div>
                  <h2
                    className="text-2xl font-bold text-white uppercase"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Sincronizar Carpeta de Google Drive (API Oficial)
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Conecta una carpeta de Google Drive, previsualiza los videos encontrados y evita duplicados automáticamente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConnectGoogleDrive}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <span>
                    {driveAccessToken
                      ? 'Google Drive Conectado (Reconectar)'
                      : 'Autorizar Google Drive'}
                  </span>
                </button>
              </div>

              <form onSubmit={handlePreviewDriveFolder} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label
                    htmlFor="drive-folder-id"
                    className="block text-xs font-medium text-neutral-300 mb-1.5"
                  >
                    ID o Enlace de la Carpeta de Google Drive
                  </label>
                  <input
                    id="drive-folder-id"
                    type="text"
                    value={folderInput}
                    onChange={(e) => setFolderInput(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/1AbCdEf..."
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>

                <div className="md:col-span-4">
                  <label
                    htmlFor="sync-target-module"
                    className="block text-xs font-medium text-neutral-300 mb-1.5"
                  >
                    Módulo de Destino
                  </label>
                  <select
                    id="sync-target-module"
                    value={syncTargetModuleId}
                    onChange={(e) => setSyncTargetModuleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={syncLoading}
                    className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {syncLoading ? 'Consultando Drive...' : 'Buscar Videos en Carpeta'}
                  </button>
                </div>
              </form>

              {syncPreviewResult && (
                <div className="p-4 rounded-xl bg-[#090909] border border-neutral-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-white font-bold">
                      Carpeta analizada ({syncPreviewResult.folderId}):{' '}
                      {syncPreviewResult.newFiles.length} videos nuevos listos para importar
                    </span>
                    <span className="text-neutral-400">
                      Duplicados omitidos: {syncPreviewResult.skippedDuplicates.length}
                    </span>
                  </div>

                  {syncPreviewResult.newFiles.length > 0 ? (
                    <>
                      <div className="max-h-52 overflow-y-auto divide-y divide-neutral-800 text-xs">
                        {syncPreviewResult.newFiles.map((f) => (
                          <div key={f.id} className="py-2 flex items-center justify-between gap-4">
                            <span className="text-neutral-200 font-medium truncate">{f.name}</span>
                            <span className="font-mono text-neutral-500 shrink-0">{f.id}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleConfirmImportFolder}
                          disabled={syncLoading}
                          className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Confirmar e Importar {syncPreviewResult.newFiles.length} Videos
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-neutral-400">
                      No se encontraron videos nuevos sin importar en esta carpeta.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FORMULARIO: + AGREGAR / EDITAR VIDEO */}
          {showVideoForm && (
            <div className="rounded-2xl bg-[#171717] border border-neutral-700 p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <h2
                  className="text-2xl font-bold text-white uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {editingVideoId ? 'Editar Video' : '+ Agregar Nuevo Video'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowVideoForm(false)}
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label
                      htmlFor="video-title"
                      className="block text-xs font-medium text-neutral-300 mb-1"
                    >
                      Título del Video
                    </label>
                    <input
                      id="video-title"
                      type="text"
                      required
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Ej. Clase 04: Combinación Doble Jab + Low Kick"
                      className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="video-module"
                        className="block text-xs font-medium text-neutral-300 mb-1"
                      >
                        Módulo
                      </label>
                      <select
                        id="video-module"
                        value={videoModuleId}
                        onChange={(e) => setVideoModuleId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                      >
                        {modules.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.code} - {m.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="video-order"
                        className="block text-xs font-medium text-neutral-300 mb-1"
                      >
                        Orden de la Clase
                      </label>
                      <input
                        id="video-order"
                        type="number"
                        min={1}
                        value={videoOrder}
                        onChange={(e) => setVideoOrder(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="video-drive-link"
                      className="block text-xs font-medium text-neutral-300 mb-1"
                    >
                      Link de Google Drive (o ID del archivo)
                    </label>
                    <input
                      id="video-drive-link"
                      type="text"
                      required
                      value={videoDriveLink}
                      onChange={(e) => setVideoDriveLink(e.target.value)}
                      placeholder="https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view"
                      className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                    />
                    {videoDriveLink && (
                      <p className="mt-1 text-xs text-neutral-400">
                        {parsedPreviewId ? (
                          <span className="text-emerald-400">
                            ID detectado automáticamente: {parsedPreviewId}
                          </span>
                        ) : (
                          <span className="text-[#E50914]">
                            Enlace inválido. Asegúrate de pegar un enlace de archivo de Google Drive.
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="video-duration"
                        className="block text-xs font-medium text-neutral-300 mb-1"
                      >
                        Duración
                      </label>
                      <input
                        id="video-duration"
                        type="text"
                        value={videoDuration}
                        onChange={(e) => setVideoDuration(e.target.value)}
                        placeholder="15:30"
                        className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="video-thumb"
                        className="block text-xs font-medium text-neutral-300 mb-1"
                      >
                        Miniatura (URL opcional)
                      </label>
                      <input
                        id="video-thumb"
                        type="url"
                        value={videoThumb}
                        onChange={(e) => setVideoThumb(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="video-desc"
                      className="block text-xs font-medium text-neutral-300 mb-1"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="video-desc"
                      rows={3}
                      value={videoDesc}
                      onChange={(e) => setVideoDesc(e.target.value)}
                      placeholder="Explica los puntos técnicos clave de esta clase..."
                      className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
                    />
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={videoEmbedAllowed}
                      onChange={(e) => setVideoEmbedAllowed(e.target.checked)}
                      className="rounded border-neutral-700"
                    />
                    <span>
                      El video permite incorporación en reproductor interno de Google Drive
                    </span>
                  </label>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-3 min-h-[46px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVideoForm(false)}
                      className="px-5 py-3 min-h-[46px] rounded-xl bg-[#090909] hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                {/* Live Preview Before Publishing */}
                <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-[#090909] border border-neutral-800 space-y-3">
                  <div>
                    <div className="text-xs font-bold text-white uppercase">
                      Vista Previa antes de Publicar
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Verifica cómo verá el alumno el reproductor integrado de Google Drive.
                    </p>
                  </div>

                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#171717] border border-neutral-800 flex items-center justify-center">
                    {parsedPreviewId && videoEmbedAllowed ? (
                      <iframe
                        src={buildDrivePreviewUrl(parsedPreviewId)}
                        title="Vista previa de Google Drive"
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen"
                      />
                    ) : (
                      <div className="p-4 text-center text-xs text-neutral-500">
                        {!videoEmbedAllowed
                          ? 'Aviso: Has marcado este video como NO incorporable. Se mostrará una alerta en el panel.'
                          : 'Pega un enlace válido de Google Drive para previsualizar el reproductor.'}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-neutral-400">
                    Reproductor configurado con URL oficial <code>/file/d/ID/preview</code>.
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Filter & Video List Table */}
          <div className="rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2
                className="text-2xl font-bold text-white uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Videos Registrados ({videos.length})
              </h2>

              <select
                value={videoFilterModuleId}
                onChange={(e) => {
                  setVideoFilterModuleId(e.target.value);
                  setAdminVisibleCount(25);
                }}
                aria-label="Filtrar videos por módulo"
                className="px-3.5 py-2 min-h-[40px] bg-[#090909] border border-neutral-800 rounded-xl text-xs text-white"
              >
                <option value="ALL">Todos los Módulos ({videos.length})</option>
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Módulo {m.code}: {m.title} ({videos.filter((v) => v.moduleId === m.id).length})
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const filteredAdminVideos = videos.filter(
                (v) => videoFilterModuleId === 'ALL' || v.moduleId === videoFilterModuleId
              );
              const displayedAdminVideos = filteredAdminVideos.slice(0, adminVisibleCount);
              return (
                <>
                  <div className="space-y-3">
                    {displayedAdminVideos.map((vid) => {
                      const mod = modules.find((m) => m.id === vid.moduleId);
                      return (
                        <div
                          key={vid.id}
                          className="p-4 rounded-xl bg-[#090909] border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                              <span className="text-[#E50914] font-bold">
                                {mod ? `Módulo ${mod.code}` : vid.moduleId}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">Orden #{vid.order}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{vid.duration}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-neutral-500">ID: {vid.driveFileId}</span>
                              {!vid.embedAllowed && (
                                <span className="text-amber-400 font-semibold flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Incorporación restringida</span>
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-white truncate">{vid.title}</h3>
                            <p className="text-xs text-neutral-400 line-clamp-1">{vid.description}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => onPreviewVideo(vid)}
                              className="px-3 py-2 min-h-[40px] rounded-lg bg-[#171717] hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#E50914]" />
                              <span>Previsualizar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReorderVideo(vid.id, 'up')}
                              aria-label={`Subir orden de ${vid.title}`}
                              className="min-w-[40px] min-h-[40px] rounded-lg bg-[#171717] hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReorderVideo(vid.id, 'down')}
                              aria-label={`Bajar orden de ${vid.title}`}
                              className="min-w-[40px] min-h-[40px] rounded-lg bg-[#171717] hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditVideoForm(vid)}
                              aria-label={`Editar ${vid.title}`}
                              className="min-w-[40px] min-h-[40px] rounded-lg bg-[#171717] hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteVideoRequest(vid)}
                              aria-label={`Eliminar ${vid.title}`}
                              className="min-w-[40px] min-h-[40px] rounded-lg bg-[#171717] hover:bg-[#E50914]/20 border border-neutral-800 flex items-center justify-center text-[#E50914] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredAdminVideos.length > adminVisibleCount && (
                    <div className="pt-3 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdminVisibleCount((prev) => prev + 50)}
                        className="px-5 py-2.5 min-h-[42px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Mostrar más videos ({displayedAdminVideos.length} de {filteredAdminVideos.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminVisibleCount(filteredAdminVideos.length)}
                        className="px-4 py-2.5 min-h-[42px] rounded-xl bg-[#090909] hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Ver todos ({filteredAdminVideos.length})
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==========================================
          ADMIN TAB 3: MÓDULOS
      ========================================== */}
      {activeTab === 'modulos' && (
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
              Estructura Académica
            </p>
            <h1
              className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              ORGANIZACIÓN DE MÓDULOS ({modules.length})
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Module Form */}
            <div className="lg:col-span-5 rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4 h-fit">
              <h2
                className="text-xl font-bold text-white uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {editingModule ? `Editar Módulo ${editingModule.code}` : 'Crear Nuevo Módulo'}
              </h2>
              <form onSubmit={handleSaveModule} className="space-y-4">
                <div>
                  <label htmlFor="mod-code" className="block text-xs text-neutral-300 mb-1">
                    Número / Código
                  </label>
                  <input
                    id="mod-code"
                    type="text"
                    value={modCode}
                    onChange={(e) => setModCode(e.target.value)}
                    placeholder="Ej. 11"
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label htmlFor="mod-title" className="block text-xs text-neutral-300 mb-1">
                    Nombre del Módulo
                  </label>
                  <input
                    id="mod-title"
                    type="text"
                    required
                    value={modTitle}
                    onChange={(e) => setModTitle(e.target.value)}
                    placeholder="Ej. Sparring Técnico Controlado"
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label htmlFor="mod-desc" className="block text-xs text-neutral-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="mod-desc"
                    rows={3}
                    value={modDesc}
                    onChange={(e) => setModDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label htmlFor="mod-cover" className="block text-xs text-neutral-300 mb-1">
                    URL de Portada (Opcional)
                  </label>
                  <input
                    id="mod-cover"
                    type="url"
                    value={modCoverUrl}
                    onChange={(e) => setModCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {editingModule ? 'Actualizar Módulo' : 'Guardar Módulo'}
                  </button>
                  {editingModule && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModule(null);
                        setModCode('');
                        setModTitle('');
                        setModDesc('');
                        setModCoverUrl('');
                      }}
                      className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#090909] border border-neutral-800 text-xs text-neutral-300 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Modules List */}
            <div className="lg:col-span-7 space-y-3">
              {modules.map((m) => {
                const count = videos.filter((v) => v.moduleId === m.id).length;
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-[#171717] border border-neutral-800 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#E50914]">MÓDULO {m.code}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-neutral-400 tabular-nums">{count} videos reales</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{m.title}</h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5">
                        {m.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModule(m);
                        setModCode(m.code);
                        setModTitle(m.title);
                        setModDesc(m.description);
                        setModCoverUrl(m.coverUrl || '');
                      }}
                      className="px-3.5 py-2 min-h-[40px] rounded-xl bg-[#090909] hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-white flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ADMIN TAB 4: BONOS (PDFs)
      ========================================== */}
      {activeTab === 'bonos' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
                Materiales Descargables en PDF
              </p>
              <h1
                className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                GERENCIAMIENTO DE BONOS
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingBonusId(null);
                setBonusCode(`BONO 0${bonuses.length + 1}`);
                setBonusTitle('');
                setBonusDesc('');
                setBonusCoverUrl('');
                setBonusDriveLink('');
                setBonusPdfFileName('');
                setBonusPdfBase64('');
                setBonusAllowedPlans(['COMPLETO', 'VIP']);
                setShowBonusForm(true);
              }}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ AGREGAR BONO</span>
            </button>
          </div>

          {showBonusForm && (
            <div className="rounded-2xl bg-[#171717] border border-neutral-700 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h2
                  className="text-2xl font-bold text-white uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {editingBonusId ? 'Editar Bono PDF' : '+ Agregar Bono PDF'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowBonusForm(false)}
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <form onSubmit={handleSaveBonus} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bonus-code" className="block text-xs text-neutral-300 mb-1">
                    Código del Bono
                  </label>
                  <input
                    id="bonus-code"
                    type="text"
                    value={bonusCode}
                    onChange={(e) => setBonusCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="bonus-title" className="block text-xs text-neutral-300 mb-1">
                    Título del Bono
                  </label>
                  <input
                    id="bonus-title"
                    type="text"
                    required
                    value={bonusTitle}
                    onChange={(e) => setBonusTitle(e.target.value)}
                    placeholder="Ej. Guía de Nutrición y Corte de Peso"
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="bonus-desc" className="block text-xs text-neutral-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    id="bonus-desc"
                    rows={2}
                    value={bonusDesc}
                    onChange={(e) => setBonusDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="bonus-pdf-upload" className="block text-xs text-neutral-300 mb-1">
                    Subir Archivo PDF Real (Opcional)
                  </label>
                  <label className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-xs text-neutral-300 flex items-center gap-2 cursor-pointer hover:border-neutral-600">
                    <Upload className="w-4 h-4 text-[#E50914]" />
                    <span className="truncate">
                      {bonusPdfFileName || 'Seleccionar archivo .PDF desde tu equipo'}
                    </span>
                    <input
                      id="bonus-pdf-upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label htmlFor="bonus-drive-link" className="block text-xs text-neutral-300 mb-1">
                    O Enlace de PDF en Google Drive
                  </label>
                  <input
                    id="bonus-drive-link"
                    type="url"
                    value={bonusDriveLink}
                    onChange={(e) => setBonusDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="bonus-cover" className="block text-xs text-neutral-300 mb-1">
                    URL de Portada (Opcional)
                  </label>
                  <input
                    id="bonus-cover"
                    type="url"
                    value={bonusCoverUrl}
                    onChange={(e) => setBonusCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <span className="block text-xs text-neutral-300 mb-1.5">
                    Planes con Acceso a este Bono
                  </span>
                  <div className="flex items-center gap-3">
                    {(['ESENCIAL', 'COMPLETO', 'VIP'] as PlanTier[]).map((plan) => (
                      <label
                        key={plan}
                        className="flex items-center gap-1.5 text-xs text-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={bonusAllowedPlans.includes(plan)}
                          onChange={() => toggleAllowedPlan(plan)}
                        />
                        <span>{plan}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Guardar Bono
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBonusForm(false)}
                    className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#090909] border border-neutral-800 text-xs text-neutral-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bonuses.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-[#171717] border border-neutral-800 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#E50914]">{b.code}</span>
                    <span className="text-neutral-400">
                      Planes: {b.allowedPlans.join(', ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{b.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{b.description}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBonusId(b.id);
                      setBonusCode(b.code);
                      setBonusTitle(b.title);
                      setBonusDesc(b.description);
                      setBonusCoverUrl(b.coverUrl || '');
                      setBonusDriveLink(b.pdfDriveLink || '');
                      setBonusPdfFileName(b.pdfFileName || '');
                      setBonusAllowedPlans(b.allowedPlans);
                      setShowBonusForm(true);
                    }}
                    className="px-3.5 py-2 min-h-[40px] rounded-lg bg-[#090909] hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmTarget({
                        title: `¿Eliminar ${b.code}: ${b.title}?`,
                        description:
                          'Los alumnos ya no podrán descargar este bono desde su área de miembros.',
                        onConfirm: async () => {
                          await apiCall(`/api/admin/bonuses/${b.id}`, { method: 'DELETE' });
                          setConfirmTarget(null);
                          notify('ok', 'Bono eliminado.');
                          await onRefreshData();
                        },
                      })
                    }
                    className="px-3.5 py-2 min-h-[40px] rounded-lg bg-[#090909] hover:bg-[#E50914]/20 border border-neutral-800 text-xs font-semibold text-[#E50914] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          ADMIN TAB 5: ALUMNOS
      ========================================== */}
      {activeTab === 'alumnos' && (
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
              Control de Acceso y Planes
            </p>
            <h1
              className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              GERENCIAMIENTO DE ALUMNOS
            </h1>
          </div>

          {/* Register New Student Form */}
          <div className="rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4">
            <h2
              className="text-xl font-bold text-white uppercase"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Registrar Nuevo Alumno
            </h2>
            <form onSubmit={handleCreateStudent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label htmlFor="stu-name" className="block text-xs text-neutral-300 mb-1">
                  Nombre del Alumno
                </label>
                <input
                  id="stu-name"
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ej. Roberto Silva"
                  className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="stu-email" className="block text-xs text-neutral-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  id="stu-email"
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="alumno@correo.com"
                  className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="stu-pass" className="block text-xs text-neutral-300 mb-1">
                  Contraseña Inicial (Opcional)
                </label>
                <input
                  id="stu-pass"
                  type="password"
                  value={newStudentPassword}
                  onChange={(e) => setNewStudentPassword(e.target.value)}
                  placeholder="Mín. 6 caracteres"
                  className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="stu-plan" className="block text-xs text-neutral-300 mb-1">
                  Plan Asignado
                </label>
                <select
                  id="stu-plan"
                  value={newStudentPlan}
                  onChange={(e) => setNewStudentPlan(e.target.value as PlanTier)}
                  className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                >
                  <option value="ESENCIAL">ESENCIAL (500 videos)</option>
                  <option value="COMPLETO">COMPLETO (500 videos + 5 bonos)</option>
                  <option value="VIP">VIP (Videos + Bonos + En Vivo)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Registrar Alumno
              </button>
            </form>
          </div>

          {/* Student List & Controls */}
          <div className="rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2
                className="text-2xl font-bold text-white uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                 Padrón de Alumnos ({students.length})
              </h2>
              <input
                type="search"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                aria-label="Buscar alumno por nombre o correo"
                className="w-full sm:w-72 px-3.5 py-2 bg-[#090909] border border-neutral-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="space-y-3">
              {students
                .filter((s) => {
                  if (!studentSearch.trim()) return true;
                  const q = studentSearch.toLowerCase();
                  return (
                    s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
                  );
                })
                .map((stu) => {
                  const stuStats = calculateProgressStats(
                    stu.progress?.completedVideoIds || [],
                    videos,
                    modules
                  );
                  const isBonusPanelOpen = expandedStudentBonusId === stu.id;

                  return (
                    <div
                      key={stu.id}
                      className="p-4 rounded-xl bg-[#090909] border border-neutral-800 space-y-3"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-white">{stu.name}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-neutral-400">{stu.email}</span>
                            {stu.role === 'admin' && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#E50914] font-bold">ADMIN</span>
                              </>
                            )}
                            {stu.blocked && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-red-400 font-bold">BLOQUEADO</span>
                              </>
                            )}
                          </div>
                          <div className="mt-1.5 flex items-center gap-3 text-xs text-neutral-400 tabular-nums">
                            <span>
                              Progreso: <strong className="text-white">{stuStats.percentage}%</strong> ({stuStats.completedCount}/{stuStats.totalCount} clases)
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              Bonos liberados individuales: {stu.unlockedBonusIds?.length || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <select
                            aria-label={`Plan de ${stu.name}`}
                            value={stu.plan}
                            onChange={(e) =>
                              handleUpdateStudent(stu.id, { plan: e.target.value as PlanTier })
                            }
                            className="px-3 py-2 min-h-[40px] rounded-lg bg-[#171717] border border-neutral-800 text-xs font-bold text-white"
                          >
                            <option value="ESENCIAL">PLAN ESENCIAL</option>
                            <option value="COMPLETO">PLAN COMPLETO</option>
                            <option value="VIP">PLAN VIP</option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedStudentBonusId(isBonusPanelOpen ? null : stu.id)
                            }
                            className="px-3 py-2 min-h-[40px] rounded-lg bg-[#171717] hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-white cursor-pointer"
                          >
                            Liberar Bonos
                          </button>

                          {stu.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStudent(stu.id, { blocked: !stu.blocked })
                              }
                              className={`px-3 py-2 min-h-[40px] rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                                stu.blocked
                                  ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                                  : 'bg-[#171717] border-neutral-800 text-red-400 hover:bg-red-950/30'
                              }`}
                            >
                              {stu.blocked ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Desbloquear</span>
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="w-3.5 h-3.5" />
                                  <span>Bloquear Acceso</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {isBonusPanelOpen && (
                        <div className="pt-3 border-t border-neutral-800 flex flex-wrap items-center gap-3">
                          <span className="text-xs text-neutral-400">
                            Liberar bonos específicos para {stu.name}:
                          </span>
                          {bonuses.map((b) => {
                            const unlocked = (stu.unlockedBonusIds || []).includes(b.id);
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  const current = stu.unlockedBonusIds || [];
                                  const updated = unlocked
                                    ? current.filter((id) => id !== b.id)
                                    : [...current, b.id];
                                  handleUpdateStudent(stu.id, { unlockedBonusIds: updated });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                  unlocked
                                    ? 'bg-[#E50914] border-[#E50914] text-white'
                                    : 'bg-[#171717] border-neutral-800 text-neutral-400'
                                }`}
                              >
                                {b.code} {unlocked ? '✓' : '+'}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ADMIN TAB 6: CONFIGURACIÓN Y CLASES EN VIVO VIP
      ========================================== */}
      {activeTab === 'configuracion' && (
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
              Clases en Vivo VIP y Ajustes Generales
            </p>
            <h1
              className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              CLASES EN VIVO VIP Y CONFIGURACIÓN
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Schedule VIP Live Class */}
            <div className="lg:col-span-7 rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-5">
              <h2
                className="text-2xl font-bold text-white uppercase"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Programar Clase en Vivo (Exclusivo Alumnos VIP)
              </h2>

              <form onSubmit={handleCreateLiveClass} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="live-title" className="block text-xs text-neutral-300 mb-1">
                    Título de la Clase
                  </label>
                  <input
                    id="live-title"
                    type="text"
                    required
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    placeholder="Ej. Clínica en Vivo: Timing de Contraataque y Clinch"
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="live-date" className="block text-xs text-neutral-300 mb-1">
                    Fecha
                  </label>
                  <input
                    id="live-date"
                    type="date"
                    required
                    value={liveDate}
                    onChange={(e) => setLiveDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="live-time" className="block text-xs text-neutral-300 mb-1">
                    Horario (CDMX)
                  </label>
                  <input
                    id="live-time"
                    type="time"
                    required
                    value={liveTime}
                    onChange={(e) => setLiveTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="live-instructor" className="block text-xs text-neutral-300 mb-1">
                    Instructor
                  </label>
                  <input
                    id="live-instructor"
                    type="text"
                    required
                    value={liveInstructor}
                    onChange={(e) => setLiveInstructor(e.target.value)}
                    placeholder="Ej. Kru Alejandro Morales"
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="live-url" className="block text-xs text-neutral-300 mb-1">
                    Link de la Transmisión (Meet / Zoom / YouTube Live)
                  </label>
                  <input
                    id="live-url"
                    type="url"
                    required
                    value={liveStreamUrl}
                    onChange={(e) => setLiveStreamUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div className="sm:col-span-2 pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Registrar Clase en Vivo
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase">
                  Clases en Vivo Programadas ({liveClasses.length})
                </h3>
                {liveClasses.length > 0 ? (
                  liveClasses.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-[#090909] border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs text-[#E50914] font-semibold tabular-nums">
                          {c.date} · {c.time} hrs · {c.instructor}
                        </div>
                        <div className="text-sm font-bold text-white">{c.title}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmTarget({
                            title: `¿Eliminar la clase "${c.title}"?`,
                            description: 'La sesión será removida del calendario VIP.',
                            onConfirm: async () => {
                              await apiCall(`/api/admin/live-classes/${c.id}`, {
                                method: 'DELETE',
                              });
                              setConfirmTarget(null);
                              notify('ok', 'Clase en vivo eliminada.');
                              await onRefreshData();
                            },
                          })
                        }
                        aria-label={`Eliminar clase ${c.title}`}
                        className="min-w-[40px] min-h-[40px] rounded-lg bg-[#171717] text-[#E50914] flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400">
                    No hay clases en vivo registradas. Utiliza el formulario superior para programar sesiones reales.
                  </p>
                )}
              </div>
            </div>

            {/* Platform Settings */}
            <div className="lg:col-span-5 rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4 h-fit">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#E50914]" />
                <h2
                  className="text-2xl font-bold text-white uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Ajustes de Comunidad
                </h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label htmlFor="set-whatsapp" className="block text-xs text-neutral-300 mb-1">
                    Link del Grupo VIP de WhatsApp
                  </label>
                  <input
                    id="set-whatsapp"
                    type="url"
                    value={whatsappUrl}
                    onChange={(e) => setWhatsappUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="set-support" className="block text-xs text-neutral-300 mb-1">
                    Correo de Soporte Oficial
                  </label>
                  <input
                    id="set-support"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="set-banner" className="block text-xs text-neutral-300 mb-1">
                    Título del Banner Principal (Área del Alumno)
                  </label>
                  <input
                    id="set-banner"
                    type="text"
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Guardar Configuración
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
