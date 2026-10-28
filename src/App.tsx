import React, { useEffect, useState, useCallback } from 'react';
import {
  Home,
  Dumbbell,
  Gift,
  BarChart3,
  User,
  LayoutDashboard,
  Video,
  Layers,
  FileText,
  Users,
  Settings,
  Shield,
  Link2,
  Check,
} from 'lucide-react';
import {
  AdminTab,
  BootstrapPayload,
  StudentTab,
  VideoItem,
} from './types';
import { calculateProgressStats } from './utils/driveUtils';
import { initAuth } from './services/googleAuth';
import { apiFetch, getDirectBootstrapPayload } from './services/vercelApiFallback';
import { StudentArea } from './components/StudentArea';
import { AdminArea } from './components/AdminArea';
import { VideoPlayerModal } from './components/VideoPlayerModal';

const SESSION_TOKEN_KEY = 'thai_elite_session_token';

function getInitialRoleFromUrl(): 'student' | 'admin' {
  if (typeof window === 'undefined') return 'student';
  const params = new URLSearchParams(window.location.search);
  if (params.get('role') === 'admin' || params.get('admin') === '1') {
    return 'admin';
  }
  return 'student';
}

export default function App() {
  const initialRole = getInitialRoleFromUrl();
  const initialDirect = getDirectBootstrapPayload(initialRole);

  const [token, setToken] = useState<string>(() => {
    const saved = localStorage.getItem(SESSION_TOKEN_KEY);
    if (saved) return saved;
    localStorage.setItem(SESSION_TOKEN_KEY, initialDirect.token);
    return initialDirect.token;
  });

  // Google Drive OAuth token kept strictly in memory per workspace-integration rules
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
  const [data, setData] = useState<BootstrapPayload>(() => initialDirect.payload);
  const [copiedStudentLink, setCopiedStudentLink] = useState(false);

  // Environment & Tab Navigation State
  const [environment, setEnvironment] = useState<'student' | 'admin'>(initialRole);
  const [studentTab, setStudentTab] = useState<StudentTab>('inicio');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Active Video in Internal Player Modal
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const unsub = initAuth(
      (_firebaseUser, accessToken) => {
        setDriveAccessToken(accessToken);
      },
      () => {
        setDriveAccessToken(null);
      }
    );
    return () => unsub();
  }, []);

  const fetchBootstrap = useCallback(
    async (sessionToken: string, targetEnv: 'student' | 'admin' = environment) => {
      try {
        const res = await apiFetch('/api/bootstrap', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
        const contentType = (res.headers.get('content-type') || '').toLowerCase();
        if (!res.ok || !contentType.includes('application/json')) {
          const fallback = getDirectBootstrapPayload(targetEnv);
          setData(fallback.payload);
          return;
        }
        const payload: BootstrapPayload = await res.json();
        if (payload && payload.user && Array.isArray(payload.modules)) {
          setData(payload);
        }
      } catch {
        const fallback = getDirectBootstrapPayload(targetEnv);
        setData(fallback.payload);
      }
    },
    [environment]
  );

  useEffect(() => {
    fetchBootstrap(token, environment);
  }, [token, environment, fetchBootstrap]);

  const handleSwitchEnvironment = (nextEnv: 'student' | 'admin') => {
    const direct = getDirectBootstrapPayload(nextEnv);
    localStorage.setItem(SESSION_TOKEN_KEY, direct.token);
    setToken(direct.token);
    setData(direct.payload);
    setEnvironment(nextEnv);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyStudentLink = async () => {
    const studentUrl = `${window.location.origin}/?acceso=alumno`;
    try {
      await navigator.clipboard.writeText(studentUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = studentUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedStudentLink(true);
    setTimeout(() => setCopiedStudentLink(false), 2600);
  };

  const handlePlayVideo = async (video: VideoItem) => {
    setActiveVideo(video);
    try {
      const res = await apiFetch('/api/progress/watch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId: video.id }),
      });
      if (res.ok) {
        const { progress } = await res.json();
        if (progress) {
          setData((prev) => ({ ...prev, progress }));
        }
      }
    } catch {
      // ignore watch tracking failure
    }
  };

  const handleToggleComplete = async (videoId: string) => {
    try {
      const res = await apiFetch('/api/progress/toggle-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      });
      if (res.ok) {
        const { progress } = await res.json();
        if (progress) {
          setData((prev) => ({ ...prev, progress }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (videoId: string) => {
    try {
      const res = await apiFetch('/api/progress/toggle-favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ videoId }),
      });
      if (res.ok) {
        const { progress } = await res.json();
        if (progress) {
          setData((prev) => ({ ...prev, progress }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (name: string, newPassword?: string) => {
    const res = await apiFetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, newPassword }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'No se pudo actualizar el perfil.');
    }
    if (body.user) {
      setData((prev) => ({ ...prev, user: body.user }));
    }
  };

  const {
    user,
    modules,
    videos,
    bonuses,
    progress,
    liveClasses,
    vipAllowed,
    settings,
    adminData,
  } = data;

  const currentEnv = environment;

  const progressStats = calculateProgressStats(
    progress.completedVideoIds || [],
    videos,
    modules
  );

  // Compute active video's module and next video for the modal player
  const activeVideoModule = activeVideo
    ? modules.find((m) => m.id === activeVideo.moduleId) || null
    : null;

  const activeModuleVideos = activeVideo
    ? videos
        .filter((v) => v.moduleId === activeVideo.moduleId)
        .sort((a, b) => a.order - b.order)
    : [];

  const getNextVideo = (): VideoItem | null => {
    if (!activeVideo) return null;
    const idxInMod = activeModuleVideos.findIndex((v) => v.id === activeVideo.id);
    if (idxInMod !== -1 && idxInMod + 1 < activeModuleVideos.length) {
      return activeModuleVideos[idxInMod + 1];
    }
    if (activeVideoModule) {
      const modIdx = modules.findIndex((m) => m.id === activeVideoModule.id);
      for (let i = modIdx + 1; i < modules.length; i++) {
        const nextModVideos = videos
          .filter((v) => v.moduleId === modules[i].id)
          .sort((a, b) => a.order - b.order);
        if (nextModVideos.length > 0) return nextModVideos[0];
      }
    }
    return null;
  };

  const nextVideoItem = getNextVideo();

  const studentNavItems: { id: StudentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'entrenamientos', label: 'Entrenamientos', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'bonos', label: 'Bonos', icon: <Gift className="w-5 h-5" /> },
    { id: 'progreso', label: 'Mi progreso', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'perfil', label: 'Perfil', icon: <User className="w-5 h-5" /> },
  ];

  const adminNavItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-5 h-5" /> },
    { id: 'modulos', label: 'Módulos', icon: <Layers className="w-5 h-5" /> },
    { id: 'bonos', label: 'Bonos', icon: <FileText className="w-5 h-5" /> },
    { id: 'alumnos', label: 'Alumnos', icon: <Users className="w-5 h-5" /> },
    { id: 'configuracion', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col lg:flex-row">
      {/* ==========================================
          DESKTOP LEFT SIDEBAR (hidden on mobile)
      ========================================== */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#0d0d0d] border-r border-neutral-800/80 z-30">
        <div className="px-5 py-5 border-b border-neutral-800/80 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff1f2d] to-[#99050d] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(229,9,20,0.4)]"
            aria-hidden="true"
          >
            <Dumbbell className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span
              className="block text-xl font-extrabold tracking-wide text-white uppercase leading-none whitespace-nowrap"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              THAI ELITE <span className="text-[#E50914]">MÉXICO</span>
            </span>
            <span className="block text-[11px] text-neutral-400 tracking-wide mt-1 truncate">
              Acceso Directo • Sin Cuenta
            </span>
          </div>
        </div>

        {/* Direct Environment Switcher */}
        <div className="p-4 border-b border-neutral-800 space-y-2.5">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#090909] rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => handleSwitchEnvironment('student')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentEnv === 'student'
                  ? 'bg-[#E50914] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Área Alumno
            </button>
            <button
              type="button"
              onClick={() => handleSwitchEnvironment('admin')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentEnv === 'admin'
                  ? 'bg-[#E50914] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Panel Admin
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyStudentLink}
            className="w-full py-2 px-3 rounded-xl bg-[#141414] hover:bg-neutral-800 border border-neutral-800 text-[11px] font-bold text-neutral-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {copiedStudentLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-400">¡Link de Alumno Copiado!</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
                <span>Copiar Link de Alumno</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Menú principal">
          {currentEnv === 'student'
            ? studentNavItems.map((item) => {
                const active = studentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStudentTab(item.id)}
                    className={`w-full px-4 py-3 min-h-[44px] rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#E50914] text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })
            : adminNavItems.map((item) => {
                const active = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAdminTab(item.id)}
                    className={`w-full px-4 py-3 min-h-[44px] rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#E50914] text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
        </nav>

        {/* User Footer Info */}
        <div className="p-4 border-t border-neutral-800/80 space-y-3 bg-[#090909]/50">
          <div className="px-2 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E50914] shrink-0 shadow-[0_0_12px_rgba(229,9,20,0.45)] bg-[#141414]">
                <img
                  src="/assets/modules/mod01.jpg"
                  alt={user.name}
                  className="w-full h-full object-cover scale-150"
                  style={{ objectPosition: '84% 24%' }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">{user.name}</div>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">
                    {currentEnv === 'admin' ? 'Administrador Oficial' : 'Acceso Directo VIP'}
                  </span>
                  <span className="tabular-nums text-white font-semibold">
                    {progressStats.percentage}%
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-[#E50914] transition-all duration-300"
                style={{ width: `${progressStats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT AREA
      ========================================== */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Contract (Mobile & Desktop) */}
        <header className="sticky top-0 z-20 h-14 px-3.5 sm:px-8 bg-[#090909]/95 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between gap-2 sm:gap-6">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              if (currentEnv === 'student') setStudentTab('inicio');
              else setAdminTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-base sm:text-lg font-extrabold tracking-wider text-white uppercase whitespace-nowrap shrink-0 flex items-center gap-2"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            <span className="w-6 h-6 rounded-md bg-[#E50914] flex items-center justify-center lg:hidden shrink-0">
              <Dumbbell className="w-3.5 h-3.5 text-white" />
            </span>
            <span>
              THAI ELITE <span className="text-[#E50914]">MÉXICO</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <span className="whitespace-nowrap shrink-0">
              {currentEnv === 'admin'
                ? 'Ambiente: Panel Administrativo'
                : 'Acceso Directo del Alumno • Plan VIP Activo'}
            </span>
            <span className="whitespace-nowrap shrink-0 tabular-nums">
              Avance: {progressStats.percentage}%
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyStudentLink}
              className="px-2.5 sm:px-3.5 py-1.5 min-h-[36px] rounded-lg bg-[#141414] hover:bg-neutral-800 border border-neutral-700 text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Copiar link de acceso directo del alumno (sin crear cuenta)"
            >
              {copiedStudentLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400">¡Link Copiado!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
                  <span className="hidden sm:inline">Copiar Link Alumno</span>
                  <span className="sm:hidden">Link Alumno</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                handleSwitchEnvironment(currentEnv === 'admin' ? 'student' : 'admin')
              }
              className="px-2.5 sm:px-3.5 py-1.5 min-h-[36px] rounded-lg bg-[#171717] hover:bg-neutral-800 border border-neutral-800 text-[11px] sm:text-xs font-bold text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Shield className="w-3.5 h-3.5 text-[#E50914]" />
              <span>{currentEnv === 'admin' ? 'Área Alumno' : 'Admin'}</span>
            </button>
          </div>
        </header>

        {/* Active Workspace View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 pt-4 sm:pt-6">
          {currentEnv === 'student' ? (
            <StudentArea
              activeTab={studentTab}
              onChangeTab={(tab) => {
                setStudentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              user={user}
              token={token}
              modules={modules}
              videos={videos}
              bonuses={bonuses}
              progress={progress}
              progressStats={progressStats}
              liveClasses={liveClasses}
              vipAllowed={vipAllowed}
              settings={settings}
              onPlayVideo={handlePlayVideo}
              onToggleComplete={handleToggleComplete}
              onToggleFavorite={handleToggleFavorite}
              onUpdateProfile={handleUpdateProfile}
            />
          ) : (
            <AdminArea
              activeTab={adminTab}
              onChangeTab={(tab) => {
                setAdminTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              token={token}
              driveAccessToken={driveAccessToken}
              onSetDriveAccessToken={setDriveAccessToken}
              modules={modules}
              videos={videos}
              bonuses={bonuses}
              students={adminData?.students || []}
              liveClasses={liveClasses}
              settings={settings}
              onRefreshData={() => fetchBootstrap(token, currentEnv)}
              onPreviewVideo={handlePlayVideo}
            />
          )}
        </main>
      </div>

      {/* ==========================================
          MOBILE FIXED BOTTOM NAVIGATION BAR (<1024px)
      ========================================== */}
      <nav
        aria-label="Navegación móvil"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#0d0d0d]/95 backdrop-blur-md border-t border-neutral-800 px-1 shadow-[0_-10px_25px_rgba(0,0,0,0.85)]"
      >
        {currentEnv === 'student' ? (
          <div className="grid grid-cols-5 items-center h-full">
            {studentNavItems.map((item) => {
              const active = studentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setStudentTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative min-h-[48px] h-full flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    active ? 'text-[#E50914]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-0.5 rounded-full bg-[#E50914]" />
                  )}
                  {item.icon}
                  <span className="text-[10px] font-semibold tracking-tight mt-0.5 w-full text-center px-0.5 truncate">
                    {item.label === 'Mi progreso' ? 'Progreso' : item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-6 items-center h-full">
            {adminNavItems.map((item) => {
              const active = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAdminTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative min-h-[48px] h-full flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    active ? 'text-[#E50914]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#E50914]" />
                  )}
                  {item.icon}
                  <span className="text-[10px] font-semibold tracking-tight mt-0.5 truncate max-w-[56px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* ==========================================
          INTERNAL GOOGLE DRIVE VIDEO PLAYER MODAL
      ========================================== */}
      <VideoPlayerModal
        video={activeVideo}
        module={activeVideoModule}
        moduleVideos={activeModuleVideos}
        completedVideoIds={progress.completedVideoIds || []}
        favoriteVideoIds={progress.favoriteVideoIds || []}
        onClose={() => setActiveVideo(null)}
        onSelectVideo={handlePlayVideo}
        onToggleComplete={handleToggleComplete}
        onToggleFavorite={handleToggleFavorite}
        onNextVideo={() => {
          if (nextVideoItem) {
            handlePlayVideo(nextVideoItem);
          }
        }}
        hasNextVideo={Boolean(nextVideoItem)}
      />
    </div>
  );
}
