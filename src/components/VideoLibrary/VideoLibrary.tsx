import { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  Star, 
  Search, 
  Filter, 
  BookOpen,
  TrendingUp,
  Eye,
  Bookmark
} from 'lucide-react';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { videoStreamingService } from '../../services/videoStreamingService';
import { useAuth } from '../../hooks/useAuth';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  thumbnail: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  viewCount: number;
  rating: number;
}

interface VideoProgress {
  videoId: string;
  watchedDuration: number;
  totalDuration: number;
  completed: boolean;
}

export function VideoLibrary() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [userProgress, setUserProgress] = useState<VideoProgress[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideoContent();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadVideoContent = async () => {
    try {
      setLoading(true);
      await videoStreamingService.initialize();
      
      // Get all videos
      const allVideos = Array.from(['introducao', 'biodiversidade', 'estrutura', 'conservacao'])
        .flatMap(category => videoStreamingService.getVideosByCategory(category));
      
      setVideos(allVideos);
      
      // Get playlists
      const allPlaylists = videoStreamingService.getAllPlaylists();
      setPlaylists(allPlaylists);
    } catch (error) {
      console.error('Error loading video content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user) return;
    
    try {
      const progress = await videoStreamingService.getUserProgress(user.id);
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const getFilteredVideos = () => {
    let filtered = videos;

    // Search filter
    if (searchQuery) {
      filtered = videoStreamingService.searchVideos(searchQuery, {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
      });
    } else {
      // Category filter
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(video => video.category === selectedCategory);
      }
      
      // Difficulty filter
      if (selectedDifficulty !== 'all') {
        filtered = filtered.filter(video => video.difficulty === selectedDifficulty);
      }
    }

    return filtered;
  };

  const getVideoProgress = (videoId: string): VideoProgress | null => {
    return userProgress.find(p => p.videoId === videoId) || null;
  };

  const getProgressPercentage = (progress: VideoProgress | null): number => {
    if (!progress) return 0;
    return Math.round((progress.watchedDuration / progress.totalDuration) * 100);
  };

  const getCategoryDisplayName = (category: string): string => {
    const names = {
      introducao: 'Introdução',
      biodiversidade: 'Biodiversidade',
      estrutura: 'Estrutura',
      conservacao: 'Conservação'
    };
    return names[category as keyof typeof names] || category;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const categories = Array.from(new Set(videos.map(v => v.category)));
  const filteredVideos = getFilteredVideos();

  if (selectedVideo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setSelectedVideo(null)}
            className="mb-6 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Voltar à biblioteca
          </button>
          
          <VideoPlayer
            videoId={selectedVideo}
            onComplete={() => {
              loadUserProgress(); // Refresh progress after completion
            }}
            className="w-full aspect-video"
          />
          
          {/* Related Videos */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Vídeos Relacionados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videos
                .filter(v => v.id !== selectedVideo && v.category === videos.find(vid => vid.id === selectedVideo)?.category)
                .slice(0, 3)
                .map(video => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video.id)}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm text-gray-800 mb-1">{video.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{videoStreamingService.formatDuration(video.duration)}</span>
                        <span>⭐ {video.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            📹 Biblioteca de Vídeos Educativos
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Aprenda sobre os mangues através de vídeos educativos criados especialmente para você!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vídeos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as categorias</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dificuldade</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as dificuldades</option>
                    <option value="easy">Fácil</option>
                    <option value="medium">Médio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Videos */}
        {user && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Recomendados para Você
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videoStreamingService.getRecommendedVideos(user.id, 3).map(video => {
                const progress = getVideoProgress(video.id);
                const progressPercentage = getProgressPercentage(progress);
                
                return (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video.id)}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-white/20 rounded-full p-4">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Progress overlay */}
                      {progressPercentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                          <div 
                            className="h-full bg-red-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}
                      
                      {/* Duration */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {videoStreamingService.formatDuration(video.duration)}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{video.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                            {video.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getCategoryDisplayName(video.category)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Eye className="h-3 w-3" />
                          <span>{video.viewCount}</span>
                          <Star className="h-3 w-3 text-yellow-500 ml-2" />
                          <span>{video.rating}</span>
                        </div>
                      </div>
                      
                      {progressPercentage > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Playlists */}
        {playlists.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <BookOpen className="h-6 w-6 mr-2 text-green-600" />
              Playlists Educativas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playlists.map(playlist => (
                <div
                  key={playlist.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{playlist.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{playlist.description}</p>
                    </div>
                    <div className="text-4xl">📚</div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{playlist.videos.length} vídeos</span>
                    <span>{videoStreamingService.formatDuration(playlist.estimatedDuration)}</span>
                    <span className="capitalize">{playlist.difficulty}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      // Start first video in playlist
                      if (playlist.videos.length > 0) {
                        setSelectedVideo(playlist.videos[0]);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:from-green-600 hover:to-blue-600 transition-colors"
                  >
                    ▶️ Iniciar Playlist
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Videos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📺 Todos os Vídeos ({filteredVideos.length})
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum vídeo encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou termo de busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => {
                const progress = getVideoProgress(video.id);
                const progressPercentage = getProgressPercentage(progress);
                
                return (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video.id)}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-white/20 rounded-full p-4">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      {progressPercentage > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                          <div 
                            className="h-full bg-red-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}
                      
                      {/* Duration */}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        {videoStreamingService.formatDuration(video.duration)}
                      </div>
                      
                      {/* Completed badge */}
                      {progress?.completed && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ✓ Completo
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{video.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(video.difficulty)}`}>
                          {video.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getCategoryDisplayName(video.category)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            <span>{video.viewCount}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span>{video.rating}</span>
                          </div>
                        </div>
                        
                        {progress && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{progressPercentage}%</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress bar */}
                      {progressPercentage > 0 && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}