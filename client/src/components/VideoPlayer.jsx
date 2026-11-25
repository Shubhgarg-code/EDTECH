import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  CheckCircle,
  SkipForward,
  AlertCircle,
  ExternalLink,
  Youtube
} from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../utils/youtube';

export const VideoPlayer = ({
  src,
  videoSource,
  youtubeVideoId,
  title,
  isCompleted,
  onToggleComplete,
  onProgressUpdate,
  initialTime = 0,
  onNextLecture
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  // Determine if this is a YouTube lecture
  const detectedYouTubeId = youtubeVideoId || (videoSource === 'youtube' || videoSource === 'external' ? extractYouTubeId(src) : extractYouTubeId(src));
  const isYouTube = Boolean(detectedYouTubeId || videoSource === 'youtube');

  // Set initial watch time once loaded (for HTML5 video)
  useEffect(() => {
    if (!isYouTube && videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [src, initialTime, isYouTube]);

  // Periodic progress saving (every 8 seconds for HTML5 video)
  useEffect(() => {
    if (isYouTube) return;
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        onProgressUpdate?.(Math.floor(videoRef.current.currentTime));
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [onProgressUpdate, isYouTube]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setSpeedMenuOpen(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ----------------------------------------------------
  // YOUTUBE EMBED PLAYER
  // ----------------------------------------------------
  if (isYouTube) {
    const yId = detectedYouTubeId;

    if (!yId) {
      return (
        <div className="relative bg-[#070B14] border border-red-500/30 rounded-2xl overflow-hidden aspect-video shadow-2xl flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3 animate-pulse" />
          <h4 className="text-base font-bold text-white mb-1">Invalid YouTube URL</h4>
          <p className="text-xs text-[#A7B5CC] max-w-md mb-4">
            The provided YouTube link could not be parsed into a valid video ID. Please verify the URL in the admin course editor.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleComplete?.(!isCompleted)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isCompleted ? 'bg-emerald-600 text-white' : 'bg-[#1E293B] hover:bg-[#334155] text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>
            {onNextLecture && (
              <button
                onClick={onNextLecture}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center gap-1.5 transition"
              >
                <span>Next Lecture</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      );
    }

    const embedUrl = getYouTubeEmbedUrl(yId);

    return (
      <div
        ref={containerRef}
        className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video shadow-2xl flex flex-col justify-between group select-none border border-[#3B82F6]/20"
      >
        {/* Top Overlay Header */}
        <div className="absolute top-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between text-white z-20 pointer-events-auto">
          <div className="flex items-center gap-2 max-w-[70%]">
            <span className="p-1 rounded bg-red-600/90 text-white shrink-0" title="YouTube Lecture">
              <Youtube className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs sm:text-sm font-semibold truncate text-white">{title}</h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleComplete?.(!isCompleted)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
            </button>

            {onNextLecture && (
              <button
                type="button"
                onClick={onNextLecture}
                title="Next Lecture"
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Embedded Iframe */}
        <div className="w-full h-full">
          <iframe
            src={embedUrl}
            title={title || 'Mathematics Academy Lecture'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HTML5 DIRECT VIDEO PLAYER (MP4 / WebM / R2 signed URL)
  // ----------------------------------------------------
  return (
    <div
      ref={containerRef}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video shadow-2xl flex flex-col justify-end group select-none border border-[#3B82F6]/20"
    >
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          onToggleComplete?.(true);
        }}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Floating Center Play Button if paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95 cursor-pointer z-10"
        >
          <Play className="w-8 h-8 fill-white ml-1" />
        </button>
      )}

      {/* Top Overlay Header */}
      <div
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h4 className="text-sm font-semibold truncate max-w-md">{title}</h4>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleComplete?.(!isCompleted)}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isCompleted
                ? 'bg-emerald-500/90 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-3 pt-6 flex flex-col gap-2 transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar Seek Slider */}
        <div className="relative flex items-center group/seek">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="p-1 hover:text-blue-400 transition cursor-pointer">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
              title="Rewind 10s"
              className="p-1 hover:text-blue-400 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {onNextLecture && (
              <button
                onClick={onNextLecture}
                title="Next Lecture"
                className="p-1 hover:text-blue-400 transition cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1 hover:text-blue-400 transition cursor-pointer">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {/* Timestamp */}
            <span className="text-[11px] font-mono text-slate-300 ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                className="px-2 py-1 rounded hover:bg-white/10 text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{playbackSpeed}x</span>
              </button>

              {speedMenuOpen && (
                <div className="absolute bottom-8 right-0 bg-slate-900 border border-slate-800 rounded-lg py-1 shadow-2xl z-20 w-24">
                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => changeSpeed(spd)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-blue-600 transition cursor-pointer ${
                        playbackSpeed === spd ? 'text-blue-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {spd}x {spd === 1 && '(Normal)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="p-1 hover:text-blue-400 transition cursor-pointer">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
