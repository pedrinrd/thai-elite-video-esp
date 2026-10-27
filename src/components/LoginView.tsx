import React, { useState } from 'react';
import { Shield, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MuayThaiArtwork } from './MuayThaiArtwork';
import { googleSignIn } from '../services/googleAuth';
import { UserProfile } from '../types';

interface LoginViewProps {
  onAuthenticated: (token: string, user: UserProfile, driveAccessToken?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleRequest, setRoleRequest] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Por favor ingresa tu nombre completo para activar tu cuenta.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          roleRequest,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo iniciar sesión.');
      }
      onAuthenticated(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (!result) {
        setLoading(false);
        return;
      }
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: result.user.email,
          displayName: result.user.displayName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al validar cuenta de Google.');
      }
      onAuthenticated(data.token, data.user, result.accessToken);
    } catch (err: any) {
      setError(
        err?.message || 'No se pudo completar el inicio de sesión con Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSession = async (targetRole: 'student' | 'admin', targetPlan?: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/quick-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, targetPlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión rápida.');
      }
      onAuthenticated(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar acceso rápido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col lg:flex-row items-stretch">
      {/* Left Visual Showcase Column */}
      <div className="relative lg:w-7/12 min-h-[300px] lg:min-h-screen flex flex-col justify-between p-8 lg:p-14 overflow-hidden border-b lg:border-b-0 lg:border-r border-neutral-800">
        <MuayThaiArtwork
          variant="hero"
          code="500"
          title="THAI ELITE MÉXICO"
          className="absolute inset-0 w-full h-full"
        />

        <div className="relative z-10 flex items-center justify-between">
          <span
            className="text-2xl lg:text-3xl font-extrabold tracking-wider text-white uppercase"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            THAI ELITE <span className="text-[#E50914]">MÉXICO</span>
          </span>
          <span className="text-xs text-neutral-300 tracking-wide">
            Área Oficial de Miembros
          </span>
        </div>

        <div className="relative z-10 max-w-xl my-auto py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E50914] mb-3">
            Plataforma Oficial de Entrenamiento
          </p>
          <h1
            className="text-4xl lg:text-6xl font-extrabold text-white uppercase leading-none tracking-tight text-balance"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            500 ENTRENAMIENTOS DE MUAY THAI Y MATERIAL EXCLUSIVO
          </h1>
          <p className="mt-4 text-base text-neutral-300 leading-relaxed max-w-lg">
            Accede a los 10 módulos estructurados, reproductor interno conectado a Google Drive, seguimiento de progreso en tiempo real y descarga directa de tus bonos en PDF.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800/80 max-w-md">
            <div>
              <div className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                10 Módulos
              </div>
              <div className="text-xs text-neutral-400">De Cero a Avanzado</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                500 Videos
              </div>
              <div className="text-xs text-neutral-400">Reproducción Interna</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tabular-nums" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                5 Bonos PDF
              </div>
              <div className="text-xs text-neutral-400">Descarga Directa</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-neutral-400 flex items-center gap-2">
          <span>Acceso exclusivo para alumnos inscritos y administradores</span>
          <span aria-hidden="true">·</span>
          <span>Soporte México</span>
        </div>
      </div>

      {/* Right Authentication Form Column */}
      <div className="lg:w-5/12 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#090909]">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2
              className="text-3xl font-bold text-white uppercase tracking-tight"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {mode === 'login' ? 'Ingresa a tu Cuenta' : 'Activar / Crear Cuenta'}
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {mode === 'login'
                ? 'Introduce tus credenciales de alumno o administrador para continuar.'
                : 'Configura tu contraseña para acceder a tus entrenamientos y bonos.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#171717] rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                mode === 'login'
                  ? 'bg-[#E50914] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                mode === 'register'
                  ? 'bg-[#E50914] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Activar / Crear Cuenta
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[#E50914]/15 border border-[#E50914]/40 text-xs text-red-200 leading-relaxed"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-medium text-neutral-300 mb-1.5"
                >
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full pl-10 pr-4 py-3 bg-[#171717] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-neutral-300 mb-1.5"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#171717] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-neutral-300 mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-4 py-3 bg-[#171717] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Tipo de Perfil
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleRequest('student')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                      roleRequest === 'student'
                        ? 'bg-neutral-800 border-white text-white'
                        : 'bg-[#171717] border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Alumno</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleRequest('admin')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                      roleRequest === 'admin'
                        ? 'bg-neutral-800 border-[#E50914] text-white'
                        : 'bg-[#171717] border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-[#E50914]" />
                    <span>Administrador</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3 px-6 bg-[#E50914] hover:bg-[#c40811] disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>
                {loading
                  ? 'Procesando...'
                  : mode === 'login'
                  ? 'ENTRAR A LA PLATAFORMA'
                  : 'ACTIVAR Y ENTRAR'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-neutral-800" />
            <span className="flex-shrink mx-3 text-xs text-neutral-500">
              o continúa con Google Drive
            </span>
            <div className="flex-grow border-t border-neutral-800" />
          </div>

          {/* Official Sign in with Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full min-h-[46px] px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm rounded-xl flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5 shrink-0"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Direct Demo / Evaluation Access Profiles */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-2.5">
            <p className="text-xs text-neutral-400">
              Acceso directo para prueba inmediata de entornos:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickSession('student', 'VIP')}
                disabled={loading}
                className="py-2.5 px-3 min-h-[44px] bg-[#171717] hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Entrar como Alumno</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSession('admin')}
                disabled={loading}
                className="py-2.5 px-3 min-h-[44px] bg-[#171717] hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Entrar como Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
