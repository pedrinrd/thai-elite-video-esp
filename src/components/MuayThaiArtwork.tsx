import React, { useState } from 'react';

interface ArtworkProps {
  theme?: string;
  code?: string;
  title?: string;
  imageUrl?: string;
  variant?: 'hero' | 'module' | 'video' | 'bonus';
  className?: string;
}

interface RealisticAvatarConfig {
  avatarSrc: string;
  bgSrc: string;
  objectPosition: string;
  scale: string;
  tag: string;
  accentShape: 'circle' | 'octagon' | 'shield' | 'diamond';
}

const REALISTIC_FIGHTER_AVATARS: Record<string, RealisticAvatarConfig> = {
  stance: {
    avatarSrc: '/assets/modules/mod01.jpg',
    bgSrc: '/assets/modules/mod01.jpg',
    objectPosition: '84% 28%',
    scale: 'scale-150',
    tag: 'NAK MUAY',
    accentShape: 'octagon',
  },
  punches: {
    avatarSrc: '/assets/modules/mod02.jpg',
    bgSrc: '/assets/modules/mod02.jpg',
    objectPosition: '52% 20%',
    scale: 'scale-125',
    tag: 'BOXEO THAI',
    accentShape: 'circle',
  },
  kicks: {
    avatarSrc: '/assets/modules/mod03.jpg',
    bgSrc: '/assets/modules/mod03.jpg',
    objectPosition: '56% 24%',
    scale: 'scale-125',
    tag: 'LOW KICK',
    accentShape: 'circle',
  },
  elbows: {
    avatarSrc: '/assets/modules/mod04.jpg',
    bgSrc: '/assets/modules/mod04.jpg',
    objectPosition: '48% 22%',
    scale: 'scale-125',
    tag: 'SOK & KHAO',
    accentShape: 'diamond',
  },
  defense: {
    avatarSrc: '/assets/modules/mod05.jpg',
    bgSrc: '/assets/modules/mod05.jpg',
    objectPosition: '50% 24%',
    scale: 'scale-125',
    tag: 'BLOQUEO',
    accentShape: 'shield',
  },
  combos: {
    avatarSrc: '/assets/modules/mod06.jpg',
    bgSrc: '/assets/modules/mod06.jpg',
    objectPosition: '54% 22%',
    scale: 'scale-125',
    tag: '8 ARMAS',
    accentShape: 'circle',
  },
  footwork: {
    avatarSrc: '/assets/modules/mod07.jpg',
    bgSrc: '/assets/modules/mod07.jpg',
    objectPosition: '50% 26%',
    scale: 'scale-125',
    tag: 'MOVILIDAD',
    accentShape: 'diamond',
  },
  beginners: {
    avatarSrc: '/assets/modules/mod08.jpg',
    bgSrc: '/assets/modules/mod08.jpg',
    objectPosition: '46% 20%',
    scale: 'scale-125',
    tag: 'BASE PRO',
    accentShape: 'octagon',
  },
  conditioning: {
    avatarSrc: '/assets/modules/mod09.jpg',
    bgSrc: '/assets/modules/mod09.jpg',
    objectPosition: '52% 20%',
    scale: 'scale-125',
    tag: 'POTENCIA',
    accentShape: 'circle',
  },
  routines: {
    avatarSrc: '/assets/modules/mod10.jpg',
    bgSrc: '/assets/modules/mod10.jpg',
    objectPosition: '48% 22%',
    scale: 'scale-125',
    tag: '5 ROUNDS',
    accentShape: 'octagon',
  },
};

export const MuayThaiArtwork: React.FC<ArtworkProps> = ({
  theme = 'stance',
  code = '01',
  title = 'THAI ELITE',
  imageUrl,
  variant = 'module',
  className = '',
}) => {
  const [customImgError, setCustomImgError] = useState(false);

  const positionClass = className.includes('absolute') ? '' : 'relative';
  const cleanCode = code.replace(/[^0-9]/g, '').padStart(2, '0') || '01';
  const uid = `${variant}-${theme}-${cleanCode}`;

  const config =
    REALISTIC_FIGHTER_AVATARS[theme] || REALISTIC_FIGHTER_AVATARS.stance;

  const activePhotoSrc =
    imageUrl && imageUrl.trim() !== '' && !customImgError
      ? imageUrl
      : variant === 'hero'
      ? '/assets/modules/hero.jpg'
      : config.avatarSrc;

  return (
    <div
      className={`${positionClass} overflow-hidden bg-[#090909] select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Dark-Arena Photographic Backdrop */}
      <img
        src={variant === 'hero' ? '/assets/modules/hero.jpg' : config.bgSrc}
        alt=""
        loading="lazy"
        onError={() => setCustomImgError(true)}
        style={{ objectPosition: config.objectPosition }}
        className={`absolute inset-0 w-full h-full object-cover ${
          variant === 'hero'
            ? 'opacity-45 contrast-125 brightness-90 scale-105'
            : 'opacity-25 contrast-125 brightness-75 saturate-75'
        }`}
      />

      {/* 2. Dark Stadium & Crimson Spotlight Vector Layer (Preserves exact card design from screenshot) */}
      <svg
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      >
        <defs>
          <radialGradient id={`crimsonGlow-${uid}`} cx="72%" cy="46%" r="62%">
            <stop offset="0%" stopColor="#E50914" stopOpacity="0.58" />
            <stop offset="48%" stopColor="#6e0309" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#090909" stopOpacity="0.94" />
          </radialGradient>
          <linearGradient id={`darkScrim-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141414" stopOpacity="0.88" />
            <stop offset="55%" stopColor="#0d0d0d" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#090909" stopOpacity="0.94" />
          </linearGradient>
        </defs>

        {/* Stadium Dark Canvas & Crimson Spotlight */}
        <rect width="800" height="450" fill={`url(#darkScrim-${uid})`} />
        <rect width="800" height="450" fill={`url(#crimsonGlow-${uid})`} />

        {/* Subtle Stadium Ring Ropes Perspective */}
        <line x1="0" y1="105" x2="800" y2="68" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2" />
        <line x1="0" y1="192" x2="800" y2="155" stroke="#E50914" strokeOpacity="0.24" strokeWidth="2.5" />
        <line x1="0" y1="278" x2="800" y2="242" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2" />
        <line x1="0" y1="364" x2="800" y2="328" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="2" />

        {/* Kinetic Diagonal Arena Slashes */}
        <polygon points="435,0 525,0 365,450 275,450" fill="#E50914" fillOpacity="0.18" />
        <polygon points="548,0 576,0 416,450 388,450" fill="#ffffff" fillOpacity="0.05" />

        {/* Top-left Muay Thai series signature */}
        <g transform="translate(34, 38)">
          <text
            x="0"
            y="16"
            fill="#E50914"
            fontFamily="Barlow Condensed, sans-serif"
            fontWeight="800"
            fontSize="17"
            letterSpacing="3"
          >
            THAI ELITE · MÉXICO
          </text>
          <line x1="0" y1="25" x2="96" y2="25" stroke="#E50914" strokeWidth="2.5" />
        </g>

        {/* Video Episode Typography on Left Side */}
        {variant === 'video' && (
          <g transform="translate(38, 175)">
            <text
              x="0"
              y="0"
              fill="#E50914"
              fontFamily="Barlow Condensed, sans-serif"
              fontWeight="800"
              fontSize="22"
              letterSpacing="3"
            >
              CLASE OFICIAL
            </text>
            <text
              x="0"
              y="72"
              fill="#FFFFFF"
              fillOpacity="0.95"
              fontFamily="Barlow Condensed, sans-serif"
              fontWeight="800"
              fontSize="84"
              letterSpacing="2"
            >
              #{cleanCode}
            </text>
          </g>
        )}

        {/* Bonus Official Manual Frame on Right Side */}
        {variant === 'bonus' && (
          <g transform="translate(455, 42)">
            <rect x="52" y="8" width="198" height="272" rx="14" fill="#1f1f1f" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
            <rect x="34" y="22" width="198" height="272" rx="14" fill="#121212" stroke="#E50914" strokeWidth="3" />
            <rect x="34" y="22" width="22" height="272" rx="6" fill="#E50914" />
            <rect x="74" y="56" width="104" height="12" rx="4" fill="#E50914" />
            <rect x="74" y="82" width="132" height="8" rx="4" fill="#ffffff" fillOpacity="0.85" />
            <rect x="74" y="100" width="110" height="8" rx="4" fill="#ffffff" fillOpacity="0.45" />
            <circle cx="142" cy="196" r="52" fill="#1a0507" stroke="#E50914" strokeWidth="2.5" />
            <text
              x="142"
              y="207"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="Barlow Condensed, sans-serif"
              fontWeight="800"
              fontSize="30"
              letterSpacing="1.5"
            >
              PDF
            </text>
          </g>
        )}
      </svg>

      {/* 3. Photorealistic Muay Thai Fighter Avatar Medallion (Right Side) */}
      {variant !== 'bonus' && (
        <div
          className={`absolute ${
            variant === 'hero'
              ? 'right-6 sm:right-12 top-1/2 -translate-y-1/2 w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80'
              : 'right-3 sm:right-3.5 top-1/2 -translate-y-[54%] w-[46%] aspect-square max-w-[168px]'
          } flex items-center justify-center pointer-events-none`}
        >
          {/* Ambient Crimson Aura Behind Realistic Avatar */}
          <div className="absolute inset-0 rounded-full bg-[#E50914]/35 blur-md" />

          {/* Outer Tactical Ring Accent */}
          <svg
            viewBox="0 0 200 200"
            className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none"
          >
            <circle
              cx="100"
              cy="100"
              r="94"
              fill="none"
              stroke="#E50914"
              strokeWidth="1.8"
              strokeOpacity="0.55"
              strokeDasharray="10 6"
            />
            {config.accentShape === 'octagon' && (
              <polygon
                points="100,6 166,34 194,100 166,166 100,194 34,166 6,100 34,34"
                fill="none"
                stroke="#E50914"
                strokeWidth="2"
                strokeOpacity="0.7"
              />
            )}
            {config.accentShape === 'diamond' && (
              <polygon
                points="100,4 196,100 100,196 4,100"
                fill="none"
                stroke="#E50914"
                strokeWidth="2"
                strokeOpacity="0.65"
              />
            )}
            {config.accentShape === 'shield' && (
              <path
                d="M100,8 L178,38 L178,106 C178,152 140,182 100,196 C60,182 22,152 22,106 L22,38 Z"
                fill="none"
                stroke="#E50914"
                strokeWidth="2.2"
                strokeOpacity="0.75"
              />
            )}
          </svg>

          {/* Realistic Fighter Portrait Circle with High-Contrast Rim */}
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-[#E50914] shadow-[0_0_25px_rgba(229,9,20,0.55)] bg-[#121212]">
            <img
              src={activePhotoSrc}
              alt={title}
              loading="lazy"
              style={{ objectPosition: variant === 'hero' ? '56% 24%' : config.objectPosition }}
              className={`w-full h-full object-cover ${variant === 'hero' ? 'scale-125' : config.scale} contrast-[1.15] brightness-[1.08] saturate-[1.1]`}
            />
            {/* Inner Dramatic Crimson Rim & Bottom Vignette */}
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/25 bg-gradient-to-t from-[#090909]/65 via-transparent to-[#E50914]/15" />
          </div>
        </div>
      )}

      {/* 4. Cinematic Bottom & Left Vignette Scrim for Text Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/35 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090909]/85 via-[#090909]/20 to-transparent pointer-events-none" />
    </div>
  );
};
