import { REAL_DRIVE_VIDEOS } from '../data/realDriveCatalog';
import {
  BonusItem,
  BootstrapPayload,
  LiveClassItem,
  ModuleItem,
  PlatformSettings,
  UserProfile,
  UserProgress,
  VideoItem,
} from '../types';
import {
  buildDrivePreviewUrl,
  canAccessBonus,
  canAccessVipClasses,
  extractDriveFileId,
  PlanTier,
} from '../utils/driveUtils';
import { generateSpanishBonusPdfBytes } from '../utils/spanishBonusPdf';

const STORAGE_DB_KEY = 'thai_elite_vercel_db_v2';

interface LocalDatabase {
  users: UserProfile[];
  modules: ModuleItem[];
  videos: VideoItem[];
  bonuses: BonusItem[];
  progress: Record<string, UserProgress>;
  liveClasses: LiveClassItem[];
  settings: PlatformSettings;
}

function getInitialLocalDb(): LocalDatabase {
  const initialModules: ModuleItem[] = [
    {
      id: 'mod-01',
      code: '01',
      title: 'Fundamentos del Muay Thai',
      description:
        'Postura de combate, guardia tradicional tailandesa, equilibrio y control de distancia en el ring.',
      coverTheme: 'stance',
      order: 1,
    },
    {
      id: 'mod-02',
      code: '02',
      title: 'Técnicas de Puños',
      description:
        'Jab, cross, hooks, uppercuts y rotación de cadera aplicada al golpeo de Muay Thai.',
      coverTheme: 'punches',
      order: 2,
    },
    {
      id: 'mod-03',
      code: '03',
      title: 'Patadas y Low Kicks',
      description:
        'Teep frontal, patada circular a las piernas (Low Kick), patada media al cuerpo y patada alta.',
      coverTheme: 'kicks',
      order: 3,
    },
    {
      id: 'mod-04',
      code: '04',
      title: 'Rodillazos y Codazos',
      description:
        'Las armas letales de corta distancia: Sok (codos diagonales, giratorios) y Khao (rodillas rectas y en clinch).',
      coverTheme: 'elbows',
      order: 4,
    },
    {
      id: 'mod-05',
      code: '05',
      title: 'Defensa y Bloqueos',
      description:
        'Bloqueo de tibia (Check), desvíos de teep, esquivas, paradas de mano y salida de ángulos.',
      coverTheme: 'defense',
      order: 5,
    },
    {
      id: 'mod-06',
      code: '06',
      title: 'Combinaciones de Ataque',
      description:
        'Secuencias fluidas de 3 a 6 golpes integrando boxeo, patadas bajas, rodillas y codos.',
      coverTheme: 'combos',
      order: 6,
    },
    {
      id: 'mod-07',
      code: '07',
      title: 'Desplazamientos y Movilidad',
      description:
        'Juego de pies (Footwork), ritmo tailandés, corte de ring y pivotes defensivos y ofensivos.',
      coverTheme: 'footwork',
      order: 7,
    },
    {
      id: 'mod-08',
      code: '08',
      title: 'Entrenamientos para Principiantes',
      description:
        'Sesiones guiadas paso a paso desde cero para dominar la técnica sin experiencia previa.',
      coverTheme: 'beginners',
      order: 8,
    },
    {
      id: 'mod-09',
      code: '09',
      title: 'Acondicionamiento Físico',
      description:
        'Resistencia cardiovascular, potencia explosiva, fortalecimiento de tibias y core para peleadores.',
      coverTheme: 'conditioning',
      order: 9,
    },
    {
      id: 'mod-10',
      code: '10',
      title: 'Rutinas de Entrenamiento',
      description:
        'Circuitos completos en costal pesado, sombra técnica por rounds y preparación intensa.',
      coverTheme: 'routines',
      order: 10,
    },
  ];

  const initialBonuses: BonusItem[] = [
    {
      id: 'bono-01',
      code: 'BONO 01',
      title: '20 Combinaciones de Ataque Profesionales',
      description:
        'Manual práctico en PDF en español con las 20 secuencias ofensivas más efectivas del Muay Thai moderno (puños, codos, rodillas y low kicks).',
      coverTheme: 'combos',
      pdfFileName: 'Bono_01_20_Combinaciones_Ataque_Thai_Elite.pdf',
      allowedPlans: ['COMPLETO', 'VIP'],
      contentSections: [
        '1. Jab - Cross - Hook Izquierdo - Low Kick Derecho',
        '2. Teep Frontal - Finta de Teep - Codo Diagonal Derecho',
        '3. Jab al Cuerpo - Cross al Mentón - Rodilla Izquierda en Switch',
        '4. Check de Tibia - Contraataque Cross - Hook - Patada Media',
        '5. Entrada en Clinch - Doble Rodilla Lateral - Codo Corto de Salida',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bono-02',
      code: 'BONO 02',
      title: '50 Entrenamientos Físicos para Muay Thai',
      description:
        'Programa estructurado en español de acondicionamiento metabólico, potencia explosiva y resistencia para 5 rounds intensos.',
      coverTheme: 'conditioning',
      pdfFileName: 'Bono_02_50_Entrenamientos_Fisicos_Muay_Thai.pdf',
      allowedPlans: ['COMPLETO', 'VIP'],
      contentSections: [
        'Bloque 1: Sprints de Potencia y Cuerda Tailandesa Pesada',
        'Bloque 2: Circuito Explosivo de 100 Patadas por Pierna en Costal',
        'Bloque 3: Fortalecimiento de Cuello, Core Rotacional y Tibias',
        'Bloque 4: Resistencia Anaeróbica por Rounds de 3x1 Minutos',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bono-03',
      code: 'BONO 03',
      title: '50 Técnicas de Defensa y Contraataque',
      description:
        'Guía táctica en español de bloqueos de tibia, barridos, capturas de patada y respuestas inmediatas de alto impacto.',
      coverTheme: 'defense',
      pdfFileName: 'Bono_03_50_Tecnicas_Defensa_Contraataque.pdf',
      allowedPlans: ['COMPLETO', 'VIP'],
      contentSections: [
        'Sección A: Defensa contra Boxeadores Agresivos (Long Guard y Codos)',
        'Sección B: Captura de Patada Media y Barrido del Pie de Apoyo',
        'Sección C: Salidas Laterales en las Cuerdas y Contraataque con Rodilla',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bono-04',
      code: 'BONO 04',
      title: 'Guía de Fundamentos del Muay Thai',
      description:
        'Compendio esencial en español de vendaje profesional de manos, nomenclatura tailandesa, reglas y principios de guardia.',
      coverTheme: 'fundamentals',
      pdfFileName: 'Bono_04_Guia_Fundamentos_Muay_Thai.pdf',
      allowedPlans: ['ESENCIAL', 'COMPLETO', 'VIP'],
      contentSections: [
        'Capítulo 1: Vendaje Tailandés de Nudillos y Muñeca Paso a Paso',
        'Capítulo 2: Las 8 Extremidades (Chok, Tei, Khao, Sok)',
        'Capítulo 3: Control de la Respiración y Ritmo en Sombra',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bono-05',
      code: 'BONO 05',
      title: 'Guía de Recuperación Muscular',
      description:
        'Protocolos en español de movilidad articular, descarga post-entrenamiento, hidratación y cuidado de tibias e impactos.',
      coverTheme: 'recovery',
      pdfFileName: 'Bono_05_Guia_Recuperacion_Muscular.pdf',
      allowedPlans: ['COMPLETO', 'VIP'],
      contentSections: [
        'Protocolo 1: Movilidad de Cadera y Tobillos para Patadas Altas',
        'Protocolo 2: Tratamiento de Impactos en Tibias y Antebrazos',
        'Protocolo 3: Nutrición e Hidratación de Recuperación Nocturna',
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  const initialUsers: UserProfile[] = [
    {
      id: 'usr-admin-01',
      name: 'Administrador Thai Elite',
      email: 'pedrinho.pedro248@gmail.com',
      role: 'admin',
      plan: 'VIP',
      blocked: false,
      unlockedBonusIds: ['bono-01', 'bono-02', 'bono-03', 'bono-04', 'bono-05'],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'usr-student-vip',
      name: 'Alumno Thai Elite',
      email: 'alumno@thaielite.mx',
      role: 'student',
      plan: 'VIP',
      blocked: false,
      unlockedBonusIds: ['bono-01', 'bono-02', 'bono-03', 'bono-04', 'bono-05'],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'usr-student-completo',
      name: 'Valeria Ramírez (Plan Completo)',
      email: 'valeria.ramirez@thaielite.mx',
      role: 'student',
      plan: 'COMPLETO',
      blocked: false,
      unlockedBonusIds: [],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'usr-student-esencial',
      name: 'Diego Hernández (Plan Esencial)',
      email: 'diego.hernandez@thaielite.mx',
      role: 'student',
      plan: 'ESENCIAL',
      blocked: false,
      unlockedBonusIds: ['bono-04'],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  return {
    users: initialUsers,
    modules: initialModules,
    videos: REAL_DRIVE_VIDEOS,
    bonuses: initialBonuses,
    progress: {
      'usr-student-vip': {
        userId: 'usr-student-vip',
        completedVideoIds: [],
        favoriteVideoIds: [],
        lastWatchedVideoId: null,
        updatedAt: new Date().toISOString(),
      },
      'usr-admin-01': {
        userId: 'usr-admin-01',
        completedVideoIds: [],
        favoriteVideoIds: [],
        lastWatchedVideoId: null,
        updatedAt: new Date().toISOString(),
      },
    },
    liveClasses: [],
    settings: {
      whatsappVipUrl: 'https://chat.whatsapp.com/ThaiEliteMexicoVIP',
      supportEmail: 'soporte@thaielitemexico.com',
      platformAnnouncement: '500 ENTRENAMIENTOS DE MUAY THAI',
    },
  };
}

function loadLocalDb(): LocalDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_DB_KEY);
    if (!raw) {
      const initial = getInitialLocalDb();
      localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as LocalDatabase;
    if (!Array.isArray(parsed.videos) || parsed.videos.length < 10) {
      parsed.videos = REAL_DRIVE_VIDEOS;
    }
    return parsed;
  } catch {
    return getInitialLocalDb();
  }
}

function saveLocalDb(db: LocalDatabase): void {
  try {
    localStorage.setItem(STORAGE_DB_KEY, JSON.stringify(db));
  } catch {
    // ignore storage quota errors
  }
}

function encodeLocalToken(user: UserProfile): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
  };
  return 'vercel_' + btoa(encodeURIComponent(JSON.stringify(payload)));
}

function resolveUserFromHeaders(db: LocalDatabase, headers?: HeadersInit): UserProfile {
  let auth = '';
  if (headers instanceof Headers) {
    auth = headers.get('Authorization') || headers.get('authorization') || '';
  } else if (Array.isArray(headers)) {
    const found = headers.find(([k]) => k.toLowerCase() === 'authorization');
    if (found) auth = found[1];
  } else if (headers && typeof headers === 'object') {
    auth =
      (headers as Record<string, string>)['Authorization'] ||
      (headers as Record<string, string>)['authorization'] ||
      '';
  }

  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (token.startsWith('vercel_')) {
    try {
      const decoded = JSON.parse(decodeURIComponent(atob(token.slice(7))));
      const found = db.users.find((u) => u.id === decoded.userId);
      if (found) return found;
    } catch {
      // fallback below
    }
  }
  return (
    db.users.find((u) => u.role === 'student' && !u.blocked) ||
    db.users[0]
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleFallbackApiRequest(
  urlStr: string,
  init?: RequestInit
): Promise<Response> {
  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = (init?.method || 'GET').toUpperCase();
  const db = loadLocalDb();

  let body: any = {};
  if (init?.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  // 1. POST /api/auth/login
  if (path === '/api/auth/login' && method === 'POST') {
    const normalizedEmail = String(body.email || '').trim().toLowerCase();
    const requestedRole = body.role === 'admin' ? 'admin' : 'student';

    if (!normalizedEmail) {
      const targetUser =
        requestedRole === 'admin'
          ? db.users.find((u) => u.role === 'admin') || db.users[0]
          : db.users.find((u) => u.id === 'usr-student-vip') ||
            db.users.find((u) => u.role === 'student') ||
            db.users[0];
      return jsonResponse({
        token: encodeLocalToken(targetUser),
        user: targetUser,
      });
    }

    let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      const inferredName = normalizedEmail
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      user = {
        id: `usr-${Date.now()}`,
        name: inferredName || 'Alumno Thai Elite',
        email: normalizedEmail,
        role:
          normalizedEmail === 'pedrinho.pedro248@gmail.com'
            ? 'admin'
            : requestedRole,
        plan: 'VIP',
        blocked: false,
        unlockedBonusIds: ['bono-01', 'bono-02', 'bono-03', 'bono-04', 'bono-05'],
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      db.progress[user.id] = {
        userId: user.id,
        completedVideoIds: [],
        favoriteVideoIds: [],
        lastWatchedVideoId: null,
        updatedAt: new Date().toISOString(),
      };
      saveLocalDb(db);
    }

    if (user.blocked) {
      return jsonResponse(
        { error: 'Tu acceso se encuentra temporalmente suspendido.' },
        403
      );
    }

    return jsonResponse({
      token: encodeLocalToken(user),
      user,
    });
  }

  // 2. POST /api/auth/quick-access
  if (path === '/api/auth/quick-access' && method === 'POST') {
    const role = body.targetRole === 'admin' ? 'admin' : 'student';
    const user =
      role === 'admin'
        ? db.users.find((u) => u.role === 'admin') || db.users[0]
        : db.users.find((u) => u.id === 'usr-student-vip') ||
          db.users.find((u) => u.role === 'student') ||
          db.users[0];
    return jsonResponse({
      token: encodeLocalToken(user),
      user,
    });
  }

  // 3. POST /api/auth/google
  if (path === '/api/auth/google' && method === 'POST') {
    const normalizedEmail = String(body.email || 'alumno@thaielite.mx')
      .trim()
      .toLowerCase();
    let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: String(body.displayName || normalizedEmail.split('@')[0]),
        email: normalizedEmail,
        role:
          normalizedEmail === 'pedrinho.pedro248@gmail.com' ? 'admin' : 'student',
        plan: 'VIP',
        blocked: false,
        unlockedBonusIds: ['bono-01', 'bono-02', 'bono-03', 'bono-04', 'bono-05'],
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveLocalDb(db);
    }
    return jsonResponse({
      token: encodeLocalToken(user),
      user,
    });
  }

  const currentUser = resolveUserFromHeaders(db, init?.headers);

  // 4. GET /api/bootstrap
  if (path === '/api/bootstrap' && method === 'GET') {
    const userProgress = db.progress[currentUser.id] || {
      userId: currentUser.id,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };

    const sortedModules = [...db.modules].sort((a, b) => a.order - b.order);
    const sortedVideos = [...db.videos].sort((a, b) => a.order - b.order);

    const bonusesWithAccess: BonusItem[] = db.bonuses.map((b) => ({
      ...b,
      hasAccess: canAccessBonus(currentUser, b),
    }));

    const payload: BootstrapPayload = {
      user: currentUser,
      modules: sortedModules,
      videos: sortedVideos,
      bonuses: bonusesWithAccess,
      progress: userProgress,
      liveClasses: db.liveClasses,
      vipAllowed: canAccessVipClasses(currentUser),
      settings: db.settings,
      adminData: {
        students: db.users
          .filter((u) => u.role === 'student')
          .map((s) => ({
            ...s,
            progress: db.progress[s.id] || {
              userId: s.id,
              completedVideoIds: [],
              favoriteVideoIds: [],
              lastWatchedVideoId: null,
              updatedAt: new Date().toISOString(),
            },
          })),
      },
    };

    return jsonResponse(payload);
  }

  // 5. Progress endpoints
  if (path === '/api/progress/watch' && method === 'POST') {
    const prog = db.progress[currentUser.id] || {
      userId: currentUser.id,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };
    prog.lastWatchedVideoId = String(body.videoId || '');
    prog.updatedAt = new Date().toISOString();
    db.progress[currentUser.id] = prog;
    saveLocalDb(db);
    return jsonResponse({ progress: prog });
  }

  if (path === '/api/progress/toggle-complete' && method === 'POST') {
    const videoId = String(body.videoId || '');
    const prog = db.progress[currentUser.id] || {
      userId: currentUser.id,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };
    const idx = prog.completedVideoIds.indexOf(videoId);
    if (idx === -1) prog.completedVideoIds.push(videoId);
    else prog.completedVideoIds.splice(idx, 1);
    prog.lastWatchedVideoId = videoId;
    prog.updatedAt = new Date().toISOString();
    db.progress[currentUser.id] = prog;
    saveLocalDb(db);
    return jsonResponse({ progress: prog });
  }

  if (path === '/api/progress/toggle-favorite' && method === 'POST') {
    const videoId = String(body.videoId || '');
    const prog = db.progress[currentUser.id] || {
      userId: currentUser.id,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };
    const idx = prog.favoriteVideoIds.indexOf(videoId);
    if (idx === -1) prog.favoriteVideoIds.push(videoId);
    else prog.favoriteVideoIds.splice(idx, 1);
    prog.updatedAt = new Date().toISOString();
    db.progress[currentUser.id] = prog;
    saveLocalDb(db);
    return jsonResponse({ progress: prog });
  }

  // 6. PUT /api/profile
  if (path === '/api/profile' && method === 'PUT') {
    if (body.name && String(body.name).trim()) {
      currentUser.name = String(body.name).trim();
      saveLocalDb(db);
    }
    return jsonResponse({ user: currentUser });
  }

  // 7. GET /api/bonuses/:id/download
  const bonusMatch = path.match(/^\/api\/bonuses\/([^/]+)\/download$/);
  if (bonusMatch && method === 'GET') {
    const bonusId = bonusMatch[1];
    const bonus = db.bonuses.find((b) => b.id === bonusId);
    if (!bonus) {
      return jsonResponse({ error: 'Bono no encontrado.' }, 404);
    }
    const pdfBytes = generateSpanishBonusPdfBytes(bonus);
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${bonus.pdfFileName}"`,
      },
    });
  }

  // 8. Admin endpoints
  if (path === '/api/admin/videos' && method === 'POST') {
    const fileId = extractDriveFileId(String(body.driveLink || '')) || `drv-${Date.now()}`;
    const newVid: VideoItem = {
      id: `vid-${Date.now()}`,
      moduleId: String(body.moduleId || 'mod-01'),
      title: String(body.title || 'Nueva Clase de Muay Thai'),
      description: String(body.description || ''),
      driveLink: String(body.driveLink || ''),
      driveFileId: fileId,
      previewUrl: buildDrivePreviewUrl(fileId),
      thumbnailUrl: String(body.thumbnailUrl || ''),
      duration: String(body.duration || '15:00'),
      order: Number(body.order || 1),
      embedAllowed: body.embedAllowed !== false,
      createdAt: new Date().toISOString(),
    };
    db.videos.push(newVid);
    saveLocalDb(db);
    return jsonResponse({ video: newVid }, 201);
  }

  const editVideoMatch = path.match(/^\/api\/admin\/videos\/([^/]+)$/);
  if (editVideoMatch && method === 'PUT') {
    const vid = db.videos.find((v) => v.id === editVideoMatch[1]);
    if (vid) {
      Object.assign(vid, {
        title: body.title ?? vid.title,
        description: body.description ?? vid.description,
        moduleId: body.moduleId ?? vid.moduleId,
        driveLink: body.driveLink ?? vid.driveLink,
        thumbnailUrl: body.thumbnailUrl ?? vid.thumbnailUrl,
        duration: body.duration ?? vid.duration,
        order: Number(body.order ?? vid.order),
        embedAllowed: body.embedAllowed ?? vid.embedAllowed,
      });
      saveLocalDb(db);
    }
    return jsonResponse({ video: vid });
  }

  if (editVideoMatch && method === 'DELETE') {
    db.videos = db.videos.filter((v) => v.id !== editVideoMatch[1]);
    saveLocalDb(db);
    return jsonResponse({ ok: true });
  }

  const editModMatch = path.match(/^\/api\/admin\/modules\/([^/]+)$/);
  if (editModMatch && method === 'PUT') {
    const mod = db.modules.find((m) => m.id === editModMatch[1]);
    if (mod) {
      mod.code = body.code ?? mod.code;
      mod.title = body.title ?? mod.title;
      mod.description = body.description ?? mod.description;
      mod.coverUrl = body.coverUrl ?? mod.coverUrl;
      saveLocalDb(db);
    }
    return jsonResponse({ module: mod });
  }

  if (path === '/api/admin/bonuses' && method === 'POST') {
    const newBonus: BonusItem = {
      id: `bono-${Date.now()}`,
      code: String(body.code || 'BONO'),
      title: String(body.title || 'Nuevo Bono en Español'),
      description: String(body.description || ''),
      coverTheme: 'combos',
      coverUrl: String(body.coverUrl || ''),
      pdfDriveLink: String(body.pdfDriveLink || ''),
      pdfFileName: String(body.pdfFileName || 'Bono_Thai_Elite_Espanol.pdf'),
      allowedPlans: (body.allowedPlans as PlanTier[]) || ['COMPLETO', 'VIP'],
      createdAt: new Date().toISOString(),
    };
    db.bonuses.push(newBonus);
    saveLocalDb(db);
    return jsonResponse({ bonus: newBonus }, 201);
  }

  const editBonusMatch = path.match(/^\/api\/admin\/bonuses\/([^/]+)$/);
  if (editBonusMatch && method === 'PUT') {
    const b = db.bonuses.find((item) => item.id === editBonusMatch[1]);
    if (b) {
      Object.assign(b, {
        code: body.code ?? b.code,
        title: body.title ?? b.title,
        description: body.description ?? b.description,
        coverUrl: body.coverUrl ?? b.coverUrl,
        pdfDriveLink: body.pdfDriveLink ?? b.pdfDriveLink,
        pdfFileName: body.pdfFileName ?? b.pdfFileName,
        allowedPlans: body.allowedPlans ?? b.allowedPlans,
      });
      saveLocalDb(db);
    }
    return jsonResponse({ bonus: b });
  }

  if (editBonusMatch && method === 'DELETE') {
    db.bonuses = db.bonuses.filter((b) => b.id !== editBonusMatch[1]);
    saveLocalDb(db);
    return jsonResponse({ ok: true });
  }

  if (path === '/api/admin/students' && method === 'POST') {
    const newStudent: UserProfile = {
      id: `usr-${Date.now()}`,
      name: String(body.name || 'Nuevo Alumno'),
      email: String(body.email || `alumno${Date.now()}@thaielite.mx`).toLowerCase(),
      role: 'student',
      plan: (body.plan as PlanTier) || 'COMPLETO',
      blocked: false,
      unlockedBonusIds: [],
      createdAt: new Date().toISOString(),
    };
    db.users.push(newStudent);
    saveLocalDb(db);
    return jsonResponse({ student: newStudent }, 201);
  }

  const editStudentMatch = path.match(/^\/api\/admin\/students\/([^/]+)$/);
  if (editStudentMatch && method === 'PUT') {
    const st = db.users.find((u) => u.id === editStudentMatch[1]);
    if (st) {
      if (body.plan) st.plan = body.plan;
      if (typeof body.blocked === 'boolean') st.blocked = body.blocked;
      if (Array.isArray(body.unlockedBonusIds))
        st.unlockedBonusIds = body.unlockedBonusIds;
      saveLocalDb(db);
    }
    return jsonResponse({ student: st });
  }

  if (editStudentMatch && method === 'DELETE') {
    db.users = db.users.filter((u) => u.id !== editStudentMatch[1]);
    saveLocalDb(db);
    return jsonResponse({ ok: true });
  }

  if (path === '/api/admin/settings' && method === 'PUT') {
    db.settings = {
      whatsappVipUrl: body.whatsappVipUrl ?? db.settings.whatsappVipUrl,
      supportEmail: body.supportEmail ?? db.settings.supportEmail,
      platformAnnouncement:
        body.platformAnnouncement ?? db.settings.platformAnnouncement,
    };
    saveLocalDb(db);
    return jsonResponse({ settings: db.settings });
  }

  return jsonResponse({ ok: true });
}

/**
 * Returns a synchronous bootstrap payload and session token so the Student Area
 * opens immediately via direct link without requiring login or account creation.
 */
export function getDirectBootstrapPayload(
  role: 'student' | 'admin' = 'student'
): { token: string; payload: BootstrapPayload } {
  const db = loadLocalDb();
  const targetUser =
    role === 'admin'
      ? db.users.find((u) => u.role === 'admin') || db.users[0]
      : db.users.find((u) => u.id === 'usr-student-vip') ||
        db.users.find((u) => u.role === 'student' && !u.blocked) ||
        db.users[0];

  const userProgress = db.progress[targetUser.id] || {
    userId: targetUser.id,
    completedVideoIds: [],
    favoriteVideoIds: [],
    lastWatchedVideoId: null,
    updatedAt: new Date().toISOString(),
  };

  const sortedModules = [...db.modules].sort((a, b) => a.order - b.order);
  const sortedVideos = [...db.videos].sort((a, b) => a.order - b.order);
  const bonusesWithAccess: BonusItem[] = db.bonuses.map((b) => ({
    ...b,
    hasAccess: canAccessBonus(targetUser, b),
  }));

  const payload: BootstrapPayload = {
    user: targetUser,
    modules: sortedModules,
    videos: sortedVideos,
    bonuses: bonusesWithAccess,
    progress: userProgress,
    liveClasses: db.liveClasses,
    vipAllowed: canAccessVipClasses(targetUser),
    settings: db.settings,
    adminData: {
      students: db.users
        .filter((u) => u.role === 'student')
        .map((s) => ({
          ...s,
          progress: db.progress[s.id] || {
            userId: s.id,
            completedVideoIds: [],
            favoriteVideoIds: [],
            lastWatchedVideoId: null,
            updatedAt: new Date().toISOString(),
          },
        })),
    },
  };

  return {
    token: encodeLocalToken(targetUser),
    payload,
  };
}

const nativeFetch: typeof fetch | null =
  typeof window !== 'undefined' && typeof window.fetch === 'function'
    ? window.fetch.bind(window)
    : null;

/**
 * Performs an API fetch that works seamlessly both with the Express backend
 * AND on static Vercel deployments (falling back to local browser storage).
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const urlStr =
    typeof input === 'string'
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;

  const isApiCall =
    urlStr.startsWith('/api/') ||
    (typeof window !== 'undefined' &&
      urlStr.startsWith(`${window.location.origin}/api/`));

  if (!isApiCall) {
    return nativeFetch ? nativeFetch(input, init) : fetch(input, init);
  }

  try {
    const fn = nativeFetch || fetch;
    const response = await fn(input, init);
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (
      !response.ok ||
      (!contentType.includes('application/json') &&
        !contentType.includes('application/pdf'))
    ) {
      return handleFallbackApiRequest(urlStr, init);
    }
    return response;
  } catch {
    return handleFallbackApiRequest(urlStr, init);
  }
}

/**
 * Safely installs the `/api/*` fallback if the environment allows overriding `window.fetch`.
 * Never throws if `window.fetch` is a read-only getter in an iframe sandbox.
 */
export function installVercelApiFallback(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.defineProperty(window, 'fetch', {
      value: apiFetch,
      writable: true,
      configurable: true,
    });
  } catch {
    // In environments where window.fetch has only a non-configurable getter,
    // components call apiFetch() directly.
  }
}

