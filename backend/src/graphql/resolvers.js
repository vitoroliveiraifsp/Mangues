import { query } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const JWT_SECRET = process.env.JWT_SECRET || 'mangues-quiz-secret-key-change-in-production';

// In-memory storage for real-time features (in production, use Redis)
const activeQuizzes = new Map();
const multiplayerRooms = new Map();

export const resolvers = {
  Query: {
    // User queries
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Não autenticado');
      
      try {
        const result = await query(
          'SELECT id, nome, email, created_at FROM usuarios WHERE id = $1',
          [user.userId]
        );
        return result.rows[0];
      } catch (error) {
        // Fallback for development without database
        return {
          id: user.userId,
          nome: 'Usuário Demo',
          email: user.email,
          created_at: new Date().toISOString()
        };
      }
    },

    leaderboard: async (_, { jogo, categoria, limit = 10 }) => {
      try {
        let sql = `
          SELECT ROW_NUMBER() OVER (ORDER BY pontuacao DESC) as posicao,
                 nome_jogador, pontuacao, jogo, categoria, created_at
          FROM pontuacoes 
          WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        if (jogo) {
          paramCount++;
          sql += ` AND jogo = $${paramCount}`;
          params.push(jogo);
        }

        if (categoria) {
          paramCount++;
          sql += ` AND categoria = $${paramCount}`;
          params.push(categoria);
        }

        paramCount++;
        sql += ` ORDER BY pontuacao DESC LIMIT $${paramCount}`;
        params.push(limit);

        const result = await query(sql, params);
        return result.rows;
      } catch (error) {
        // Fallback mock data
        return [
          {
            posicao: 1,
            nome_jogador: 'Ana Silva',
            pontuacao: 950,
            jogo: 'quiz',
            categoria: 'biodiversidade',
            created_at: new Date().toISOString()
          },
          {
            posicao: 2,
            nome_jogador: 'Carlos Santos',
            pontuacao: 890,
            jogo: 'quiz',
            categoria: 'estrutura',
            created_at: new Date().toISOString()
          }
        ];
      }
    },

    leaderboardStats: async (_, __, { user }) => {
      // Mock implementation for development
      return {
        ranking_global: [],
        ranking_mensal: [],
        ranking_semanal: [],
        minha_posicao: 1,
        total_jogadores: 150
      };
    },

    // Content queries
    especies: async (_, { categoria, limit }) => {
      // Import static data
      const especiesData = (await import('../data/especies.js')).default;
      let filteredData = especiesData;

      if (categoria) {
        filteredData = especiesData.filter(e => e.categoria === categoria);
      }

      if (limit) {
        filteredData = filteredData.slice(0, limit);
      }

      return filteredData;
    },

    especie: async (_, { id }) => {
      const especiesData = (await import('../data/especies.js')).default;
      return especiesData.find(e => e.id === parseInt(id));
    },

    ameacas: async (_, { gravidade, limit }) => {
      const ameacasData = (await import('../data/ameacas.js')).default;
      let filteredData = ameacasData;

      if (gravidade) {
        filteredData = ameacasData.filter(a => a.gravidade === gravidade);
      }

      if (limit) {
        filteredData = filteredData.slice(0, limit);
      }

      return filteredData;
    },

    ameaca: async (_, { id }) => {
      const ameacasData = (await import('../data/ameacas.js')).default;
      return ameacasData.find(a => a.id === parseInt(id));
    },

    // Quiz queries
    questoesQuiz: async (_, { input }) => {
      try {
        let sql = 'SELECT * FROM quiz_questoes WHERE ativo = true';
        const params = [];
        let paramCount = 0;

        if (input.categoria) {
          paramCount++;
          sql += ` AND categoria_id = $${paramCount}`;
          params.push(input.categoria);
        }

        if (input.dificuldade) {
          paramCount++;
          sql += ` AND dificuldade = $${paramCount}`;
          params.push(input.dificuldade);
        }

        paramCount++;
        sql += ` ORDER BY RANDOM() LIMIT $${paramCount}`;
        params.push(input.total_questoes);

        const result = await query(sql, params);
        return result.rows;
      } catch (error) {
        // Fallback to static quiz data
        const quizData = (await import('../data/quiz.js')).default;
        return quizData.slice(0, input.total_questoes);
      }
    },

    categorias: async () => {
      try {
        const result = await query('SELECT DISTINCT id FROM quiz_categorias WHERE ativo = true');
        return result.rows.map(row => row.id);
      } catch (error) {
        return ['biodiversidade', 'estrutura', 'conservacao'];
      }
    },

    // Game queries
    jogoMemoria: async (_, { dificuldade }) => {
      const jogoData = (await import('../data/jogo.js')).default;
      return jogoData.memoria[dificuldade] || jogoData.memoria.facil;
    },

    conexoesJogo: async () => {
      const jogoData = (await import('../data/jogo.js')).default;
      return jogoData.conexoes;
    },

    // Analytics queries
    analytics: async (_, { days = 30 }) => {
      // Mock analytics data for development
      return {
        totalJogadores: 1250,
        jogosRealizados: 3420,
        pontuacaoMedia: 742.5,
        jogoMaisPopular: 'quiz',
        categoriaPreferida: 'biodiversidade',
        estatisticasPorJogo: [
          {
            jogo: 'quiz',
            totalJogadas: 2100,
            pontuacaoMedia: 780.2,
            tempoMedio: 180000,
            taxaConclusao: 0.89
          },
          {
            jogo: 'memoria',
            totalJogadas: 890,
            pontuacaoMedia: 650.1,
            tempoMedio: 120000,
            taxaConclusao: 0.92
          }
        ],
        engajamentoDiario: Array.from({ length: days }, (_, i) => ({
          data: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          jogadores_ativos: Math.floor(Math.random() * 100) + 50,
          sessoes: Math.floor(Math.random() * 200) + 100,
          tempo_medio_sessao: Math.floor(Math.random() * 300) + 180
        }))
      };
    },

    minhasEstatisticas: async (_, __, { user }) => {
      if (!user) throw new Error('Não autenticado');
      
      // Mock user stats for development
      return {
        totalJogos: 42,
        pontuacaoMedia: 856.7,
        melhorPontuacao: 1200,
        tempoTotalJogado: 18600, // 5.17 hours in seconds
        jogoFavorito: 'quiz',
        nivelMedio: 'intermediario'
      };
    },

    // Multiplayer queries
    multiplayerRooms: async () => {
      return Array.from(multiplayerRooms.values());
    },

    multiplayerRoom: async (_, { codigo }) => {
      return multiplayerRooms.get(codigo);
    }
  },

  Mutation: {
    // User mutations
    register: async (_, { input }) => {
      const { nome, email, password } = input;

      if (!nome || !email || !password) {
        throw new Error('Nome, email e senha são obrigatórios');
      }

      if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      try {
        // Try database first
        const existingUser = await query(
          'SELECT id FROM usuarios WHERE email = $1',
          [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
          throw new Error('Este email já está em uso');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const result = await query(`
          INSERT INTO usuarios (nome, email, password_hash)
          VALUES ($1, $2, $3)
          RETURNING id, nome, email, created_at
        `, [nome.trim(), email.toLowerCase(), hashedPassword]);

        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        return { token, user };
      } catch (dbError) {
        // Fallback for development
        const user = {
          id: Date.now().toString(),
          nome: nome.trim(),
          email: email.toLowerCase(),
          created_at: new Date().toISOString()
        };

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return { token, user };
      }
    },

    login: async (_, { email, password }) => {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }

      try {
        const result = await query(
          'SELECT id, nome, email, password_hash, created_at FROM usuarios WHERE email = $1',
          [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
          throw new Error('Email ou senha incorretos');
        }

        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
          throw new Error('Email ou senha incorretos');
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return { token, user: { id: user.id, nome: user.nome, email: user.email, created_at: user.created_at } };
      } catch (dbError) {
        // Demo login for development
        if (email === 'demo@mangues.com' && password === 'demo123') {
          const user = {
            id: 'demo-user',
            nome: 'Usuário Demo',
            email: 'demo@mangues.com',
            created_at: new Date().toISOString()
          };
          const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
          return { token, user };
        }
        throw new Error('Email ou senha incorretos');
      }
    },

    // Quiz mutations
    iniciarQuiz: async (_, { input }, { user }) => {
      const questoes = await resolvers.Query.questoesQuiz(_, { input });
      
      if (user) {
        activeQuizzes.set(user.userId, {
          questoes,
          respostas: [],
          inicio: Date.now(),
          input
        });
      }

      return questoes;
    },

    responderQuestao: async (_, { input }, { user }) => {
      if (!user) throw new Error('Não autenticado');

      const quiz = activeQuizzes.get(user.userId);
      if (!quiz) throw new Error('Quiz não encontrado');

      const questao = quiz.questoes.find(q => q.id === parseInt(input.questao_id));
      if (!questao) throw new Error('Questão não encontrada');

      const isCorreta = input.resposta === questao.resposta_correta;
      const pontos = isCorreta ? questao.pontos : 0;

      const resposta = {
        questao_id: input.questao_id,
        pergunta: questao.pergunta,
        opcoes: questao.opcoes,
        resposta_usuario: input.resposta,
        resposta_correta: questao.resposta_correta,
        is_correta: isCorreta,
        tempo_resposta: input.tempo_resposta,
        pontos_ganhos: pontos,
        explicacao: questao.explicacao
      };

      quiz.respostas.push(resposta);

      const pontuacaoTotal = quiz.respostas.reduce((sum, r) => sum + r.pontos_ganhos, 0);
      const acertos = quiz.respostas.filter(r => r.is_correta).length;

      return {
        pontuacao_total: pontuacaoTotal,
        acertos,
        total_questoes: quiz.questoes.length,
        tempo_total: Date.now() - quiz.inicio,
        categoria: quiz.input.categoria,
        dificuldade: quiz.input.dificuldade,
        questoes_respondidas: quiz.respostas
      };
    },

    finalizarQuiz: async (_, __, { user }) => {
      if (!user) throw new Error('Não autenticado');

      const quiz = activeQuizzes.get(user.userId);
      if (!quiz) throw new Error('Quiz não encontrado');

      const resultado = {
        pontuacao_total: quiz.respostas.reduce((sum, r) => sum + r.pontos_ganhos, 0),
        acertos: quiz.respostas.filter(r => r.is_correta).length,
        total_questoes: quiz.questoes.length,
        tempo_total: Date.now() - quiz.inicio,
        categoria: quiz.input.categoria,
        dificuldade: quiz.input.dificuldade,
        questoes_respondidas: quiz.respostas
      };

      // Save score
      try {
        await query(`
          INSERT INTO pontuacoes (nome_jogador, jogo, pontuacao, categoria, dificuldade, detalhes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          'Usuário',
          'quiz',
          resultado.pontuacao_total,
          resultado.categoria,
          resultado.dificuldade,
          JSON.stringify(resultado)
        ]);
      } catch (error) {
        console.log('Could not save to database, using in-memory storage');
      }

      activeQuizzes.delete(user.userId);

      // Publish new score for real-time updates
      pubsub.publish('NEW_SCORE', { newScore: resultado });

      return resultado;
    },

    // Game mutations
    salvarPontuacaoMemoria: async (_, { input }, { user }) => {
      const pontuacao = calculateMemoryScore(input);
      
      try {
        const result = await query(`
          INSERT INTO pontuacoes (nome_jogador, jogo, pontuacao, categoria, dificuldade, detalhes)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          user ? 'Usuário' : 'Anônimo',
          'memoria',
          pontuacao,
          null,
          input.dificuldade,
          JSON.stringify(input)
        ]);
        
        return result.rows[0];
      } catch (error) {
        // Return mock result for development
        return {
          id: Date.now(),
          nome_jogador: 'Usuário',
          jogo: 'memoria',
          pontuacao,
          categoria: null,
          dificuldade: input.dificuldade,
          detalhes: input,
          created_at: new Date().toISOString()
        };
      }
    },

    salvarPontuacaoConexao: async (_, { input }, { user }) => {
      const pontuacao = calculateConnectionScore(input);
      
      try {
        const result = await query(`
          INSERT INTO pontuacoes (nome_jogador, jogo, pontuacao, categoria, dificuldade, detalhes)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [
          user ? 'Usuário' : 'Anônimo',
          'conexoes',
          pontuacao,
          null,
          null,
          JSON.stringify(input)
        ]);
        
        return result.rows[0];
      } catch (error) {
        return {
          id: Date.now(),
          nome_jogador: 'Usuário',
          jogo: 'conexoes',
          pontuacao,
          categoria: null,
          dificuldade: null,
          detalhes: input,
          created_at: new Date().toISOString()
        };
      }
    },

    // Analytics mutations
    trackEvent: async (_, { categoria, acao, label, value }) => {
      console.log(`📊 Event tracked: ${categoria}/${acao}${label ? `/${label}` : ''}${value ? ` (${value})` : ''}`);
      return true;
    }
  },

  Subscription: {
    roomUpdated: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`ROOM_UPDATED_${roomId}`])
    },
    
    gameStarted: {
      subscribe: (_, { roomId }) => pubsub.asyncIterator([`GAME_STARTED_${roomId}`])
    },
    
    liveStats: {
      subscribe: () => pubsub.asyncIterator(['LIVE_STATS'])
    },
    
    newScore: {
      subscribe: (_, { jogo }) => pubsub.asyncIterator(['NEW_SCORE'])
    }
  },

  // Resolvers for nested fields
  User: {
    pontuacoes: async (parent) => {
      try {
        const result = await query(
          'SELECT * FROM pontuacoes WHERE nome_jogador = $1 ORDER BY created_at DESC LIMIT 10',
          [parent.nome]
        );
        return result.rows;
      } catch (error) {
        return [];
      }
    },
    
    estatisticas: async (parent) => {
      // Mock stats for development
      return {
        totalJogos: 15,
        pontuacaoMedia: 650.5,
        melhorPontuacao: 950,
        tempoTotalJogado: 7200,
        jogoFavorito: 'quiz',
        nivelMedio: 'intermediario'
      };
    }
  },

  DateTime: {
    serialize: (value) => value instanceof Date ? value.toISOString() : value,
    parseValue: (value) => new Date(value),
    parseLiteral: (ast) => new Date(ast.value)
  },

  JSON: {
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => JSON.parse(ast.value)
  }
};

// Helper functions
function calculateMemoryScore(input) {
  const baseScore = input.pares_encontrados * 100;
  const timeBonus = Math.max(0, 300 - Math.floor(input.tempo_total / 1000)) * 2;
  const attemptPenalty = Math.max(0, input.tentativas - input.pares_encontrados * 2) * 5;
  
  return Math.max(0, baseScore + timeBonus - attemptPenalty);
}

function calculateConnectionScore(input) {
  const correctConnections = input.conexoes.filter(c => c.is_correta).length;
  const baseScore = correctConnections * 50;
  const timeBonus = Math.max(0, 180 - Math.floor(input.tempo_total / 1000)) * 3;
  const attemptPenalty = Math.max(0, input.tentativas - correctConnections) * 10;
  
  return Math.max(0, baseScore + timeBonus - attemptPenalty);
}

export default resolvers;