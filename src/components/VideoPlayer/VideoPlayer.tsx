import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Bookmark,
  Settings,
  Download
} from 'lucide-react';
import { videoStreamingService } from '../../services/videoStreamingService';

interface VideoPlayerProps {
  videoId: string;
  autoplay?: boolean;
  onProgress?: (currentTime: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function VideoPlayer({ videoId, autoplay = false, onProgress, onComplete, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const playerData = videoStreamingService.createPlayerData(videoId);

  useEffect(() => {
    if (playerData) {
      setBookmarksState(playerData.bookmarks);
      if (videoRef.current && playerData.startTime > 0) {
        videoRef.current.currentTime = playerData.startTime;
      }
    }
  }, [playerData]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
      if (autoplay) {
        video.play();
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime);
      playerData?.onProgress(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
      playerData?.onComplete();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [autoplay, onProgress, onComplete, playerData]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    handleSeek(newTime);
  };

  const addBookmark = async () => {
    if (playerData) {
      await playerData.onBookmark(currentTime);
      setBookmarksState([...bookmarks, currentTime].sort((a, b) => a - b));
    }
  };

  const jumpToBookmark = (timestamp: number) => {
    handleSeek(timestamp);
  };

  const setBookmarksState = (newBookmarksState: number[]) => {
    setBookmarksState(newBookmarksState);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  if (!playerData) {
    return (
      <div className="bg-gray-100 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📹</div>
        <p className="text-gray-600">Vídeo não encontrado</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={playerData.video.videoUrl}
        poster={playerData.video.thumbnail}
        className="w-full h-full object-cover"
        data-video-id={videoId}
        preload="metadata"
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
            <p>Carregando vídeo...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="font-bold text-lg">{playerData.video.title}</h3>
              <p className="text-sm opacity-75">{playerData.video.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={addBookmark}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                title="Adicionar marcador"
              >
                <Bookmark className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-white/20 hover:bg-white/30 rounded-full p-6 transition-all duration-300 transform hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="h-12 w-12 text-white" />
            ) : (
              <Play className="h-12 w-12 text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="w-full h-2 bg-white/30 rounded-full">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              
              {/* Bookmarks on progress bar */}
              {bookmarks.map((bookmark, index) => (
                <button
                  key={index}
                  onClick={() => jumpToBookmark(bookmark)}
                  className="absolute top-0 w-3 h-3 bg-yellow-400 rounded-full transform -translate-y-1/2 hover:scale-125 transition-transform"
                  style={{ left: `${(bookmark / duration) * 100}%` }}
                  title={`Marcador: ${formatTime(bookmark)}`}
                />
              ))}
              
              {/* Seek handle */}
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => skip(-10)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                title="Voltar 10s"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </button>
              
              <button
                onClick={() => skip(10)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                title="Avançar 10s"
              >
                <SkipForward className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none slider"
                />
              </div>

              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm bg-black/30 px-2 py-1 rounded">
                {playbackRate}x
              </span>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        {showSettings && (
          <div className="absolute bottom-20 right-4 bg-black/80 rounded-2xl p-4 text-white min-w-48">
            <h4 className="font-bold mb-3">Configurações</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-2">Velocidade de Reprodução</label>
                <div className="grid grid-cols-4 gap-1">
                  {[0.5, 1, 1.25, 1.5].map(rate => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`px-2 py-1 rounded text-xs ${
                        playbackRate === rate 
                          ? 'bg-red-600' 
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Qualidade</label>
                <select className="w-full bg-white/20 rounded px-2 py-1 text-sm">
                  <option value="auto">Automática</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                  <option value="360p">360p</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Bookmarks Panel */}
        {bookmarks.length > 0 && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/80 rounded-2xl p-4 text-white max-w-48">
            <h4 className="font-bold mb-3 text-sm">📑 Marcadores</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {bookmarks.map((bookmark, index) => (
                <button
                  key={index}
                  onClick={() => jumpToBookmark(bookmark)}
                  className="w-full text-left p-2 rounded hover:bg-white/20 transition-colors text-sm"
                >
                  {formatTime(bookmark)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              {playerData.video.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {playerData.video.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>⏱️ {videoStreamingService.formatDuration(playerData.video.duration)}</span>
              <span>👁️ {playerData.video.viewCount} visualizações</span>
              <span>⭐ {playerData.video.rating}/5</span>
              <span className="capitalize">📊 {playerData.video.difficulty}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={addBookmark}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
              title="Adicionar marcador"
            >
              <Bookmark className="h-5 w-5 text-blue-600" />
            </button>
            
            <button
              onClick={() => {/* Implement download */}}
              className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
              title="Download para offline"
            >
              <Download className="h-5 w-5 text-green-600" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {playerData.progress && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Seu progresso</span>
              <span>{videoStreamingService.getProgressPercentage(playerData.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${videoStreamingService.getProgressPercentage(playerData.progress)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}