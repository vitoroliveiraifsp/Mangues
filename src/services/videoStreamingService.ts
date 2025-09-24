// Video streaming service for educational content
interface VideoContent {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // in seconds
  thumbnail: string;
  videoUrl: string;
  subtitles?: {
    language: string;
    url: string;
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  viewCount: number;
  rating: number;
  createdAt: string;
}

interface VideoProgress {
  videoId: string;
  userId: string;
  watchedDuration: number;
  totalDuration: number;
  completed: boolean;
  lastWatched: string;
  bookmarks: number[]; // timestamps
}

interface VideoPlaylist {
  id: string;
  title: string;
  description: string;
  videos: string[]; // video IDs
  category: string;
  difficulty: string;
  estimatedDuration: number;
  createdAt: string;
}

class VideoStreamingService {
  private videos: Map<string, VideoContent> = new Map();
  private playlists: Map<string, VideoPlaylist> = new Map();
  private userProgress: Map<string, VideoProgress[]> = new Map();
  private currentPlayer: HTMLVideoElement | null = null;

  async initialize() {
    await this.loadVideoContent();
    this.setupEventListeners();
    console.log('📹 Video streaming service initialized');
  }

  private async loadVideoContent() {
    // Educational video content about mangroves
    const videoContent: VideoContent[] = [
      {
        id: 'intro_mangues',
        title: 'O que são os Mangues?',
        description: 'Uma introdução divertida aos ecossistemas de mangue para crianças',
        category: 'introducao',
        duration: 180, // 3 minutes
        thumbnail: 'https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Demo video
        difficulty: 'easy',
        tags: ['introdução', 'básico', 'crianças'],
        viewCount: 0,
        rating: 5.0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'biodiversidade_mangues',
        title: 'Animais Incríveis dos Mangues',
        description: 'Conheça os animais fascinantes que vivem nos mangues brasileiros',
        category: 'biodiversidade',
        duration: 240, // 4 minutes
        thumbnail: 'https://images.pexels.com/photos/1618606/pexels-photo-1618606.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
        difficulty: 'easy',
        tags: ['animais', 'biodiversidade', 'natureza'],
        viewCount: 0,
        rating: 4.8,
        createdAt: new Date().toISOString()
      },
      {
        id: 'conservacao_mangues',
        title: 'Como Proteger os Mangues',
        description: 'Aprenda ações práticas para conservar os ecossistemas de mangue',
        category: 'conservacao',
        duration: 300, // 5 minutes
        thumbnail: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
        difficulty: 'medium',
        tags: ['conservação', 'sustentabilidade', 'ação'],
        viewCount: 0,
        rating: 4.9,
        createdAt: new Date().toISOString()
      },
      {
        id: 'ciclos_naturais',
        title: 'Os Ciclos da Natureza no Mangue',
        description: 'Entenda como funcionam os ciclos naturais nos ecossistemas de mangue',
        category: 'estrutura',
        duration: 360, // 6 minutes
        thumbnail: 'https://images.pexels.com/photos/1029609/pexels-photo-1029609.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_7mb.mp4',
        difficulty: 'medium',
        tags: ['ciclos', 'ecossistema', 'ciência'],
        viewCount: 0,
        rating: 4.7,
        createdAt: new Date().toISOString()
      },
      {
        id: 'restauracao_mangues',
        title: 'Restauração de Mangues',
        description: 'Projetos de restauração e como você pode ajudar',
        category: 'conservacao',
        duration: 420, // 7 minutes
        thumbnail: 'https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=400',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_10mb.mp4',
        difficulty: 'hard',
        tags: ['restauração', 'projeto', 'voluntariado'],
        viewCount: 0,
        rating: 4.6,
        createdAt: new Date().toISOString()
      }
    ];

    videoContent.forEach(video => this.videos.set(video.id, video));
    this.createPlaylists();
  }

  private createPlaylists() {
    const playlists: VideoPlaylist[] = [
      {
        id: 'iniciante_completo',
        title: 'Curso Completo para Iniciantes',
        description: 'Tudo que você precisa saber sobre mangues em uma playlist organizada',
        videos: ['intro_mangues', 'biodiversidade_mangues', 'ciclos_naturais'],
        category: 'curso',
        difficulty: 'easy',
        estimatedDuration: 780, // 13 minutes
        createdAt: new Date().toISOString()
      },
      {
        id: 'conservacao_avancada',
        title: 'Conservação e Sustentabilidade',
        description: 'Aprenda sobre conservação e como fazer a diferença',
        videos: ['conservacao_mangues', 'restauracao_mangues'],
        category: 'conservacao',
        difficulty: 'medium',
        estimatedDuration: 720, // 12 minutes
        createdAt: new Date().toISOString()
      }
    ];

    playlists.forEach(playlist => this.playlists.set(playlist.id, playlist));
  }

  private setupEventListeners() {
    // Listen for video events to track progress
    document.addEventListener('play', this.handleVideoPlay.bind(this), true);
    document.addEventListener('pause', this.handleVideoPause.bind(this), true);
    document.addEventListener('ended', this.handleVideoEnded.bind(this), true);
    document.addEventListener('timeupdate', this.handleTimeUpdate.bind(this), true);
  }

  private handleVideoPlay(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video.dataset.videoId) {
      this.currentPlayer = video;
      console.log(`▶️ Video started: ${video.dataset.videoId}`);
    }
  }

  private handleVideoPause(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video.dataset.videoId) {
      this.updateProgress(video.dataset.videoId, video.currentTime, false);
      console.log(`⏸️ Video paused: ${video.dataset.videoId} at ${video.currentTime}s`);
    }
  }

  private handleVideoEnded(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video.dataset.videoId) {
      this.updateProgress(video.dataset.videoId, video.duration, true);
      console.log(`✅ Video completed: ${video.dataset.videoId}`);
    }
  }

  private handleTimeUpdate(event: Event) {
    const video = event.target as HTMLVideoElement;
    if (video.dataset.videoId && video.currentTime % 10 < 0.5) { // Update every 10 seconds
      this.updateProgress(video.dataset.videoId, video.currentTime, false);
    }
  }

  private updateProgress(videoId: string, currentTime: number, completed: boolean) {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    let userProgress = this.userProgress.get(userId) || [];
    let videoProgress = userProgress.find(p => p.videoId === videoId);

    if (!videoProgress) {
      const video = this.videos.get(videoId);
      if (!video) return;

      videoProgress = {
        videoId,
        userId,
        watchedDuration: 0,
        totalDuration: video.duration,
        completed: false,
        lastWatched: new Date().toISOString(),
        bookmarks: []
      };
      userProgress.push(videoProgress);
    }

    videoProgress.watchedDuration = Math.max(videoProgress.watchedDuration, currentTime);
    videoProgress.completed = completed || (currentTime / videoProgress.totalDuration) > 0.9;
    videoProgress.lastWatched = new Date().toISOString();

    this.userProgress.set(userId, userProgress);
    this.saveProgressData();
  }

  private getCurrentUserId(): string | null {
    // Get from auth service
    const userData = localStorage.getItem('mangues_user');
    if (userData) {
      try {
        return JSON.parse(userData).id;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  private saveProgressData() {
    try {
      const data = {
        progress: Array.from(this.userProgress.entries()),
        lastUpdate: Date.now()
      };
      localStorage.setItem('mangues_video_progress', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  }

  // Public methods
  getVideoById(videoId: string): VideoContent | null {
    return this.videos.get(videoId) || null;
  }

  getVideosByCategory(category: string): VideoContent[] {
    return Array.from(this.videos.values())
      .filter(video => video.category === category)
      .sort((a, b) => b.rating - a.rating);
  }

  getPlaylistById(playlistId: string): VideoPlaylist | null {
    return this.playlists.get(playlistId) || null;
  }

  getAllPlaylists(): VideoPlaylist[] {
    return Array.from(this.playlists.values())
      .sort((a, b) => a.difficulty.localeCompare(b.difficulty));
  }

  async getUserProgress(userId: string, videoId?: string): Promise<VideoProgress[]> {
    const progress = this.userProgress.get(userId) || [];
    return videoId ? progress.filter(p => p.videoId === videoId) : progress;
  }

  async addBookmark(videoId: string, timestamp: number): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const userProgress = this.userProgress.get(userId) || [];
    let videoProgress = userProgress.find(p => p.videoId === videoId);

    if (!videoProgress) {
      const video = this.videos.get(videoId);
      if (!video) return;

      videoProgress = {
        videoId,
        userId,
        watchedDuration: 0,
        totalDuration: video.duration,
        completed: false,
        lastWatched: new Date().toISOString(),
        bookmarks: []
      };
      userProgress.push(videoProgress);
    }

    if (!videoProgress.bookmarks.includes(timestamp)) {
      videoProgress.bookmarks.push(timestamp);
      videoProgress.bookmarks.sort((a, b) => a - b);
    }

    this.userProgress.set(userId, userProgress);
    this.saveProgressData();
  }

  async removeBookmark(videoId: string, timestamp: number): Promise<void> {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const userProgress = this.userProgress.get(userId) || [];
    const videoProgress = userProgress.find(p => p.videoId === videoId);

    if (videoProgress) {
      videoProgress.bookmarks = videoProgress.bookmarks.filter(t => t !== timestamp);
      this.userProgress.set(userId, userProgress);
      this.saveProgressData();
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getProgressPercentage(progress: VideoProgress): number {
    return Math.round((progress.watchedDuration / progress.totalDuration) * 100);
  }

  // Search functionality
  searchVideos(query: string, filters?: {
    category?: string;
    difficulty?: string;
    minDuration?: number;
    maxDuration?: number;
  }): VideoContent[] {
    const queryLower = query.toLowerCase();
    let results = Array.from(this.videos.values()).filter(video =>
      video.title.toLowerCase().includes(queryLower) ||
      video.description.toLowerCase().includes(queryLower) ||
      video.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );

    if (filters) {
      if (filters.category) {
        results = results.filter(video => video.category === filters.category);
      }
      if (filters.difficulty) {
        results = results.filter(video => video.difficulty === filters.difficulty);
      }
      if (filters.minDuration) {
        results = results.filter(video => video.duration >= filters.minDuration!);
      }
      if (filters.maxDuration) {
        results = results.filter(video => video.duration <= filters.maxDuration!);
      }
    }

    return results.sort((a, b) => b.rating - a.rating);
  }

  // Recommendation based on user behavior
  getRecommendedVideos(userId: string, limit = 5): VideoContent[] {
    const progress = this.userProgress.get(userId) || [];
    const watchedCategories = new Map<string, number>();
    
    // Analyze user preferences
    progress.forEach(p => {
      const video = this.videos.get(p.videoId);
      if (video) {
        const count = watchedCategories.get(video.category) || 0;
        watchedCategories.set(video.category, count + 1);
      }
    });

    // Get videos from preferred categories that user hasn't watched
    const watchedVideoIds = new Set(progress.map(p => p.videoId));
    const recommendations = Array.from(this.videos.values())
      .filter(video => !watchedVideoIds.has(video.id))
      .sort((a, b) => {
        const aPreference = watchedCategories.get(a.category) || 0;
        const bPreference = watchedCategories.get(b.category) || 0;
        if (bPreference !== aPreference) return bPreference - aPreference;
        return b.rating - a.rating;
      })
      .slice(0, limit);

    return recommendations;
  }

  // Create video player component data
  createPlayerData(videoId: string) {
    const video = this.videos.get(videoId);
    if (!video) return null;

    const userId = this.getCurrentUserId();
    const progress = userId ? 
      this.userProgress.get(userId)?.find(p => p.videoId === videoId) : 
      null;

    return {
      video,
      progress,
      startTime: progress?.watchedDuration || 0,
      bookmarks: progress?.bookmarks || [],
      onProgress: (currentTime: number) => this.updateProgress(videoId, currentTime, false),
      onComplete: () => this.updateProgress(videoId, video.duration, true),
      onBookmark: (timestamp: number) => this.addBookmark(videoId, timestamp)
    };
  }

  private getCurrentUserId(): string | null {
    const userData = localStorage.getItem('mangues_user');
    if (userData) {
      try {
        return JSON.parse(userData).id;
      } catch (error) {
        return null;
      }
    }
    return null;
  }
}

export const videoStreamingService = new VideoStreamingService();