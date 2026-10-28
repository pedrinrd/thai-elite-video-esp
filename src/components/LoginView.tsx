import React, { useState } from 'react';
import { Dumbbell, Mail, ArrowRight, Shield, Play, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { googleSignIn } from '../services/googleAuth';

interface LoginViewProps {
  onAuthenticated: (
    token: string,
    user: UserProfile,
    googleDriveAccessToken?: string
  ) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEasyStudentLogin = async (e?: React.FormEvent, roleOverride: 'student' | 'admin' = 'student') => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          role: roleOverride,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo iniciar el acceso.');
      }
      onAuthenticated(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Error de conexión al entrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleAccess = async (targetRole: 'student' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/quick-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, targetPlan: 'VIP' }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo iniciar acceso rápido.');
      }
      onAuthenticated(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Error al acceder.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const authRes = await googleSignIn();
      if (!authRes) {
        throw new Error('No se pudo iniciar sesión con Google.');
      }
      const { user: fbUser, accessToken } = authRes;
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fbUser.email,
          displayName: fbUser.displayName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo autenticar con Google.');
      }
      onAuthenticated(data.token, data.user, accessToken || undefined);
    } catch (err: any) {
      setError(
        err.message || 'No se pudo completar el inicio de sesión con Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col justify-center py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-800 bg-[#141414] shadow-[0_28px_80px_-20px_rgba(0,0,0,0.9)]">
        {/* Left Visual Showcase (Compact on Mobile, Full Height on Desktop) */}
        <div className="lg:col-span-6 relative min-h-[165px] sm:min-h-[250px] lg:min-h-[540px] flex flex-col justify-between p-5 sm:p-8 lg:p-10 overflow-hidden bg-[#090909] border-b lg:border-b-0 lg:border-r border-neutral-800/80">
          {/* Atmospheric Dark Arena Fighter Background */}
          <img
            src="/assets/modules/hero.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-35 contrast-125 brightness-90"
            style={{ objectPosition: '58% 24%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/70 to-[#090909]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090909]/90 via-[#090909]/45 to-transparent" />

          {/* Top Brand + Circular Fighter Medallion */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E50914] flex items-center justify-center shadow-[0_0_24px_rgba(229,9,20,0.6)] shrink-0">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <span
                  className="block text-xl sm:text-2xl font-extrabold tracking-wider uppercase text-white leading-none"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  THAI ELITE <span className="text-[#E50914]">MÉXICO</span>
                </span>
                <span className="block text-[10px] sm:text-[11px] text-neutral-300 tracking-widest uppercase mt-0.5">
                  Área Oficial de Miembros
                </span>
              </div>
            </div>

            <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#E50914] shadow-[0_0_24px_rgba(229,9,20,0.55)] bg-[#121212] shrink-0">
              <img
                src="/assets/modules/hero.jpg"
                alt="Muay Thai"
                className="w-full h-full object-cover scale-125"
                style={{ objectPosition: '58% 24%' }}
              />
            </div>
          </div>

          <div className="relative z-10 space-y-2 sm:space-y-4 mt-4 sm:mt-8 lg:mt-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E50914]/20 border border-[#E50914]/50 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#E50914] text-[#E50914]" />
              <span>500+ Entrenamientos HD · 5 Bonos PDF en Español</span>
            </div>
            <h1
              className="text-2xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-[0.95]"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              ACCESO DIRECTO PARA ALUMNOS
            </h1>
            <p className="hidden sm:block text-sm text-neutral-200 leading-relaxed max-w-md">
              Entra de inmediato a los 10 módulos de Muay Thai y descarga tus 5 bonos exclusivos en PDF en español sin necesidad de crear cuenta ni recordar contraseñas.
            </p>
            <div className="hidden lg:block pt-2 space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>Ingreso inmediato con 1 clic o con tu correo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>Sin formularios de registro ni contraseñas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Facilitated Student Login */}
        <div className="lg:col-span-6 p-5 sm:p-10 lg:p-12 flex flex-col justify-center bg-[#141414]">
          <div className="space-y-4 sm:space-y-6">
            {/* Header with Realistic Nak Muay Avatar */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.5)] shrink-0 bg-[#090909]">
                <img
                  src="/assets/modules/mod01.jpg"
                  alt="Alumno Thai Elite"
                  className="w-full h-full object-cover scale-150"
                  style={{ objectPosition: '84% 24%' }}
                />
              </div>
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#E50914]">
                  Acceso Facilitado · Sin Registro
                </span>
                <h2
                  className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-none mt-0.5"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  ENTRAR AL ÁREA DEL ALUMNO
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Toca el botón rojo para entrar directamente a entrenar, o escribe tu correo para guardar tu avance personal.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-[#E50914]/15 border border-[#E50914] text-xs text-red-200">
                {error}
              </div>
            )}

            {/* 1-Click Primary Student Access + Optional Email */}
            <form onSubmit={(e) => handleEasyStudentLogin(e, 'student')} className="space-y-3.5 sm:space-y-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickRoleAccess('student')}
                className="w-full py-3.5 sm:py-4 px-5 min-h-[52px] rounded-xl bg-[#E50914] hover:bg-[#c40811] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_12px_30px_-6px_rgba(229,9,20,0.65)]"
              >
                <Play className="w-4 h-4 fill-white shrink-0" />
                <span>{loading ? 'ENTRANDO...' : '¡ENTRAR COMO ALUMNO AHORA!'}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <div className="relative flex items-center py-0.5">
                <div className="flex-grow border-t border-neutral-800" />
                <span className="flex-shrink mx-2.5 text-[10px] sm:text-[11px] uppercase tracking-wider text-neutral-400">
                  o ingresa solo tu correo (sin contraseña)
                </span>
                <div className="flex-grow border-t border-neutral-800" />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="student-easy-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    aria-label="Correo electrónico del alumno"
                    className="w-full pl-10 pr-4 py-3 min-h-[46px] bg-[#090909] border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 min-h-[46px] rounded-xl bg-[#1f1f1f] hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Entrar con Correo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Google Sign-In Option */}
            <div>
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 sm:py-3 px-4 min-h-[44px] rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>
            </div>

            {/* Footer: Discreet Admin Panel Access */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs text-neutral-400">
                ¿Eres instructor o administrador?
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleQuickRoleAccess('admin')}
                className="px-3 py-2 min-h-[38px] rounded-xl bg-[#090909] hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
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
