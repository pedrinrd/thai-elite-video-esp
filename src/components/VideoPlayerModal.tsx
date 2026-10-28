import React, { useRef } from 'react';
import {
  X,
  CheckCircle2,
  Bookmark,
  SkipForward,
  Maximize2,
  Play,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { ModuleItem, VideoItem } from '../types';
import { buildDrivePreviewUrl } from '../utils/driveUtils';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  module: ModuleItem | null;
  moduleVideos: VideoItem[];
  completedVideoIds: string[];
  favoriteVideoIds: string[];
  onClose: () => void;
  onSelectVideo: (video: VideoItem) => void;
  onToggleComplete: (videoId: string) => void;
  onToggleFavorite: (videoId: string) => void;
  onNextVideo: () => void;
  hasNextVideo: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  module,
  moduleVideos,
  completedVideoIds,
  favoriteVideoIds,
  onClose,
  onSelectVideo,
  onToggleComplete,
  onToggleFavorite,
  onNextVideo,
  hasNextVideo,
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);

  if (!video) return null;

  const isCompleted = completedVideoIds.includes(video.id);
  const isFavorite = favoriteVideoIds.includes(video.id);
  const previewUrl = buildDrivePreviewUrl(video.driveFileId || video.driveLink);

  const handleFullScreen = () => {
    const el = playerContainerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Reproductor: ${video.title}`}
    >
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col p-3.5 sm:p-6 lg:p-8 pb-20 sm:pb-8">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-neutral-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-neutral-400 truncate">
              <span className="truncate">
                {module ? `Módulo ${module.code}: ${module.title}` : 'Entrenamiento'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums shrink-0">{video.duration}</span>
            </div>
            <h2
              className="text-lg sm:text-2xl font-bold text-white truncate mt-0.5"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {video.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar reproductor de video"
            className="px-3 sm:px-4 py-2 min-h-[42px] rounded-xl bg-[#171717] hover:bg-neutral-800 border border-neutral-800 text-xs sm:text-sm font-medium text-white flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Volver a Módulos</span>
            <span className="sm:hidden">Cerrar</span>
          </button>
        </div>

        {/* Main Player + Playlist Split */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 flex-1">
          {/* Left 8 cols: Embedded Google Drive Player + Controls */}
          <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-5">
            <div
              ref={playerContainerRef}
              className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#121212] border border-neutral-800 shadow-2xl"
            >
              {video.embedAllowed && previewUrl ? (
                <iframe
                  src={previewUrl}
                  title={video.title}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[#E50914] mb-3" />
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Este video tiene restringida la incorporación externa
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-md">
                    El archivo de Google Drive ({video.driveFileId}) requiere permisos de vista pública (&quot;Cualquier persona con el enlace&quot;) para reproducirse en el reproductor integrado.
                  </p>
                </div>
              )}
            </div>

            {/* Primary Student Controls Bar (Mobile Grid + Desktop Flex) */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#171717] border border-neutral-800">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => onToggleComplete(video.id)}
                  className={`col-span-2 sm:col-span-1 px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-[#E50914] hover:bg-[#c40811] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isCompleted ? 'Clase Concluida' : 'Marcar como Concluida'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(video.id)}
                  className={`px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    isFavorite
                      ? 'bg-neutral-800 border-[#E50914] text-white'
                      : 'bg-[#090909] border-neutral-800 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 shrink-0 ${isFavorite ? 'fill-[#E50914] text-[#E50914]' : ''}`} />
                  <span>{isFavorite ? 'En Favoritos' : 'Favorito'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFullScreen}
                  className="px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium bg-[#090909] hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Maximize2 className="w-4 h-4 shrink-0" />
                  <span>Pantalla Completa</span>
                </button>
              </div>

              {hasNextVideo && (
                <button
                  type="button"
                  onClick={onNextVideo}
                  className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-neutral-200 text-black flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Siguiente Clase</span>
                  <SkipForward className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>

            {/* Video Description & Metadata */}
            <div className="p-5 rounded-2xl bg-[#171717] border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>ID Drive: {video.driveFileId}</span>
                <span aria-hidden="true">·</span>
                <span>Duración: {video.duration}</span>
              </div>
              <h3 className="text-base font-bold text-white">Descripción de la Clase</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {video.description || 'Entrenamiento práctico de Muay Thai paso a paso.'}
              </p>
            </div>
          </div>

          {/* Right 4 cols: Module Lesson Playlist */}
          <div className="lg:col-span-4 flex flex-col rounded-2xl bg-[#171717] border border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <h3
                className="text-lg font-bold text-white uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Clases del Módulo ({moduleVideos.length})
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Selecciona una clase para reproducir sin salir de la plataforma
              </p>
            </div>

            <div className="divide-y divide-neutral-800/80 overflow-y-auto max-h-[540px]">
              {moduleVideos.map((item, idx) => {
                const active = item.id === video.id;
                const done = completedVideoIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectVideo(item)}
                    className={`w-full text-left p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                      active ? 'bg-[#E50914]/15' : 'hover:bg-neutral-800/60'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold tabular-nums ${
                        done
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                          : active
                          ? 'bg-[#E50914] text-white'
                          : 'bg-[#090909] text-neutral-400 border border-neutral-800'
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold line-clamp-2 ${
                          active ? 'text-white' : 'text-neutral-200'
                        }`}
                      >
                        {item.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span className="tabular-nums">{item.duration}</span>
                        {done && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-400">Concluida</span>
                          </>
                        )}
                      </div>
                    </div>
                    {active && <Play className="w-4 h-4 text-[#E50914] shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
