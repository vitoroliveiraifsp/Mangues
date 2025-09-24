import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { initDatabase, healthCheck } from './src/config/database.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Inicializar banco de dados
console.log('🔄 Inicializando servidor...');
await initDatabase();

// Segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar para desenvolvimento
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://0.0.0.0:5000', `https://${process.env.REPLIT_DEV_DOMAIN}`].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: { error: 'Muitas requisições, tente novamente em 15 minutos' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Importar rotas
import especiesRoutes from './src/routes/especies.js';
import ameacasRoutes from './src/routes/ameacas.js';
import jogoRoutes from './src/routes/jogo.js';
import conexoesRoutes from './src/routes/conexoes.js';
import quizRoutes from './src/routes/quiz.js';
import pontuacoesRoutes from './src/routes/pontuacoes.js';
import authRoutes from './src/routes/auth.js';

// Usar rotas
app.use('/api', especiesRoutes);
app.use('/api', ameacasRoutes);
app.use('/api', jogoRoutes);
app.use('/api', conexoesRoutes);
app.use('/api', quizRoutes);
app.use('/api', pontuacoesRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await healthCheck();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: { status: 'unhealthy' }
    });
  }
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  // Erro de validação JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'JSON inválido no corpo da requisição' 
    });
  }
  
  // Erro genérico
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM. Fechando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT. Fechando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

// Inicialização do servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌿 Servidor do Mundo dos Mangues rodando na porta ${PORT}`);
  console.log(`🔗 Acesse: http://localhost:${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});

export default server;