import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Bookmark,
  Download,
  Lock,
  Search,
  Calendar,
  ExternalLink,
  MessageCircle,
  Clock,
  ChevronRight,
  Award,
  Video,
  BookOpen,
  X,
  FileText,
  CreditCard,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import {
  BonusItem,
  LiveClassItem,
  ModuleItem,
  PlatformSettings,
  StudentTab,
  UserProfile,
  UserProgress,
  VideoItem,
} from '../types';
import { MuayThaiArtwork } from './MuayThaiArtwork';
import { OverallProgressResult } from '../utils/driveUtils';
import {
  getSpanishBonusManual,
  triggerSpanishBonusPdfDownload,
} from '../utils/spanishBonusPdf';

interface StudentAreaProps {
  activeTab: StudentTab;
  onChangeTab: (tab: StudentTab) => void;
  user: UserProfile;
  token: string;
  modules: ModuleItem[];
  videos: VideoItem[];
  bonuses: BonusItem[];
  progress: UserProgress;
  progressStats: OverallProgressResult;
  liveClasses: LiveClassItem[];
  vipAllowed: boolean;
  settings: PlatformSettings;
  onPlayVideo: (video: VideoItem) => void;
  onToggleComplete: (videoId: string) => void;
  onToggleFavorite: (videoId: string) => void;
  onUpdateProfile: (name: string, newPassword?: string) => Promise<void>;
}

export const StudentArea: React.FC<StudentAreaProps> = ({
  activeTab,
  onChangeTab,
  user,
  token,
  modules,
  videos,
  bonuses,
  progress,
  progressStats,
  liveClasses,
  vipAllowed,
  settings,
  onPlayVideo,
  onToggleComplete,
  onToggleFavorite,
  onUpdateProfile,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleVideoCount, setVisibleVideoCount] = useState<number>(12);
  const [profileName, setProfileName] = useState(user.name);
  const [newPassword, setNewPassword] = useState('');
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [downloadingBonusId, setDownloadingBonusId] = useState<string | null>(null);
  const [readingBonus, setReadingBonus] = useState<BonusItem | null>(null);
  const [lastDownloadedBonusId, setLastDownloadedBonusId] = useState<string | null>(null);

  const continueVideo =
    videos.find((v) => v.id === progress.lastWatchedVideoId) ||
    videos.find((v) => !progress.completedVideoIds.includes(v.id)) ||
    videos[0] ||
    null;

  const recentVideos = [...videos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const handleStartTraining = () => {
    if (continueVideo) {
      onPlayVideo(continueVideo);
    } else {
      onChangeTab('entrenamientos');
    }
  };

  const handleDownloadBonus = async (bonus: BonusItem) => {
    if (!bonus.hasAccess) return;
    setDownloadingBonusId(bonus.id);
    try {
      triggerSpanishBonusPdfDownload(bonus);
      setLastDownloadedBonusId(bonus.id);
      setTimeout(() => {
        setLastDownloadedBonusId((prev) => (prev === bonus.id ? null : prev));
      }, 4000);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      setDownloadingBonusId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    try {
      await onUpdateProfile(profileName, newPassword || undefined);
      setNewPassword('');
      setProfileStatus('Tus datos han sido actualizados correctamente.');
    } catch (err: any) {
      setProfileStatus(err.message || 'No se pudo actualizar el perfil.');
    }
  };

  // ==========================================
  // TAB 1: INICIO (DASHBOARD DEL ALUMNO)
  // ==========================================
  if (activeTab === 'inicio') {
    return (
      <div className="space-y-10 pb-24 lg:pb-12">
        {/* Welcome Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
              Plan Activo: {user.plan}
            </p>
            <h1
              className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              ¡BIENVENIDO A THAI ELITE!
            </h1>
            <p className="text-base text-neutral-300 mt-1">
              Tu entrenamiento comienza aquí.
            </p>
          </div>
          <div className="text-xs text-neutral-400 tabular-nums">
            <span>{progressStats.completedCount} de {progressStats.totalCount} clases concluidas</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="text-white font-semibold">{progressStats.percentage}% completado</span>
          </div>
        </div>

        {/* Main Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800/90 bg-[#141414] min-h-[340px] sm:min-h-[390px] flex items-center shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]">
          <MuayThaiArtwork
            variant="hero"
            theme="stance"
            code="500"
            title="500 ENTRENAMIENTOS DE MUAY THAI"
            className="absolute inset-0 w-full h-full"
          />
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-300">
              <span className="text-[#E50914] font-bold">SERIE OFICIAL THAI ELITE</span>
              <span aria-hidden="true">·</span>
              <span>10 MÓDULOS</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{videos.length} CLASES EN HD</span>
            </div>
            <h2
              className="text-4xl sm:text-6xl font-extrabold text-white uppercase leading-[0.95] tracking-tight text-balance drop-shadow-md"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {settings.platformAnnouncement || '500 ENTRENAMIENTOS DE MUAY THAI'}
            </h2>
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-xl">
              Domina la guardia tailandesa, combinaciones de puños, low kicks, rodillas, codos y acondicionamiento físico con reproducción directa integrada desde Google Drive.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleStartTraining}
                className="w-full sm:w-auto px-7 py-3.5 min-h-[48px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer whitespace-nowrap shadow-[0_10px_28px_-6px_rgba(229,9,20,0.65)]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>¡EMPEZAR A ENTRENAR!</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeTab('entrenamientos')}
                className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-xl bg-[#171717]/90 hover:bg-neutral-800 border border-neutral-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Explorar los 10 Módulos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Continuar Viendo + Progreso del Alumno */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Continuar Viendo */}
          <div className="lg:col-span-7 rounded-2xl bg-[#171717] border border-neutral-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3
                  className="text-xl font-bold text-white uppercase tracking-wide"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Continuar Viendo
                </h3>
                <span className="text-xs text-neutral-400">Reproducción directa</span>
              </div>

              {continueVideo ? (
                <div className="flex flex-col sm:flex-row gap-5 items-stretch sm:items-center">
                  <div className="relative sm:w-56 aspect-video rounded-xl overflow-hidden shrink-0 border border-neutral-800">
                    <MuayThaiArtwork
                      variant="video"
                      code="01"
                      title={continueVideo.title}
                      imageUrl={continueVideo.thumbnailUrl}
                      className="w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => onPlayVideo(continueVideo)}
                      aria-label={`Reproducir ${continueVideo.title}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>
                        {modules.find((m) => m.id === continueVideo.moduleId)?.title || 'Módulo'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{continueVideo.duration}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white line-clamp-2">
                      {continueVideo.title}
                    </h4>
                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {continueVideo.description}
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onPlayVideo(continueVideo)}
                        className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Reanudar Clase Ahora</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-neutral-400">
                  Aún no hay videos registrados en los módulos.
                </div>
              )}
            </div>
          </div>

          {/* Progreso del Alumno */}
          <div className="lg:col-span-5 rounded-2xl bg-[#171717] border border-neutral-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3
                  className="text-xl font-bold text-white uppercase tracking-wide"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  Mi Progreso General
                </h3>
                <button
                  type="button"
                  onClick={() => onChangeTab('progreso')}
                  className="text-xs text-[#E50914] hover:underline font-medium cursor-pointer"
                >
                  Ver detalle
                </button>
              </div>

              <div className="flex items-baseline justify-between">
                <div
                  className="text-4xl font-extrabold text-white tabular-nums"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {progressStats.percentage}%
                </div>
                <div className="text-xs text-neutral-400 tabular-nums">
                  {progressStats.completedCount} / {progressStats.totalCount} entrenamientos
                </div>
              </div>

              <div className="mt-3 w-full h-3 rounded-full bg-[#090909] overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-[#E50914] transition-all duration-300"
                  style={{ width: `${progressStats.percentage}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
                <div>
                  <div className="text-xs text-neutral-400">Clases Concluidas</div>
                  <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                    {progressStats.completedCount}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-400">Videos Favoritos</div>
                  <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                    {progress.favoriteVideoIds.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos Disponibles */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Módulos Disponibles ({modules.length})
              </h2>
              <p className="text-xs text-neutral-400">
                Selecciona un módulo para ver sus clases y comenzar a entrenar
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChangeTab('entrenamientos')}
              className="text-xs font-semibold text-white hover:text-[#E50914] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Ver biblioteca completa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {modules.map((mod) => {
              const modVideos = videos.filter((v) => v.moduleId === mod.id);
              const modCompleted = modVideos.filter((v) =>
                progress.completedVideoIds.includes(v.id)
              ).length;
              const modPercent =
                modVideos.length > 0 ? Math.round((modCompleted / modVideos.length) * 100) : 0;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    setVisibleVideoCount(12);
                    onChangeTab('entrenamientos');
                  }}
                  className="group text-left rounded-2xl bg-[#141414] border border-neutral-800/90 hover:border-[#E50914] hover:shadow-[0_14px_34px_-10px_rgba(229,9,20,0.3)] overflow-hidden flex flex-col transition-all duration-200 cursor-pointer"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <MuayThaiArtwork
                      variant="module"
                      theme={mod.coverTheme}
                      code={mod.code}
                      title={mod.title}
                      imageUrl={mod.coverUrl}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-neutral-200">
                      <span className="font-bold text-[#E50914] tracking-wider">MÓDULO {mod.code}</span>
                      <span className="tabular-nums font-medium">{modVideos.length} clases</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#E50914] transition-colors line-clamp-1">
                        {mod.title}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums">
                        <span>Avance</span>
                        <span>{modPercent}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-[#E50914]"
                          style={{ width: `${modPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Últimos Videos Agregados + Acceso Rápido a Bonos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Últimos Videos Agregados */}
          <div className="lg:col-span-7 space-y-4">
            <h2
              className="text-2xl font-bold text-white uppercase tracking-wide"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Últimos Videos Agregados
            </h2>
            {recentVideos.length > 0 ? (
              <div className="space-y-3">
                {recentVideos.map((vid) => {
                  const mod = modules.find((m) => m.id === vid.moduleId);
                  const isDone = progress.completedVideoIds.includes(vid.id);
                  return (
                    <div
                      key={vid.id}
                      className="p-4 rounded-2xl bg-[#171717] border border-neutral-800 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <span>{mod ? `Módulo ${mod.code}` : 'Entrenamiento'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{vid.duration}</span>
                          {isDone && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-400">Concluida</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white truncate mt-1">
                          {vid.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onPlayVideo(vid)}
                        className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Ver Clase</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#171717] border border-neutral-800 text-center text-sm text-neutral-400">
                No hay videos registrados todavía.
              </div>
            )}
          </div>

          {/* Acceso Rápido a los Bonos */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-2xl font-bold text-white uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Acceso Rápido a Bonos
              </h2>
              <button
                type="button"
                onClick={() => onChangeTab('bonos')}
                className="text-xs text-[#E50914] hover:underline font-semibold cursor-pointer"
              >
                Ver los {bonuses.length} bonos
              </button>
            </div>
            <div className="space-y-3">
              {bonuses.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[#171717] border border-neutral-800 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#E50914]">{b.code}</div>
                    <h3 className="text-sm font-bold text-white truncate mt-0.5">{b.title}</h3>
                  </div>
                  {b.hasAccess ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadBonus(b)}
                      disabled={downloadingBonusId === b.id}
                      className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingBonusId === b.id ? 'Descargando...' : 'PDF'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-neutral-500 flex items-center gap-1 shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloqueado</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Non-Aggressive Payment & Community Contribution Banner on Inicio */}
        <section className="rounded-2xl bg-gradient-to-br from-[#161616] via-[#121212] to-[#1a0d0e] border border-neutral-800/90 p-5 sm:p-7 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E50914]">
                <Heart className="w-3.5 h-3.5 fill-[#E50914]" />
                <span>Inscripción Pendiente o Apoyo para Mantener Thai Elite</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                ¿Aún no has realizado tu pago o deseas contribuir a la plataforma?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Dejamos el acceso directo sin registro para facilitar tu entrenamiento. Si aún tienes pendiente tu pago de acceso o quieres apoyar para mantener los servidores, los 587 videos y los bonos activos, puedes elegir el <strong className="text-white">Plan Completo de $219 MXN</strong> o la opción accesible de <strong className="text-white">$100 MXN</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <a
                href="https://xpag.global/pay/mJLWrn52"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 min-h-[46px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-[0_8px_20px_-6px_rgba(229,9,20,0.6)]"
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Plan Completo · $219 MXN</span>
              </a>
              <a
                href="https://xpag.global/pay/3toN68D3"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 min-h-[46px] rounded-xl bg-[#090909] hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Heart className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>Plan / Apoyo · $100 MXN</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  onChangeTab('pago');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-3 min-h-[46px] rounded-xl bg-transparent hover:bg-neutral-800/70 text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Ver detalles</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // TAB 2: ENTRENAMIENTOS (BIBLIOTECA DE 10 MÓDULOS Y AULAS)
  // ==========================================
  if (activeTab === 'entrenamientos') {
    const activeModule =
      modules.find((m) => m.id === selectedModuleId) || modules[0] || null;

    const filteredModules = modules.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const modMatch =
        m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      const hasMatchingVideo = videos.some(
        (v) =>
          v.moduleId === m.id &&
          (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q))
      );
      return modMatch || hasMatchingVideo;
    });

    const activeModuleVideos = activeModule
      ? videos
          .filter((v) => v.moduleId === activeModule.id)
          .filter((v) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              v.title.toLowerCase().includes(q) ||
              v.description.toLowerCase().includes(q) ||
              activeModule.title.toLowerCase().includes(q)
            );
          })
          .sort((a, b) => a.order - b.order)
      : [];

    return (
      <div className="space-y-8 pb-24 lg:pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
              Biblioteca Oficial de Entrenamiento
            </p>
            <h1
              className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              MÓDULOS Y CLASES DE MUAY THAI
            </h1>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleVideoCount(12);
              }}
              placeholder="Buscar técnica, módulo o clase..."
              aria-label="Buscar técnica, módulo o clase"
              className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-[#171717] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
            />
          </div>
        </div>

        {/* Mobile Quick Touch Module Bar (<1024px) */}
        <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 -mx-4 px-4 no-scrollbar">
          {modules.map((mod) => {
            const isSelected = activeModule?.id === mod.id;
            return (
              <button
                key={`mob-pill-${mod.id}`}
                type="button"
                onClick={() => {
                  setSelectedModuleId(mod.id);
                  setVisibleVideoCount(12);
                }}
                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#E50914] border-[#E50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.45)]'
                    : 'bg-[#171717] border-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                Mód {mod.code} · {mod.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* 10 Modules Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {filteredModules.map((mod) => {
            const count = videos.filter((v) => v.moduleId === mod.id).length;
            const isSelected = activeModule?.id === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setSelectedModuleId(mod.id);
                  setVisibleVideoCount(12);
                }}
                className={`text-left rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col ${
                  isSelected
                    ? 'bg-[#171717] border-[#E50914] ring-1 ring-[#E50914]'
                    : 'bg-[#171717] border-neutral-800 hover:border-neutral-600'
                }`}
              >
                <div className="relative aspect-[16/10] w-full">
                  <MuayThaiArtwork
                    variant="module"
                    theme={mod.coverTheme}
                    code={mod.code}
                    title={mod.title}
                    imageUrl={mod.coverUrl}
                    className="w-full h-full"
                  />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#E50914]">MÓDULO {mod.code}</span>
                    <span className="text-neutral-200 tabular-nums">{count} clases</span>
                  </div>
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-bold text-white line-clamp-1">{mod.title}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                    {mod.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Module Detail & Lesson Cards */}
        {activeModule && (
          <div className="rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="text-[#E50914] font-bold">MÓDULO {activeModule.code}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{activeModuleVideos.length} videos reales disponibles</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white uppercase mt-1"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {activeModule.title}
                </h2>
                <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
                  {activeModule.description}
                </p>
              </div>

              {activeModuleVideos.length > 0 && (
                <button
                  type="button"
                  onClick={() => onPlayVideo(activeModuleVideos[0])}
                  className="px-5 py-3 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Reproducir Módulo</span>
                </button>
              )}
            </div>

            {activeModuleVideos.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeModuleVideos.slice(0, visibleVideoCount).map((vid, idx) => {
                    const isCompleted = progress.completedVideoIds.includes(vid.id);
                    const isFav = progress.favoriteVideoIds.includes(vid.id);
                    return (
                      <div
                        key={vid.id}
                        className="rounded-2xl bg-[#090909] border border-neutral-800 overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-video w-full overflow-hidden">
                            <MuayThaiArtwork
                              variant="video"
                              theme={activeModule.coverTheme}
                              code={String(idx + 1).padStart(2, '0')}
                              title={vid.title}
                              imageUrl={vid.thumbnailUrl}
                              className="w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => onPlayVideo(vid)}
                              aria-label={`Reproducir ${vid.title}`}
                              className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/15 transition-colors cursor-pointer"
                            >
                              <div className="w-12 h-12 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                                <Play className="w-5 h-5 fill-white ml-0.5" />
                              </div>
                            </button>
                            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-neutral-200 pointer-events-none">
                              <span>Clase {idx + 1}</span>
                              <span className="tabular-nums">{vid.duration}</span>
                            </div>
                          </div>

                          <div className="p-4">
                            <h3 className="text-base font-bold text-white line-clamp-2">
                              {vid.title}
                            </h3>
                            <p className="mt-1.5 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                              {vid.description}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 pt-0 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onPlayVideo(vid)}
                            className="flex-1 py-2.5 px-4 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Ver Clase</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleComplete(vid.id)}
                            aria-label={
                              isCompleted ? 'Desmarcar como concluida' : 'Marcar como concluida'
                            }
                            className={`min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                : 'bg-[#171717] border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleFavorite(vid.id)}
                            aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            className={`min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                              isFav
                                ? 'bg-neutral-800 border-[#E50914] text-[#E50914]'
                                : 'bg-[#171717] border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isFav ? 'fill-[#E50914]' : ''}`} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {activeModuleVideos.length > visibleVideoCount && (
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setVisibleVideoCount((prev) => prev + 18)}
                      className="px-6 py-3 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cargar más clases ({Math.min(visibleVideoCount, activeModuleVideos.length)} de {activeModuleVideos.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleVideoCount(activeModuleVideos.length)}
                      className="px-5 py-3 min-h-[44px] rounded-xl bg-[#090909] hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Mostrar las {activeModuleVideos.length} clases del módulo
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 px-4 text-center rounded-xl bg-[#090909] border border-neutral-800/80 space-y-2">
                <Video className="w-8 h-8 text-neutral-500 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  Este módulo aún no tiene videos publicados
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  El administrador puede agregar videos individuales de Google Drive o sincronizar una carpeta completa desde el Panel Administrativo.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // TAB 3: BONOS (DESCARGA REAL DE PDFs EN ESPAÑOL + LECTOR INTEGRADO)
  // ==========================================
  if (activeTab === 'bonos') {
    const activeManual = readingBonus ? getSpanishBonusManual(readingBonus) : null;

    return (
      <div className="space-y-8 pb-24 lg:pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
              Material Complementario Descargable · 100% en Español · Plan {user.plan}
            </p>
            <h1
              className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              BONOS EXCLUSIVOS EN PDF (ESPAÑOL)
            </h1>
            <p className="text-sm text-neutral-300 mt-1 max-w-2xl">
              Descarga tus 5 manuales oficiales completos en formato PDF (5 páginas cada uno en español) o léelos directamente en tu celular, tablet o computadora.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171717] border border-neutral-800 text-xs text-neutral-300 self-start sm:self-auto">
            <FileText className="w-4 h-4 text-[#E50914] shrink-0" />
            <span>5 E-Books Oficiales en Español</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonuses.map((bonus) => {
            const manual = getSpanishBonusManual(bonus);
            const justDownloaded = lastDownloadedBonusId === bonus.id;

            return (
              <div
                key={bonus.id}
                className="rounded-2xl bg-[#171717] border border-neutral-800 overflow-hidden flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <MuayThaiArtwork
                      variant="bonus"
                      code={bonus.code}
                      title={bonus.title}
                      imageUrl={bonus.coverUrl}
                      className="w-full h-full"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-sm border border-neutral-700 text-[11px] font-bold text-white uppercase tracking-wider">
                      PDF · {manual.pageCount} Páginas · Español
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#E50914] uppercase">{bonus.code}</span>
                      <span className="text-neutral-300">
                        Planes: {bonus.allowedPlans.join(' / ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h2 className="text-lg font-bold text-white leading-snug">{bonus.title}</h2>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {bonus.description}
                    </p>

                    {/* Preview of Spanish Chapters */}
                    <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Capítulos incluidos en el PDF:
                      </p>
                      <ul className="space-y-1">
                        {manual.chapters.slice(0, 3).map((ch) => (
                          <li
                            key={ch.chapterNumber}
                            className="text-xs text-neutral-300 flex items-start gap-1.5 line-clamp-1"
                          >
                            <span className="text-[#E50914] font-bold shrink-0">•</span>
                            <span className="truncate">{ch.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2.5">
                  {bonus.hasAccess ? (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadBonus(bonus)}
                          disabled={downloadingBonusId === bonus.id}
                          className="flex-1 py-3 px-4 min-h-[46px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shadow-[0_8px_20px_-6px_rgba(229,9,20,0.6)]"
                        >
                          <Download className="w-4 h-4 shrink-0" />
                          <span>
                            {downloadingBonusId === bonus.id
                              ? 'GENERANDO PDF...'
                              : justDownloaded
                              ? '¡PDF DESCARGADO!'
                              : 'DESCARGAR PDF'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReadingBonus(bonus)}
                          className="py-3 px-4 min-h-[46px] rounded-xl bg-[#090909] hover:bg-neutral-800 border border-neutral-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
                          <span>Leer Manual</span>
                        </button>
                      </div>

                      {bonus.pdfDriveLink && (
                        <a
                          href={bonus.pdfDriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 min-h-[40px] rounded-xl bg-[#090909] hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir respaldo en Google Drive</span>
                        </a>
                      )}
                    </>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#090909] border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#E50914]" />
                        <span>Disponible en Plan {bonus.allowedPlans.join(' o ')}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Spanish Bonus Manual Reader Modal */}
        {readingBonus && activeManual && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto p-3 sm:p-6 lg:p-10"
            role="dialog"
            aria-modal="true"
            aria-label={`Manual en Español: ${activeManual.title}`}
          >
            <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl bg-[#141414] border border-neutral-800 overflow-hidden shadow-2xl">
              {/* Top Sticky Reader Bar */}
              <div className="sticky top-0 z-20 px-4 sm:px-8 py-4 bg-[#090909]/95 backdrop-blur-md border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#E50914]">
                    {activeManual.code} · {activeManual.edition}
                  </span>
                  <h2
                    className="text-lg sm:text-2xl font-extrabold text-white uppercase truncate"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {activeManual.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadBonus(readingBonus)}
                    className="px-4 py-2.5 min-h-[42px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF ({activeManual.pageCount} págs)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingBonus(null)}
                    aria-label="Cerrar lector de manual"
                    className="p-2.5 min-h-[42px] min-w-[42px] rounded-xl bg-[#171717] hover:bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Manual Content Body */}
              <div className="p-5 sm:p-8 space-y-8">
                {/* Intro Box */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#090909] border-l-4 border-[#E50914] space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#E50914]">
                    Introducción Oficial · {activeManual.estimatedReadTime}
                  </div>
                  <p className="text-sm text-neutral-200 leading-relaxed">
                    {activeManual.introduction}
                  </p>
                </div>

                {/* Chapters */}
                <div className="space-y-6">
                  {activeManual.chapters.map((ch) => (
                    <div
                      key={ch.chapterNumber}
                      className="p-5 sm:p-6 rounded-2xl bg-[#0d0d0d] border border-neutral-800 space-y-4"
                    >
                      <div className="border-b border-neutral-800 pb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#E50914]">
                          {ch.chapterNumber}
                        </span>
                        <h3
                          className="text-xl sm:text-2xl font-bold text-white uppercase mt-0.5"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                          {ch.title}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">{ch.subtitle}</p>
                      </div>

                      <div className="space-y-2.5">
                        {ch.paragraphs.map((p, i) => (
                          <p key={i} className="text-sm text-neutral-300 leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>

                      <div className="space-y-2 pt-1">
                        {ch.bulletPoints.map((bp, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-[#161616] border border-neutral-800/80 flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                            <span>{bp}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#E50914]/10 border border-[#E50914]/40 text-xs text-neutral-100 font-medium">
                        {ch.proTip}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Daily Checklist */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#090909] border border-neutral-800 space-y-3">
                  <h3
                    className="text-lg font-bold text-white uppercase tracking-wide"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    Checklist de Ejecución Diaria
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeManual.finalChecklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#141414] border border-neutral-800 flex items-start gap-2 text-xs text-neutral-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // TAB 4: MI PROGRESO
  // ==========================================
  if (activeTab === 'progreso') {
    const completedVideos = videos.filter((v) =>
      progress.completedVideoIds.includes(v.id)
    );
    const favoriteVideos = videos.filter((v) =>
      progress.favoriteVideoIds.includes(v.id)
    );

    return (
      <div className="space-y-8 pb-24 lg:pb-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
            Rendimiento y Constancia
          </p>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            MI PROGRESO DE ENTRENAMIENTO
          </h1>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-[#171717] border border-neutral-800">
            <div className="text-xs text-neutral-400">Porcentaje Total Concluido</div>
            <div
              className="text-4xl font-extrabold text-white tabular-nums mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {progressStats.percentage}%
            </div>
            <div className="mt-3 w-full h-2.5 rounded-full bg-[#090909] overflow-hidden">
              <div
                className="h-full bg-[#E50914]"
                style={{ width: `${progressStats.percentage}%` }}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#171717] border border-neutral-800">
            <div className="text-xs text-neutral-400">Clases Concluidas</div>
            <div
              className="text-4xl font-extrabold text-white tabular-nums mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {progressStats.completedCount} / {progressStats.totalCount}
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Guardado automáticamente en tu cuenta
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#171717] border border-neutral-800">
            <div className="text-xs text-neutral-400">Entrenamientos Favoritos</div>
            <div
              className="text-4xl font-extrabold text-white tabular-nums mt-1"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {favoriteVideos.length}
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Acceso rápido para repasar técnica
            </div>
          </div>
        </div>

        {/* Avance por Módulo */}
        <div className="rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4">
          <h2
            className="text-2xl font-bold text-white uppercase tracking-wide"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Avance por Módulo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressStats.byModule.map((stat) => (
              <div
                key={stat.moduleId}
                className="p-4 rounded-xl bg-[#090909] border border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">
                    {stat.code} · {stat.title}
                  </span>
                  <span className="text-neutral-400 tabular-nums">
                    {stat.completedCount}/{stat.totalCount} ({stat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#171717] overflow-hidden">
                  <div
                    className="h-full bg-[#E50914]"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favoritos y Clases Concluidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4">
            <h2
              className="text-xl font-bold text-white uppercase tracking-wide"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Mis Videos Favoritos ({favoriteVideos.length})
            </h2>
            {favoriteVideos.length > 0 ? (
              <div className="space-y-3">
                {favoriteVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-3.5 rounded-xl bg-[#090909] border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{vid.title}</p>
                      <p className="text-xs text-neutral-400 tabular-nums">{vid.duration}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayVideo(vid)}
                      className="px-3.5 py-2 min-h-[40px] rounded-lg bg-[#E50914] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Ver</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Marca cualquier clase con el ícono de marcador para guardarla aquí.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-4">
            <h2
              className="text-xl font-bold text-white uppercase tracking-wide"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Clases Concluidas ({completedVideos.length})
            </h2>
            {completedVideos.length > 0 ? (
              <div className="space-y-3">
                {completedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    className="p-3.5 rounded-xl bg-[#090909] border border-neutral-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{vid.title}</p>
                        <p className="text-xs text-neutral-400 tabular-nums">{vid.duration}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayVideo(vid)}
                      className="px-3.5 py-2 min-h-[40px] rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Repasar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Aún no has marcado clases como concluidas.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAB 5: PAGO PENDIENTE Y CONTRIBUCIÓN (219 MXN / 100 MXN)
  // ==========================================
  if (activeTab === 'pago') {
    return (
      <div className="space-y-8 pb-24 lg:pb-12">
        {/* Top Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E50914]">
            <Heart className="w-3.5 h-3.5 fill-[#E50914]" />
            <span>Acceso Abierto Basado en Confianza · Thai Elite México</span>
          </div>
          <h1
            className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            PAGO DE INSCRIPCIÓN Y CONTRIBUCIÓN DE MANTENIMIENTO
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            En <strong className="text-white">Thai Elite México</strong> eliminamos los formularios y contraseñas para que puedas entrar directamente a tus entrenamientos y bonos sin complicaciones. Si aún no has realizado tu pago de inscripción, o si deseas contribuir para ayudarnos a mantener la plataforma activa y sin anuncios, elige la opción que mejor se adapte a ti:
          </p>
        </div>

        {/* Two Plan Cards: $219 MXN and $100 MXN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: Plan Completo $219 MXN */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#1a1112] to-[#141414] border-2 border-[#E50914] p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_-15px_rgba(229,9,20,0.35)]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-md bg-[#E50914] text-white text-[11px] font-bold uppercase tracking-wider">
                  Plan Oficial Completo · Más Elegido
                </span>
                <span className="text-xs text-neutral-400 font-medium">Pago Único</span>
              </div>

              <div>
                <h2
                  className="text-2xl sm:text-3xl font-extrabold text-white uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  PLAN COMPLETO THAI ELITE + 5 BONOS PDF
                </h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    $219 MXN
                  </span>
                  <span className="text-xs text-neutral-400">
                    pesos mexicanos · sin mensualidades
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Ideal si entraste a la plataforma y aún tienes pendiente liquidar tu inscripción completa, o si deseas respaldar al 100% el proyecto Thai Elite México para mantener todos los módulos y manuales disponibles.
              </p>

              <ul className="space-y-2.5 pt-2 border-t border-neutral-800/80 text-xs sm:text-sm text-neutral-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <span>
                    Acceso ilimitado a los <strong>10 Módulos y 587 Clases de Muay Thai</strong> en alta definición.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <span>
                    Descarga directa de los <strong>5 Bonos Exclusivos en PDF en Español</strong> (Combinaciones, Acondicionamiento, Defensa, Fundamentos y Recuperación).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <span>
                    Ayudas directamente a cubrir el almacenamiento en la nube y nuevas actualizaciones para toda la comunidad.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-800/80 space-y-2.5">
              <a
                href="https://xpag.global/pay/mJLWrn52"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 min-h-[48px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-colors shadow-[0_10px_25px_-6px_rgba(229,9,20,0.65)]"
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <span>Pagar Plan Completo · $219 MXN</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <p className="text-[11px] text-center text-neutral-400">
                Pago rápido y 100% seguro a través de Xpag Global
              </p>
            </div>
          </div>

          {/* Card 2: Plan Esencial / Contribución $100 MXN */}
          <div className="rounded-2xl bg-[#141414] border border-neutral-800 p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-md bg-neutral-800 text-neutral-200 text-[11px] font-bold uppercase tracking-wider">
                  Plan Accesible / Aporte de Mantenimiento
                </span>
                <span className="text-xs text-neutral-400 font-medium">Aportación Única</span>
              </div>

              <div>
                <h2
                  className="text-2xl sm:text-3xl font-extrabold text-white uppercase"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  PLAN ESENCIAL O CONTRIBUCIÓN DE $100 MXN
                </h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    $100 MXN
                  </span>
                  <span className="text-xs text-neutral-400">
                    pesos mexicanos · apoyo solidario
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Pensado para quienes buscan una opción económica de <strong className="text-white">$100 MXN</strong> para regularizar su acceso o desean realizar una contribución voluntaria para ayudar a mantener activo el servidor de Thai Elite México.
              </p>

              <ul className="space-y-2.5 pt-2 border-t border-neutral-800/80 text-xs sm:text-sm text-neutral-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <span>
                    Opción accesible de <strong>$100 MXN</strong> para cubrir tu acceso base de estudiante.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <span>
                    Contribuyes directamente al mantenimiento de los servidores de video y soporte técnico de la plataforma.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                  <span>
                    Mantiene el acceso directo sin publicidad ni bloqueos para ti y tus compañeros de entrenamiento.
                  </span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-800/80 space-y-2.5">
              <a
                href="https://xpag.global/pay/3toN68D3"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 min-h-[48px] rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-colors"
              >
                <Heart className="w-4 h-4 text-[#E50914] fill-[#E50914] shrink-0" />
                <span>Pagar / Contribuir · $100 MXN</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <p className="text-[11px] text-center text-neutral-400">
                Enlace oficial de pago y contribución ($100 MXN)
              </p>
            </div>
          </div>
        </div>

        {/* Friendly Non-Aggressive Note */}
        <div className="rounded-2xl bg-[#121212] border border-neutral-800/90 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-[#E50914]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">
                ¿Ya realizaste tu pago anteriormente?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
                Si ya hiciste tu pago al inscribirte, ¡muchas gracias por tu confianza! No necesitas volver a pagar: todas tus clases y bonos en PDF están desbloqueados para que entrenes cuando quieras.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChangeTab('entrenamientos');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2.5 min-h-[42px] rounded-xl bg-[#1a1a1a] hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Ir a las Clases
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAB 6: PERFIL + CLASES EN VIVO VIP
  // ==========================================
  return (
    <div className="space-y-8 pb-24 lg:pb-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914]">
          Cuenta y Membresía
        </p>
        <h1
          className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight mt-1"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          MI PERFIL Y CLASES EN VIVO VIP
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: VIP Live Classes Section */}
        <div className="lg:col-span-7 rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div>
              <div className="text-xs font-bold text-[#E50914] uppercase">
                Exclusivo Plan VIP
              </div>
              <h2
                className="text-2xl font-bold text-white uppercase mt-0.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Calendario de Clases en Vivo y Comunidad VIP
              </h2>
            </div>

            {vipAllowed && settings.whatsappVipUrl && (
              <a
                href={settings.whatsappVipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Grupo VIP de WhatsApp</span>
              </a>
            )}
          </div>

          {vipAllowed ? (
            liveClasses.length > 0 ? (
              <div className="space-y-3">
                {liveClasses.map((live) => (
                  <div
                    key={live.id}
                    className="p-4 rounded-xl bg-[#090909] border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#E50914] font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{live.date}</span>
                        <span aria-hidden="true">·</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{live.time} hrs (CDMX)</span>
                      </div>
                      <h3 className="text-base font-bold text-white">{live.title}</h3>
                      <p className="text-xs text-neutral-400">
                        Instructor: {live.instructor}
                      </p>
                    </div>
                    <a
                      href={live.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0 whitespace-nowrap"
                    >
                      <span>Participar Ahora</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[#090909] border border-neutral-800 text-center space-y-2">
                <Calendar className="w-8 h-8 text-neutral-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">
                  No hay transmisiones en vivo programadas en este momento
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Cuando el administrador programe la próxima sesión en vivo, aparecerá aquí con la fecha, horario e instructor oficial.
                </p>
              </div>
            )
          ) : (
            <div className="p-6 rounded-xl bg-[#090909] border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Lock className="w-4 h-4 text-[#E50914]" />
                <span>Sección Exclusiva para Alumnos con Plan VIP</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tu plan actual es <strong>{user.plan}</strong>. El Plan VIP incluye acceso a las 500 clases grabadas, los 5 bonos en PDF, sesiones en vivo y grupo VIP de WhatsApp.
              </p>
            </div>
          )}
        </div>

        {/* Right: Account Settings Form */}
        <div className="lg:col-span-5 rounded-2xl bg-[#171717] border border-neutral-800 p-6 space-y-5">
          <div className="flex items-center gap-3.5 pb-4 border-b border-neutral-800">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E50914] shadow-[0_0_16px_rgba(229,9,20,0.45)] shrink-0 bg-[#141414]">
              <img
                src="/assets/modules/mod01.jpg"
                alt={user.name}
                className="w-full h-full object-cover scale-150"
                style={{ objectPosition: '84% 24%' }}
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">{user.name}</h2>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090909] border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#E50914]" />
                <span>Plano Contratado:</span>
              </span>
              <span className="font-bold text-white uppercase">PLAN {user.plan}</span>
            </div>
            <div className="pt-3 border-t border-neutral-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Progreso de las Clases:</span>
                <span className="font-bold text-white tabular-nums">
                  {progressStats.completedCount} / {progressStats.totalCount} ({progressStats.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#171717] overflow-hidden">
                <div
                  className="h-full bg-[#E50914] transition-all duration-300"
                  style={{ width: `${progressStats.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {profileStatus && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-xs text-emerald-200">
              {profileStatus}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label
                htmlFor="profile-name"
                className="block text-xs font-medium text-neutral-300 mb-1.5"
              >
                Nombre del Alumno
              </label>
              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-5 py-2.5 min-h-[44px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
