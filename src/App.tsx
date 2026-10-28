import React, { useEffect, useState, useCallback } from 'react';
import {
  Home,
  Dumbbell,
  Gift,
  BarChart3,
  LayoutDashboard,
  Video,
  Layers,
  FileText,
  Settings,
  Shield,
  Lock,
  Link2,
  Check,
  LogOut,
  X,
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
const ADMIN_AUTH_KEY = 'thai_elite_admin_unlocked';
const ADMIN_EMAIL = 'pedrinho.pedro248@gmail.com';

export default function App() {
  const initialDirect = getDirectBootstrapPayload('student');

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

  // Admin Maintenance Unlock State (ONLY Admin has a single login to maintain the platform)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_AUTH_KEY) === '1';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState(ADMIN_EMAIL);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Environment & Tab Navigation State
  const [environment, setEnvironment] = useState<'student' | 'admin'>('student');
  const [studentTab, setStudentTab] = useState<StudentTab>('inicio');
  const [adminTab, setAdminTab] = useState<AdminTab>('videos');

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

  const handleOpenAdminAccess = () => {
    if (isAdminUnlocked) {
      const nextEnv = environment === 'admin' ? 'student' : 'admin';
      const direct = getDirectBootstrapPayload(nextEnv);
      localStorage.setItem(SESSION_TOKEN_KEY, direct.token);
      setToken(direct.token);
      setData(direct.payload);
      setEnvironment(nextEnv);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAdminLoginError(null);
      setAdminPassInput('');
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError(null);
    const normalizedEmail = adminEmailInput.trim().toLowerCase();
    const pass = adminPassInput.trim();

    if (
      (normalizedEmail === ADMIN_EMAIL || normalizedEmail === 'admin@thaielite.mx') &&
      pass.length >= 4
    ) {
      localStorage.setItem(ADMIN_AUTH_KEY, '1');
      setIsAdminUnlocked(true);
      setShowAdminLoginModal(false);
      const direct = getDirectBootstrapPayload('admin');
      localStorage.setItem(SESSION_TOKEN_KEY, direct.token);
      setToken(direct.token);
      setData(direct.payload);
      setEnvironment('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAdminLoginError(
        'Ingresa el correo de administrador (pedrinho.pedro248@gmail.com) y tu clave de mantenimiento (mínimo 4 caracteres).'
      );
    }
  };

  const handleLockAdmin = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdminUnlocked(false);
    const direct = getDirectBootstrapPayload('student');
    localStorage.setItem(SESSION_TOKEN_KEY, direct.token);
    setToken(direct.token);
    setData(direct.payload);
    setEnvironment('student');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyStudentLink = async () => {
    const studentUrl = `${window.location.origin}/`;
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

  const currentEnv = isAdminUnlocked ? environment : 'student';

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

  // Student view shows ONLY Videos & Bonuses (no account creation or profile tab)
  const studentNavItems: { id: StudentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'entrenamientos', label: 'Videos y Clases', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'bonos', label: 'Bonos PDF', icon: <Gift className="w-5 h-5" /> },
    { id: 'progreso', label: 'Mi Progreso', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  // Admin maintenance items (Videos, Módulos, Bonos, Configuración)
  const adminNavItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Resumen', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-5 h-5" /> },
    { id: 'modulos', label: 'Módulos', icon: <Layers className="w-5 h-5" /> },
    { id: 'bonos', label: 'Bonos PDF', icon: <FileText className="w-5 h-5" /> },
    { id: 'configuracion', label: 'Ajustes', icon: <Settings className="w-5 h-5" /> },
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
              Videos y Bonos Oficiales
            </span>
          </div>
        </div>

        {/* Admin Mode Controls (Only shown when Admin is logged in) */}
        {isAdminUnlocked && (
          <div className="p-4 border-b border-neutral-800 space-y-2.5">
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#090909] rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setEnvironment('student')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  currentEnv === 'student'
                    ? 'bg-[#E50914] text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Vista Videos
              </button>
              <button
                type="button"
                onClick={() => setEnvironment('admin')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  currentEnv === 'admin'
                    ? 'bg-[#E50914] text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Mantener Admin
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
                  <span className="text-emerald-400">¡Link Copiado!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
                  <span>Copiar Link de Acceso</span>
                </>
              )}
            </button>
          </div>
        )}

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

        {/* Progress & Discreet Admin Login Footer */}
        <div className="p-4 border-t border-neutral-800/80 space-y-3 bg-[#090909]/50">
          <div className="px-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Avance de Clases</span>
              <span className="tabular-nums text-white font-semibold">
                {progressStats.percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-[#E50914] transition-all duration-300"
                style={{ width: `${progressStats.percentage}%` }}
              />
            </div>
          </div>

          {isAdminUnlocked ? (
            <button
              type="button"
              onClick={handleLockAdmin}
              className="w-full px-3 py-2 min-h-[38px] rounded-xl bg-[#171717] hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Salir de Modo Admin</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAdminAccess}
              className="w-full px-3 py-2 min-h-[38px] rounded-xl bg-transparent hover:bg-neutral-900 border border-neutral-800/70 text-[11px] font-medium text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Acceso Admin (Mantener)</span>
            </button>
          )}
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
              else setAdminTab('videos');
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
                ? 'Modo Mantenimiento (Administrador)'
                : '500 Entrenamientos de Muay Thai y 5 Bonos PDF'}
            </span>
            <span className="whitespace-nowrap shrink-0 tabular-nums">
              Avance: {progressStats.percentage}%
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setEnvironment('student');
                setStudentTab('bonos');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-2.5 sm:px-3.5 py-1.5 min-h-[36px] rounded-lg bg-[#141414] hover:bg-neutral-800 border border-neutral-800 text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Gift className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
              <span>Bonos PDF</span>
            </button>

            {isAdminUnlocked ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setEnvironment(currentEnv === 'admin' ? 'student' : 'admin')
                  }
                  className="px-2.5 sm:px-3.5 py-1.5 min-h-[36px] rounded-lg bg-[#E50914] hover:bg-[#c40811] text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{currentEnv === 'admin' ? 'Ver Videos' : 'Panel Admin'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLockAdmin}
                  title="Salir del modo administrador"
                  className="p-2 min-h-[36px] rounded-lg bg-[#171717] hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleOpenAdminAccess}
                title="Acceso exclusivo de administrador para mantener videos y bonos"
                className="px-2.5 py-1.5 min-h-[36px] rounded-lg bg-[#141414] hover:bg-neutral-800 border border-neutral-800/80 text-[11px] font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Lock className="w-3 h-3 text-neutral-400" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </header>

        {/* Active Workspace View */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 pt-4 sm:pt-6">
          {currentEnv === 'student' ? (
            <StudentArea
              activeTab={studentTab === 'perfil' ? 'inicio' : studentTab}
              onChangeTab={(tab) => {
                setStudentTab(tab === 'perfil' ? 'inicio' : tab);
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
          <div className="grid grid-cols-4 items-center h-full">
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
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#E50914]" />
                  )}
                  {item.icon}
                  <span className="text-[10px] font-semibold tracking-tight mt-0.5 w-full text-center px-0.5 truncate">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-5 items-center h-full">
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
                  <span className="text-[10px] font-semibold tracking-tight mt-0.5 truncate max-w-[64px]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* ==========================================
          SINGLE ADMIN LOGIN MODAL (ONLY FOR MAINTENANCE)
      ========================================== */}
      {showAdminLoginModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Acceso de Administrador"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#141414] border border-neutral-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#E50914]">
                  Mantenimiento de Plataforma
                </span>
                <h2
                  className="text-2xl font-extrabold text-white uppercase mt-0.5"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  ACCESO EXCLUSIVO ADMIN
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Los alumnos acceden directo a los videos y bonos sin cuenta. Este login es únicamente para mantener la plataforma.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminLoginModal(false)}
                aria-label="Cerrar"
                className="p-2 rounded-xl bg-[#1f1f1f] hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminLoginError && (
              <div className="p-3 rounded-xl bg-[#E50914]/15 border border-[#E50914] text-xs text-red-200">
                {adminLoginError}
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-neutral-300 mb-1.5"
                >
                  Correo del Administrador
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090909] border border-neutral-800 text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-pass"
                  className="block text-xs font-semibold text-neutral-300 mb-1.5"
                >
                  Contraseña de Mantenimiento
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  required
                  placeholder="Ingresa tu contraseña de admin"
                  value={adminPassInput}
                  onChange={(e) => setAdminPassInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090909] border border-neutral-800 text-sm text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 min-h-[46px] rounded-xl bg-[#E50914] hover:bg-[#c40811] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Entrar al Panel de Mantenimiento
              </button>
            </form>
          </div>
        </div>
      )}

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
