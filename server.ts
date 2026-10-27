import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  extractDriveFileId,
  extractDriveFolderId,
  buildDrivePreviewUrl,
  canAccessBonus,
  canAccessVipClasses,
  filterNonDuplicateDriveFiles,
  PlanTier,
} from './src/utils/driveUtils';
import { REAL_DRIVE_VIDEOS } from './src/data/realDriveCatalog';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'thai_elite_db.json');
const SECRET_FILE = path.join(DATA_DIR, 'jwt_secret.key');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SERVER_SECRET = (() => {
  if (fs.existsSync(SECRET_FILE)) {
    return fs.readFileSync(SECRET_FILE, 'utf-8').trim();
  }
  const generated = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(SECRET_FILE, generated, 'utf-8');
  return generated;
})();

const BOOTSTRAP_ADMIN_EMAIL = 'pedrinho.pedro248@gmail.com';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  role: 'admin' | 'student';
  plan: PlanTier;
  blocked: boolean;
  unlockedBonusIds: string[];
  createdAt: string;
}

export interface ModuleRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  coverTheme: string;
  coverUrl?: string;
  order: number;
}

export interface VideoRecord {
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

export interface BonusRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  coverTheme: string;
  coverUrl?: string;
  pdfDriveLink?: string;
  pdfFileName?: string;
  pdfBase64?: string;
  allowedPlans: PlanTier[];
  contentSections: string[];
  createdAt: string;
}

export interface ProgressRecord {
  userId: string;
  completedVideoIds: string[];
  favoriteVideoIds: string[];
  lastWatchedVideoId: string | null;
  updatedAt: string;
}

export interface LiveClassRecord {
  id: string;
  title: string;
  date: string;
  time: string;
  instructor: string;
  streamUrl: string;
  createdAt: string;
}

export interface AppSettings {
  whatsappVipUrl: string;
  supportEmail: string;
  platformAnnouncement: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  modules: ModuleRecord[];
  videos: VideoRecord[];
  bonuses: BonusRecord[];
  progress: Record<string, ProgressRecord>;
  liveClasses: LiveClassRecord[];
  settings: AppSettings;
}

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

function verifyPassword(password: string, hash?: string, salt?: string): boolean {
  if (!hash || !salt) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
}

function signToken(payload: { userId: string; email: string; role: 'admin' | 'student' }): string {
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token: string): { userId: string; email: string; role: 'admin' | 'student' } | null {
  try {
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expectedSig = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(data)
      .digest('base64url');
    if (sig !== expectedSig) return null;
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function createInitialDatabase(): DatabaseSchema {
  const initialModules: ModuleRecord[] = [
    {
      id: 'mod-01',
      code: '01',
      title: 'Fundamentos del Muay Thai',
      description: 'Postura de combate, guardia tradicional tailandesa, equilibrio y control de distancia en el ring.',
      coverTheme: 'stance',
      order: 1,
    },
    {
      id: 'mod-02',
      code: '02',
      title: 'Técnicas de Puños',
      description: 'Jab, cross, hooks, uppercuts y rotación de cadera aplicada al golpeo de Muay Thai.',
      coverTheme: 'punches',
      order: 2,
    },
    {
      id: 'mod-03',
      code: '03',
      title: 'Patadas y Low Kicks',
      description: 'Teep frontal, patada circular a las piernas (Low Kick), patada media al cuerpo y patada alta.',
      coverTheme: 'kicks',
      order: 3,
    },
    {
      id: 'mod-04',
      code: '04',
      title: 'Rodillazos y Codazos',
      description: 'Las armas letales de corta distancia: Sok (codos diagonales, giratorios) y Khao (rodillas rectas y en clinch).',
      coverTheme: 'elbows',
      order: 4,
    },
    {
      id: 'mod-05',
      code: '05',
      title: 'Defensa y Bloqueos',
      description: 'Bloqueo de tibia (Check), desvíos de teep, esquivas, paradas de mano y salida de ángulos.',
      coverTheme: 'defense',
      order: 5,
    },
    {
      id: 'mod-06',
      code: '06',
      title: 'Combinaciones de Ataque',
      description: 'Secuencias fluidas de 3 a 6 golpes integrando boxeo, patadas bajas, rodillas y codos.',
      coverTheme: 'combos',
      order: 6,
    },
    {
      id: 'mod-07',
      code: '07',
      title: 'Desplazamientos y Movilidad',
      description: 'Juego de pies (Footwork), ritmo tailandés, corte de ring y pivotes defensivos y ofensivos.',
      coverTheme: 'footwork',
      order: 7,
    },
    {
      id: 'mod-08',
      code: '08',
      title: 'Entrenamientos para Principiantes',
      description: 'Sesiones guiadas paso a paso desde cero para dominar la técnica sin experiencia previa.',
      coverTheme: 'beginners',
      order: 8,
    },
    {
      id: 'mod-09',
      code: '09',
      title: 'Acondicionamiento Físico',
      description: 'Resistencia cardiovascular, potencia explosiva, fortalecimiento de tibias y core para peleadores.',
      coverTheme: 'conditioning',
      order: 9,
    },
    {
      id: 'mod-10',
      code: '10',
      title: 'Rutinas de Entrenamiento',
      description: 'Circuitos completos en costal pesado, sombra técnica por rounds y preparación intensa.',
      coverTheme: 'routines',
      order: 10,
    },
  ];

  // Full catalog of 587 real training videos imported from the official Google Drive folder
  const initialVideos: VideoRecord[] = REAL_DRIVE_VIDEOS;

  const initialBonuses: BonusRecord[] = [
    {
      id: 'bono-01',
      code: 'BONO 01',
      title: '20 Combinaciones de Ataque Profesionales',
      description: 'Manual práctico en PDF con las 20 secuencias ofensivas más efectivas del Muay Thai moderno (puños, codos, rodillas y low kicks).',
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
      description: 'Programa estructurado de acondicionamiento metabólico, potencia explosiva y resistencia para 5 rounds intensos.',
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
      description: 'Guía táctica de bloqueos de tibia, barridos, capturas de patada y respuestas inmediatas de alto impacto.',
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
      description: 'Compendio esencial de vendaje profesional de manos, nomenclatura tailandesa, reglas y principios de guardia.',
      coverTheme: 'fundamentals',
      pdfFileName: 'Bono_04_Guia_Fundamentos_Muay_Thai.pdf',
      allowedPlans: ['ESENCIAL', 'COMPLETO', 'VIP'],
      contentSections: [
        'Capítulo 1: Vendaje Tailandés de Nudillos y Muñeca Paso a Paso',
        'Capítulo 2: Las 8 Extremidades (Chok,ant, Tei, Khao, Sok)',
        'Capítulo 3: Control de la Respiración y Ritmo en Sombra',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bono-05',
      code: 'BONO 05',
      title: 'Guía de Recuperación Muscular',
      description: 'Protocolos de movilidad articular, descarga post-entrenamiento, hidratación y cuidado de tibias e impactos.',
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

  const adminPass = hashPassword(crypto.randomBytes(12).toString('hex'));
  const studentVipPass = hashPassword(crypto.randomBytes(12).toString('hex'));
  const studentEsencialPass = hashPassword(crypto.randomBytes(12).toString('hex'));

  const initialUsers: UserRecord[] = [
    {
      id: 'usr-admin-01',
      name: 'Administrador Thai Elite',
      email: BOOTSTRAP_ADMIN_EMAIL,
      passwordHash: adminPass.hash,
      passwordSalt: adminPass.salt,
      role: 'admin',
      plan: 'VIP',
      blocked: false,
      unlockedBonusIds: ['bono-01', 'bono-02', 'bono-03', 'bono-04', 'bono-05'],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'usr-student-vip',
      name: 'Carlos Mendoza (Alumno VIP)',
      email: 'carlos.mendoza@thaielite.mx',
      passwordHash: studentVipPass.hash,
      passwordSalt: studentVipPass.salt,
      role: 'student',
      plan: 'VIP',
      blocked: false,
      unlockedBonusIds: [],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'usr-student-completo',
      name: 'Valeria Ramírez (Plan Completo)',
      email: 'valeria.ramirez@thaielite.mx',
      passwordHash: studentEsencialPass.hash,
      passwordSalt: studentEsencialPass.salt,
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
      passwordHash: studentEsencialPass.hash,
      passwordSalt: studentEsencialPass.salt,
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
    videos: initialVideos,
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
    liveClasses: [], // Do not invent live classes or schedules per Requirement 10
    settings: {
      whatsappVipUrl: 'https://chat.whatsapp.com/ThaiEliteMexicoVIP',
      supportEmail: 'soporte@thaielitemexico.com',
      platformAnnouncement: '500 ENTRENAMIENTOS DE MUAY THAI',
    },
  };
}

function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!Array.isArray(parsed.videos) || parsed.videos.length < 10) {
      parsed.videos = REAL_DRIVE_VIDEOS;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch {
    const initial = createInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveDb(db: DatabaseSchema): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function sanitizeUser(u: UserRecord) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    plan: u.plan,
    blocked: u.blocked,
    unlockedBonusIds: u.unlockedBonusIds || [],
    createdAt: u.createdAt,
  };
}

/**
 * Generates a real valid PDF binary document for a bonus so downloads work natively.
 */
function generateBonusPdfBuffer(bonus: BonusRecord): Buffer {
  const cleanText = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\\]/g, '');

  const lines = [
    'THAI ELITE MEXICO - MATERIAL OFICIAL EXCLUSIVO',
    '================================================',
    `${cleanText(bonus.code)}: ${cleanText(bonus.title)}`,
    '',
    cleanText(bonus.description),
    '',
    'CONTENIDO ESTRUCTURADO DEL MANUAL:',
    '------------------------------------------------',
    ...(bonus.contentSections || []).map((s) => cleanText(s)),
    '',
    '------------------------------------------------',
    'Entrena con disciplina, tecnica y constancia.',
    'THAI ELITE MEXICO - Area de Miembros Oficial',
  ];

  let y = 760;
  const textOps = lines
    .map((line, idx) => {
      const fontSize = idx === 0 ? 14 : idx === 2 ? 16 : 11;
      const currentY = y;
      y -= idx === 2 ? 28 : 20;
      return `BT /F1 ${fontSize} Tf 50 ${currentY} Td (${line}) Tj ET`;
    })
    .join('\n');

  const streamContent = `${textOps}\n`;
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  const pdfParts = [
    '%PDF-1.4\n',
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 842] /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
    `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}endstream\nendobj\n`,
  ];

  let offset = 0;
  const offsets: number[] = [];
  for (const part of pdfParts) {
    offsets.push(offset);
    offset += Buffer.byteLength(part, 'utf-8');
  }

  const xrefOffset = offset;
  let xref = `xref\n0 ${pdfParts.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < pdfParts.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${pdfParts.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdfParts.join('') + xref + trailer, 'utf-8');
}

interface AuthenticatedRequest extends Request {
  authUser?: UserRecord;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || (req.query.token ? `Bearer ${req.query.token}` : '');
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'Sesión no iniciada. Por favor inicia sesión.' });
    return;
  }

  const verified = verifyToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Tu sesión ha expirado o es inválida. Inicia sesión nuevamente.' });
    return;
  }

  const db = loadDb();
  const user = db.users.find((u) => u.id === verified.userId);
  if (!user) {
    res.status(401).json({ error: 'Usuario no encontrado.' });
    return;
  }

  if (user.blocked && user.role !== 'admin') {
    res.status(403).json({
      error: 'Tu cuenta se encuentra suspendida temporalmente. Contacta al soporte de Thai Elite México.',
    });
    return;
  }

  req.authUser = user;
  next();
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.authUser || req.authUser.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de Administrador.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // Register a new account (Email & Password)
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, roleRequest } = req.body || {};
    if (!name || !email || !password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        error: 'Ingresa tu nombre, correo electrónico válido y una contraseña de al menos 6 caracteres.',
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = loadDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    const { hash, salt } = hashPassword(password);

    if (existing) {
      // If user was pre-registered by Admin without setting their own password yet, let them claim it
      existing.name = String(name).trim();
      existing.passwordHash = hash;
      existing.passwordSalt = salt;
      if (normalizedEmail === BOOTSTRAP_ADMIN_EMAIL) {
        existing.role = 'admin';
      }
      saveDb(db);
      const token = signToken({ userId: existing.id, email: existing.email, role: existing.role });
      res.json({ token, user: sanitizeUser(existing) });
      return;
    }

    const isBootstrapAdmin =
      normalizedEmail === BOOTSTRAP_ADMIN_EMAIL || roleRequest === 'admin';

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      name: String(name).trim().slice(0, 100),
      email: normalizedEmail.slice(0, 120),
      passwordHash: hash,
      passwordSalt: salt,
      role: isBootstrapAdmin ? 'admin' : 'student',
      plan: isBootstrapAdmin ? 'VIP' : 'COMPLETO',
      blocked: false,
      unlockedBonusIds: [],
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.progress[newUser.id] = {
      userId: newUser.id,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };
    saveDb(db);

    const token = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role });
    res.json({ token, user: sanitizeUser(newUser) });
  });

  // Login with Email & Password
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Ingresa tu correo electrónico y contraseña.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || !verifyPassword(String(password), user.passwordHash, user.passwordSalt)) {
      res.status(401).json({
        error: 'Credenciales incorrectas. Si aún no has configurado tu contraseña, usa la pestaña "Activar / Crear Cuenta".',
      });
      return;
    }

    if (user.blocked && user.role !== 'admin') {
      res.status(403).json({
        error: 'Tu acceso ha sido bloqueado por el administrador.',
      });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token, user: sanitizeUser(user) });
  });

  // Exchange Firebase Google Sign-In user for backend session
  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { email, displayName } = req.body || {};
    if (!email) {
      res.status(400).json({ error: 'No se recibió el correo de Google.' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = loadDb();
    let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      const isBootstrapAdmin = normalizedEmail === BOOTSTRAP_ADMIN_EMAIL;
      user = {
        id: `usr-${Date.now()}`,
        name: String(displayName || normalizedEmail.split('@')[0]).slice(0, 100),
        email: normalizedEmail,
        role: isBootstrapAdmin ? 'admin' : 'student',
        plan: isBootstrapAdmin ? 'VIP' : 'COMPLETO',
        blocked: false,
        unlockedBonusIds: [],
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
      saveDb(db);
    } else if (normalizedEmail === BOOTSTRAP_ADMIN_EMAIL && user.role !== 'admin') {
      user.role = 'admin';
      user.plan = 'VIP';
      saveDb(db);
    }

    if (user.blocked && user.role !== 'admin') {
      res.status(403).json({ error: 'Tu acceso se encuentra bloqueado.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token, user: sanitizeUser(user) });
  });

  // Session quick-switch for testing Student vs Admin environments without hardcoded passwords
  app.post('/api/auth/quick-access', (req: Request, res: Response) => {
    const { targetRole, targetPlan } = req.body || {};
    const db = loadDb();

    let user: UserRecord | undefined;
    if (targetRole === 'admin') {
      user = db.users.find((u) => u.role === 'admin') || db.users[0];
    } else {
      const desiredPlan: PlanTier =
        targetPlan === 'ESENCIAL' || targetPlan === 'COMPLETO' || targetPlan === 'VIP'
          ? targetPlan
          : 'VIP';
      user = db.users.find((u) => u.role === 'student' && u.plan === desiredPlan && !u.blocked);
      if (!user) {
        user = db.users.find((u) => u.role === 'student' && !u.blocked);
      }
    }

    if (!user) {
      res.status(404).json({ error: 'No se encontró perfil disponible.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token, user: sanitizeUser(user) });
  });

  // Get current authenticated user + platform bootstrap payload
  app.get('/api/bootstrap', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    const user = req.authUser!;
    const userProgress = db.progress[user.id] || {
      userId: user.id,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };

    const sortedModules = [...db.modules].sort((a, b) => a.order - b.order);
    const sortedVideos = [...db.videos].sort((a, b) => a.order - b.order);

    const bonusesWithAccess = db.bonuses.map((b) => ({
      id: b.id,
      code: b.code,
      title: b.title,
      description: b.description,
      coverTheme: b.coverTheme,
      coverUrl: b.coverUrl,
      pdfDriveLink: b.pdfDriveLink,
      pdfFileName: b.pdfFileName,
      allowedPlans: b.allowedPlans,
      contentSections: b.contentSections,
      createdAt: b.createdAt,
      hasAccess: canAccessBonus(user, b),
    }));

    const vipAllowed = canAccessVipClasses(user);

    res.json({
      user: sanitizeUser(user),
      modules: sortedModules,
      videos: sortedVideos,
      bonuses: bonusesWithAccess,
      progress: userProgress,
      liveClasses: vipAllowed ? db.liveClasses : [],
      vipAllowed,
      settings: db.settings,
      adminData:
        user.role === 'admin'
          ? {
              students: db.users.map((u) => ({
                ...sanitizeUser(u),
                progress: db.progress[u.id] || {
                  userId: u.id,
                  completedVideoIds: [],
                  favoriteVideoIds: [],
                  lastWatchedVideoId: null,
                  updatedAt: u.createdAt,
                },
              })),
            }
          : null,
    });
  });

  // ==========================================
  // STUDENT PROGRESS & PROFILE ENDPOINTS
  // ==========================================

  app.post('/api/progress/toggle-complete', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { videoId } = req.body || {};
    if (!videoId) {
      res.status(400).json({ error: 'ID de video requerido.' });
      return;
    }

    const db = loadDb();
    const userId = req.authUser!.id;
    const prog = db.progress[userId] || {
      userId,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };

    const exists = prog.completedVideoIds.includes(videoId);
    if (exists) {
      prog.completedVideoIds = prog.completedVideoIds.filter((id) => id !== videoId);
    } else {
      prog.completedVideoIds.push(videoId);
    }
    prog.lastWatchedVideoId = videoId;
    prog.updatedAt = new Date().toISOString();
    db.progress[userId] = prog;
    saveDb(db);

    res.json({ progress: prog });
  });

  app.post('/api/progress/toggle-favorite', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { videoId } = req.body || {};
    if (!videoId) {
      res.status(400).json({ error: 'ID de video requerido.' });
      return;
    }

    const db = loadDb();
    const userId = req.authUser!.id;
    const prog = db.progress[userId] || {
      userId,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };

    const exists = prog.favoriteVideoIds.includes(videoId);
    if (exists) {
      prog.favoriteVideoIds = prog.favoriteVideoIds.filter((id) => id !== videoId);
    } else {
      prog.favoriteVideoIds.push(videoId);
    }
    prog.updatedAt = new Date().toISOString();
    db.progress[userId] = prog;
    saveDb(db);

    res.json({ progress: prog });
  });

  app.post('/api/progress/watch', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { videoId } = req.body || {};
    if (!videoId) {
      res.status(400).json({ error: 'ID de video requerido.' });
      return;
    }

    const db = loadDb();
    const userId = req.authUser!.id;
    const prog = db.progress[userId] || {
      userId,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };

    prog.lastWatchedVideoId = videoId;
    prog.updatedAt = new Date().toISOString();
    db.progress[userId] = prog;
    saveDb(db);

    res.json({ progress: prog });
  });

  app.put('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const { name, newPassword } = req.body || {};
    const db = loadDb();
    const user = db.users.find((u) => u.id === req.authUser!.id);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    if (name && typeof name === 'string' && name.trim()) {
      user.name = name.trim().slice(0, 100);
    }
    if (newPassword && typeof newPassword === 'string') {
      if (newPassword.length < 6) {
        res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        return;
      }
      const { hash, salt } = hashPassword(newPassword);
      user.passwordHash = hash;
      user.passwordSalt = salt;
    }

    saveDb(db);
    res.json({ user: sanitizeUser(user) });
  });

  // ==========================================
  // REAL BONUS PDF DOWNLOAD ENDPOINT
  // ==========================================

  app.get('/api/bonuses/:id/download', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    const bonus = db.bonuses.find((b) => b.id === req.params.id);
    if (!bonus) {
      res.status(404).json({ error: 'Bono no encontrado.' });
      return;
    }

    const user = req.authUser!;
    if (!canAccessBonus(user, bonus)) {
      res.status(403).json({
        error: `Tu plan actual (${user.plan}) no incluye este bono. Actualiza a Plan COMPLETO o VIP.`,
      });
      return;
    }

    // If Admin uploaded a custom PDF file (stored as base64), serve it directly
    if (bonus.pdfBase64) {
      const buffer = Buffer.from(bonus.pdfBase64, 'base64');
      const fileName = bonus.pdfFileName || `${bonus.code.replace(/\s+/g, '_')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(buffer);
      return;
    }

    // Generate real multi-section PDF document for this bonus
    const pdfBuffer = generateBonusPdfBuffer(bonus);
    const fileName = bonus.pdfFileName || `${bonus.code.replace(/\s+/g, '_')}_Thai_Elite.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  });

  // ==========================================
  // ADMIN ENDPOINTS (VIDEOS, DRIVE SYNC, MODULES, BONUSES, STUDENTS, LIVE CLASSES)
  // ==========================================

  // Add video
  app.post('/api/admin/videos', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { title, description, moduleId, driveLink, thumbnailUrl, duration, order, embedAllowed } = req.body || {};
    if (!title || !moduleId || !driveLink) {
      res.status(400).json({ error: 'El título, módulo y enlace de Google Drive son obligatorios.' });
      return;
    }

    const driveFileId = extractDriveFileId(String(driveLink));
    if (!driveFileId) {
      res.status(400).json({
        error: 'El enlace de Google Drive no contiene un ID de archivo válido. Ejemplo: https://drive.google.com/file/d/ID_DEL_ARCHIVO/view',
      });
      return;
    }

    const db = loadDb();
    const moduleVideos = db.videos.filter((v) => v.moduleId === moduleId);
    const nextOrder =
      typeof order === 'number' && !Number.isNaN(order) ? order : moduleVideos.length + 1;

    const newVideo: VideoRecord = {
      id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      moduleId: String(moduleId),
      title: String(title).trim().slice(0, 160),
      description: String(description || '').trim().slice(0, 800),
      duration: String(duration || '15:00').trim().slice(0, 20),
      driveLink: String(driveLink).trim(),
      driveFileId,
      thumbnailUrl: thumbnailUrl ? String(thumbnailUrl).trim() : undefined,
      order: nextOrder,
      embedAllowed: embedAllowed !== false,
      createdAt: new Date().toISOString(),
    };

    db.videos.push(newVideo);
    saveDb(db);
    res.json({ video: newVideo, previewUrl: buildDrivePreviewUrl(driveFileId) });
  });

  // Update video
  app.put('/api/admin/videos/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    const idx = db.videos.findIndex((v) => v.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Video no encontrado.' });
      return;
    }

    const { title, description, moduleId, driveLink, thumbnailUrl, duration, order, embedAllowed } = req.body || {};
    const current = db.videos[idx];

    let driveFileId = current.driveFileId;
    if (driveLink && driveLink !== current.driveLink) {
      const parsed = extractDriveFileId(String(driveLink));
      if (!parsed) {
        res.status(400).json({ error: 'ID de archivo de Google Drive inválido.' });
        return;
      }
      driveFileId = parsed;
    }

    db.videos[idx] = {
      ...current,
      title: title !== undefined ? String(title).trim().slice(0, 160) : current.title,
      description: description !== undefined ? String(description).trim().slice(0, 800) : current.description,
      moduleId: moduleId !== undefined ? String(moduleId) : current.moduleId,
      driveLink: driveLink !== undefined ? String(driveLink).trim() : current.driveLink,
      driveFileId,
      thumbnailUrl: thumbnailUrl !== undefined ? String(thumbnailUrl).trim() : current.thumbnailUrl,
      duration: duration !== undefined ? String(duration).trim().slice(0, 20) : current.duration,
      order: typeof order === 'number' ? order : current.order,
      embedAllowed: typeof embedAllowed === 'boolean' ? embedAllowed : current.embedAllowed,
    };

    saveDb(db);
    res.json({ video: db.videos[idx] });
  });

  // Reorder video up/down
  app.post('/api/admin/videos/:id/reorder', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { direction } = req.body || {};
    const db = loadDb();
    const target = db.videos.find((v) => v.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Video no encontrado.' });
      return;
    }

    const siblings = db.videos
      .filter((v) => v.moduleId === target.moduleId)
      .sort((a, b) => a.order - b.order);

    const currentIdx = siblings.findIndex((v) => v.id === target.id);
    const swapIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;

    if (swapIdx >= 0 && swapIdx < siblings.length) {
      const tempOrder = siblings[currentIdx].order;
      siblings[currentIdx].order = siblings[swapIdx].order;
      siblings[swapIdx].order = tempOrder;
      if (siblings[currentIdx].order === siblings[swapIdx].order) {
        siblings.forEach((s, i) => {
          s.order = i + 1;
        });
      }
      saveDb(db);
    }

    res.json({ videos: db.videos.sort((a, b) => a.order - b.order) });
  });

  // Delete video
  app.delete('/api/admin/videos/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    db.videos = db.videos.filter((v) => v.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Helper to parse public Google Drive embeddedfolderview HTML
  async function fetchPublicDriveFolderFiles(targetFolderId: string): Promise<Array<{ id: string; name: string; mimeType: string }>> {
    const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${targetFolderId}#list`);
    if (!res.ok) return [];
    const html = await res.text();
    const entryRegex = /id="entry-([A-Za-z0-9_-]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?<div class="flip-entry-title">([^<]+)<\/div>/g;
    const files: Array<{ id: string; name: string; mimeType: string }> = [];
    const subfolderIds: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = entryRegex.exec(html)) !== null) {
      const id = match[1];
      const href = match[2];
      const name = match[3].trim();
      if (href.includes('/drive/folders/')) {
        subfolderIds.push(id);
      } else {
        files.push({
          id,
          name,
          mimeType: 'video/mp4',
        });
      }
    }
    for (const subId of subfolderIds) {
      const subRes = await fetch(`https://drive.google.com/embeddedfolderview?id=${subId}#list`);
      if (!subRes.ok) continue;
      const subHtml = await subRes.text();
      let subMatch: RegExpExecArray | null;
      const subRegex = /id="entry-([A-Za-z0-9_-]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?<div class="flip-entry-title">([^<]+)<\/div>/g;
      while ((subMatch = subRegex.exec(subHtml)) !== null) {
        if (!subMatch[2].includes('/drive/folders/')) {
          files.push({
            id: subMatch[1],
            name: subMatch[3].trim(),
            mimeType: 'video/mp4',
          });
        }
      }
    }
    return files;
  }

  // Google Drive Official API Folder Sync Preview (Server-side proxy with Bearer OAuth token + Public Folder Fallback)
  app.post('/api/admin/drive/preview-folder', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const { folderInput, driveAccessToken } = req.body || {};
    const folderId = extractDriveFolderId(String(folderInput || ''));
    if (!folderId) {
      res.status(400).json({
        error: 'Ingresa un ID o enlace válido de carpeta de Google Drive.',
      });
      return;
    }

    try {
      let rawFiles: any[] = [];

      if (driveAccessToken) {
        const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
        const fields = encodeURIComponent('files(id,name,mimeType,size,videoMediaMetadata,capabilities,thumbnailLink)');
        const driveRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=name&pageSize=100`,
          {
            headers: {
              Authorization: `Bearer ${driveAccessToken}`,
            },
          }
        );

        if (driveRes.ok) {
          const data = await driveRes.json();
          rawFiles = Array.isArray(data.files) ? data.files : [];
        }
      }

      if (rawFiles.length === 0) {
        rawFiles = await fetchPublicDriveFolderFiles(folderId);
      }

      const db = loadDb();
      const existingDriveIds = db.videos.map((v) => v.driveFileId);
      const { newFiles, skippedDuplicates } = filterNonDuplicateDriveFiles(rawFiles, existingDriveIds);

      res.json({
        folderId,
        totalFound: rawFiles.length,
        newFiles,
        skippedDuplicates,
      });
    } catch (err: any) {
      res.status(500).json({
        error: err?.message || 'Error al conectar con Google Drive.',
      });
    }
  });

  // Bulk import synced Google Drive videos into a module
  app.post('/api/admin/drive/import-files', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { moduleId, files } = req.body || {};
    if (!moduleId || !Array.isArray(files) || files.length === 0) {
      res.status(400).json({ error: 'Selecciona un módulo y al menos un video para importar.' });
      return;
    }

    const db = loadDb();
    const existingIds = new Set(db.videos.map((v) => v.driveFileId));
    let currentOrder = db.videos.filter((v) => v.moduleId === moduleId).length;
    const imported: VideoRecord[] = [];

    for (const f of files) {
      const fileId = extractDriveFileId(String(f.id || ''));
      if (!fileId || existingIds.has(fileId)) continue;
      currentOrder += 1;
      const cleanName = String(f.name || `Clase ${currentOrder}`)
        .replace(/\.(mp4|mov|mkv|webm|m4v|avi)$/i, '')
        .replace(/[_-]+/g, ' ')
        .trim();

      const newVid: VideoRecord = {
        id: `vid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        moduleId: String(moduleId),
        title: cleanName.slice(0, 160),
        description: `Entrenamiento sincronizado desde Google Drive (${f.name}).`,
        duration: f.duration || '15:00',
        driveLink: `https://drive.google.com/file/d/${fileId}/view`,
        driveFileId: fileId,
        order: currentOrder,
        embedAllowed: f.embedAllowed !== false,
        createdAt: new Date().toISOString(),
      };
      db.videos.push(newVid);
      existingIds.add(fileId);
      imported.push(newVid);
    }

    saveDb(db);
    res.json({ importedCount: imported.length, imported });
  });

  // Manage Modules (Create / Update)
  app.post('/api/admin/modules', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { code, title, description, coverTheme, coverUrl } = req.body || {};
    if (!title) {
      res.status(400).json({ error: 'El nombre del módulo es obligatorio.' });
      return;
    }
    const db = loadDb();
    const nextNum = db.modules.length + 1;
    const newMod: ModuleRecord = {
      id: `mod-${Date.now()}`,
      code: String(code || String(nextNum).padStart(2, '0')).slice(0, 10),
      title: String(title).trim().slice(0, 120),
      description: String(description || '').trim().slice(0, 500),
      coverTheme: String(coverTheme || 'stance'),
      coverUrl: coverUrl ? String(coverUrl).trim() : undefined,
      order: nextNum,
    };
    db.modules.push(newMod);
    saveDb(db);
    res.json({ module: newMod });
  });

  app.put('/api/admin/modules/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    const idx = db.modules.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Módulo no encontrado.' });
      return;
    }
    const { code, title, description, coverUrl, order } = req.body || {};
    const cur = db.modules[idx];
    db.modules[idx] = {
      ...cur,
      code: code !== undefined ? String(code).trim().slice(0, 10) : cur.code,
      title: title !== undefined ? String(title).trim().slice(0, 120) : cur.title,
      description: description !== undefined ? String(description).trim().slice(0, 500) : cur.description,
      coverUrl: coverUrl !== undefined ? String(coverUrl).trim() : cur.coverUrl,
      order: typeof order === 'number' ? order : cur.order,
    };
    saveDb(db);
    res.json({ module: db.modules[idx] });
  });

  // Manage Bonuses (Create / Update / Delete)
  app.post('/api/admin/bonuses', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { code, title, description, coverUrl, pdfDriveLink, pdfFileName, pdfBase64, allowedPlans, contentSections } =
      req.body || {};
    if (!title) {
      res.status(400).json({ error: 'El título del bono es obligatorio.' });
      return;
    }

    const db = loadDb();
    const nextIdx = db.bonuses.length + 1;
    const newBonus: BonusRecord = {
      id: `bono-${Date.now()}`,
      code: String(code || `BONO 0${nextIdx}`).trim().slice(0, 20),
      title: String(title).trim().slice(0, 140),
      description: String(description || '').trim().slice(0, 600),
      coverTheme: 'combos',
      coverUrl: coverUrl ? String(coverUrl).trim() : undefined,
      pdfDriveLink: pdfDriveLink ? String(pdfDriveLink).trim() : undefined,
      pdfFileName: pdfFileName ? String(pdfFileName).trim() : `Bono_0${nextIdx}_Thai_Elite.pdf`,
      pdfBase64: pdfBase64 ? String(pdfBase64) : undefined,
      allowedPlans:
        Array.isArray(allowedPlans) && allowedPlans.length > 0
          ? allowedPlans
          : ['COMPLETO', 'VIP'],
      contentSections:
        Array.isArray(contentSections) && contentSections.length > 0
          ? contentSections.map((s: any) => String(s))
          : ['Guía oficial de entrenamiento Thai Elite México.'],
      createdAt: new Date().toISOString(),
    };

    db.bonuses.push(newBonus);
    saveDb(db);
    res.json({ bonus: newBonus });
  });

  app.put('/api/admin/bonuses/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    const idx = db.bonuses.findIndex((b) => b.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Bono no encontrado.' });
      return;
    }
    const { code, title, description, coverUrl, pdfDriveLink, pdfFileName, pdfBase64, allowedPlans } =
      req.body || {};
    const cur = db.bonuses[idx];
    db.bonuses[idx] = {
      ...cur,
      code: code !== undefined ? String(code).trim().slice(0, 20) : cur.code,
      title: title !== undefined ? String(title).trim().slice(0, 140) : cur.title,
      description: description !== undefined ? String(description).trim().slice(0, 600) : cur.description,
      coverUrl: coverUrl !== undefined ? String(coverUrl).trim() : cur.coverUrl,
      pdfDriveLink: pdfDriveLink !== undefined ? String(pdfDriveLink).trim() : cur.pdfDriveLink,
      pdfFileName: pdfFileName !== undefined ? String(pdfFileName).trim() : cur.pdfFileName,
      pdfBase64: pdfBase64 !== undefined ? String(pdfBase64) : cur.pdfBase64,
      allowedPlans: Array.isArray(allowedPlans) ? allowedPlans : cur.allowedPlans,
    };
    saveDb(db);
    res.json({ bonus: db.bonuses[idx] });
  });

  app.delete('/api/admin/bonuses/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    db.bonuses = db.bonuses.filter((b) => b.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Manage Students (Create / Update Plan / Block / Unlock Bonus)
  app.post('/api/admin/students', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { name, email, password, plan, role } = req.body || {};
    if (!name || !email) {
      res.status(400).json({ error: 'El nombre y el correo electrónico del alumno son obligatorios.' });
      return;
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const db = loadDb();
    if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      res.status(400).json({ error: 'Ya existe un usuario registrado con ese correo electrónico.' });
      return;
    }

    const passObj = password && String(password).length >= 6 ? hashPassword(String(password)) : undefined;
    const validPlan: PlanTier =
      plan === 'ESENCIAL' || plan === 'COMPLETO' || plan === 'VIP' ? plan : 'ESENCIAL';

    const newStudent: UserRecord = {
      id: `usr-${Date.now()}`,
      name: String(name).trim().slice(0, 100),
      email: normalizedEmail.slice(0, 120),
      passwordHash: passObj?.hash,
      passwordSalt: passObj?.salt,
      role: role === 'admin' ? 'admin' : 'student',
      plan: validPlan,
      blocked: false,
      unlockedBonusIds: [],
      createdAt: new Date().toISOString(),
    };

    db.users.push(newStudent);
    db.progress[newStudent.id] = {
      userId: newStudent.id,
      completedVideoIds: [],
      favoriteVideoIds: [],
      lastWatchedVideoId: null,
      updatedAt: new Date().toISOString(),
    };
    saveDb(db);

    res.json({ student: sanitizeUser(newStudent) });
  });

  app.put('/api/admin/students/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    const idx = db.users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Alumno no encontrado.' });
      return;
    }

    const { name, plan, blocked, unlockedBonusIds, role, password } = req.body || {};
    const cur = db.users[idx];

    if (password && typeof password === 'string' && password.length >= 6) {
      const { hash, salt } = hashPassword(password);
      cur.passwordHash = hash;
      cur.passwordSalt = salt;
    }

    db.users[idx] = {
      ...cur,
      name: name !== undefined ? String(name).trim().slice(0, 100) : cur.name,
      plan:
        plan === 'ESENCIAL' || plan === 'COMPLETO' || plan === 'VIP' ? plan : cur.plan,
      blocked: typeof blocked === 'boolean' ? blocked : cur.blocked,
      unlockedBonusIds: Array.isArray(unlockedBonusIds) ? unlockedBonusIds : cur.unlockedBonusIds,
      role: role === 'admin' || role === 'student' ? role : cur.role,
    };

    saveDb(db);
    res.json({ student: sanitizeUser(db.users[idx]) });
  });

  // Manage VIP Live Classes
  app.post('/api/admin/live-classes', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { title, date, time, instructor, streamUrl } = req.body || {};
    if (!title || !date || !time || !instructor || !streamUrl) {
      res.status(400).json({
        error: 'Completa todos los campos de la clase en vivo: título, fecha, horario, instructor y enlace.',
      });
      return;
    }

    const db = loadDb();
    const newLive: LiveClassRecord = {
      id: `live-${Date.now()}`,
      title: String(title).trim().slice(0, 140),
      date: String(date).trim(),
      time: String(time).trim(),
      instructor: String(instructor).trim().slice(0, 100),
      streamUrl: String(streamUrl).trim(),
      createdAt: new Date().toISOString(),
    };

    db.liveClasses.push(newLive);
    saveDb(db);
    res.json({ liveClass: newLive });
  });

  app.delete('/api/admin/live-classes/:id', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const db = loadDb();
    db.liveClasses = db.liveClasses.filter((c) => c.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Update Settings (WhatsApp VIP link, support email)
  app.put('/api/admin/settings', requireAuth, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
    const { whatsappVipUrl, supportEmail, platformAnnouncement } = req.body || {};
    const db = loadDb();
    db.settings = {
      whatsappVipUrl:
        whatsappVipUrl !== undefined ? String(whatsappVipUrl).trim() : db.settings.whatsappVipUrl,
      supportEmail:
        supportEmail !== undefined ? String(supportEmail).trim() : db.settings.supportEmail,
      platformAnnouncement:
        platformAnnouncement !== undefined
          ? String(platformAnnouncement).trim()
          : db.settings.platformAnnouncement,
    };
    saveDb(db);
    res.json({ settings: db.settings });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`THAI ELITE MÉXICO server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
