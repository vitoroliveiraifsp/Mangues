import express from 'express';
const router = express.Router();

// Mock video content data
const videoContent = [
  {
    id: 'intro_mangues',
    title: 'O que são os Mangues?',
    description: 'Uma introdução divertida aos ecossistemas de mangue para crianças',
    category: 'introducao',
    duration: 180,
    thumbnail: 'https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    difficulty: 'easy',
    tags: ['introdução', 'básico', 'crianças'],
    viewCount: 156,
    rating: 5.0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'biodiversidade_mangues',
    title: 'Animais Incríveis dos Mangues',
    description: 'Conheça os animais fascinantes que vivem nos mangues brasileiros',
    category: 'biodiversidade',
    duration: 240,
    thumbnail: 'https://images.pexels.com/photos/1618606/pexels-photo-1618606.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    difficulty: 'easy',
    tags: ['animais', 'biodiversidade', 'natureza'],
    viewCount: 203,
    rating: 4.8,
    createdAt: new Date().toISOString()
  },
  {
    id: 'conservacao_mangues',
    title: 'Como Proteger os Mangues',
    description: 'Aprenda ações práticas para conservar os ecossistemas de mangue',
    category: 'conservacao',
    duration: 300,
    thumbnail: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
    difficulty: 'medium',
    tags: ['conservação', 'sustentabilidade', 'ação'],
    viewCount: 189,
    rating: 4.9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'ciclos_naturais',
    title: 'Os Ciclos da Natureza no Mangue',
    description: 'Entenda como funcionam os ciclos naturais nos ecossistemas de mangue',
    category: 'estrutura',
    duration: 360,
    thumbnail: 'https://images.pexels.com/photos/1029609/pexels-photo-1029609.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_7mb.mp4',
    difficulty: 'medium',
    tags: ['ciclos', 'ecossistema', 'ciência'],
    viewCount: 167,
    rating: 4.7,
    createdAt: new Date().toISOString()
  },
  {
    id: 'restauracao_mangues',
    title: 'Restauração de Mangues',
    description: 'Projetos de restauração e como você pode ajudar',
    category: 'conservacao',
    duration: 420,
    thumbnail: 'https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_10mb.mp4',
    difficulty: 'hard',
    tags: ['restauração', 'projeto', 'voluntariado'],
    viewCount: 134,
    rating: 4.6,
    createdAt: new Date().toISOString()
  }
];

const playlists = [
  {
    id: 'iniciante_completo',
    title: 'Curso Completo para Iniciantes',
    description: 'Tudo que você precisa saber sobre mangues em uma playlist organizada',
    videos: ['intro_mangues', 'biodiversidade_mangues', 'ciclos_naturais'],
    category: 'curso',
    difficulty: 'easy',
    estimatedDuration: 780,
    createdAt: new Date().toISOString()
  },
  {
    id: 'conservacao_avancada',
    title: 'Conservação e Sustentabilidade',
    description: 'Aprenda sobre conservação e como fazer a diferença',
    videos: ['conservacao_mangues', 'restauracao_mangues'],
    category: 'conservacao',
    difficulty: 'medium',
    estimatedDuration: 720,
    createdAt: new Date().toISOString()
  }
];

// GET /api/videos - Get all videos
router.get('/', (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let filtered = [...videoContent];

    if (category && category !== 'all') {
      filtered = filtered.filter(video => video.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      filtered = filtered.filter(video => video.difficulty === difficulty);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchLower) ||
        video.description.toLowerCase().includes(searchLower) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ error: 'Erro ao buscar vídeos' });
  }
});

// GET /api/videos/:id - Get specific video
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const video = videoContent.find(v => v.id === id);

    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    res.json(video);
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({ error: 'Erro ao buscar vídeo' });
  }
});

// GET /api/videos/playlists - Get all playlists
router.get('/playlists', (req, res) => {
  try {
    res.json(playlists);
  } catch (error) {
    console.error('Error getting playlists:', error);
    res.status(500).json({ error: 'Erro ao buscar playlists' });
  }
});

// GET /api/videos/playlists/:id - Get specific playlist
router.get('/playlists/:id', (req, res) => {
  try {
    const { id } = req.params;
    const playlist = playlists.find(p => p.id === id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    // Include video details
    const playlistWithVideos = {
      ...playlist,
      videos: playlist.videos.map(videoId => 
        videoContent.find(v => v.id === videoId)
      ).filter(Boolean)
    };

    res.json(playlistWithVideos);
  } catch (error) {
    console.error('Error getting playlist:', error);
    res.status(500).json({ error: 'Erro ao buscar playlist' });
  }
});

// POST /api/videos/:id/progress - Update video progress
router.post('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, currentTime, completed } = req.body;

    if (!userId || currentTime === undefined) {
      return res.status(400).json({ 
        error: 'userId e currentTime são obrigatórios' 
      });
    }

    const video = videoContent.find(v => v.id === id);
    if (!video) {
      return res.status(404).json({ error: 'Vídeo não encontrado' });
    }

    // Store progress (in production, use database)
    const progressData = {
      videoId: id,
      userId,
      watchedDuration: currentTime,
      totalDuration: video.duration,
      completed: completed || false,
      lastWatched: new Date().toISOString()
    };

    // Try to store in database
    try {
      await query(`
        INSERT INTO video_progress (video_id, user_id, watched_duration, total_duration, completed, last_watched)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (video_id, user_id) 
        DO UPDATE SET 
          watched_duration = GREATEST(video_progress.watched_duration, $3),
          completed = $4 OR video_progress.completed,
          last_watched = $6
      `, [id, userId, currentTime, video.duration, completed, new Date()]);
    } catch (dbError) {
      console.log('Database not available, progress not persisted');
    }

    res.json({
      success: true,
      progress: progressData
    });
  } catch (error) {
    console.error('Error updating video progress:', error);
    res.status(500).json({ error: 'Erro ao atualizar progresso' });
  }
});

// GET /api/videos/user/:userId/progress - Get user video progress
router.get('/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;

    // Try to get from database first
    try {
      const result = await query(`
        SELECT video_id, watched_duration, total_duration, completed, last_watched
        FROM video_progress 
        WHERE user_id = $1
        ORDER BY last_watched DESC
      `, [userId]);

      res.json(result.rows);
    } catch (dbError) {
      // Fallback to empty array if database not available
      res.json([]);
    }
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ error: 'Erro ao buscar progresso' });
  }
});

export default router;