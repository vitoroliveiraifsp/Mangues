import express from 'express';
import { buildSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express'; 
import { query } from '../config/database.js';

const router = express.Router();



// GraphQL Schema
const schema = buildSchema(`
  type QuizCategory {
    id: String!
    nome: String!
    emoji: String
    questoes: Int!
    ativo: Boolean!
  }

  type QuizQuestion {
    id: ID!
    categoria: String!
    pergunta: String!
    opcoes: [String!]!
    respostaCorreta: Int!
    explicacao: String!
    dificuldade: String!
    pontos: Int!
  }

  type Species {
    id: ID!
    nome: String!
    descricao: String!
    habitat: String!
    imagem: String!
    adaptacoes: [String!]!
    categoria: String!
  }

  type Threat {
    id: ID!
    titulo: String!
    descricao: String!
    impacto: String!
    solucoes: [String!]!
    imagem: String!
    gravidade: Int!
  }

  type Score {
    id: ID!
    nomeJogador: String!
    jogo: String!
    pontuacao: Int!
    categoria: String
    dificuldade: String
    data: String!
    posicao: Int
    detalhes: String
  }

  type Statistics {
    totalJogos: Int!
    jogosPorTipo: String!
    pontuacaoMedia: String!
    melhorPontuacao: Int!
    jogadorMaisAtivo: PlayerStats
  }

  type PlayerStats {
    nome: String!
    jogos: Int!
  }

  type Analytics {
    totalUsers: Int!
    activeUsers: Int!
    gamesPlayed: Int!
    averageScore: Float!
    popularCategories: [CategoryStats!]!
    userEngagement: [EngagementData!]!
    performanceMetrics: PerformanceMetrics!
  }

  type CategoryStats {
    categoria: String!
    count: Int!
    percentage: Float!
  }

  type EngagementData {
    date: String!
    users: Int!
    games: Int!
    avgSessionTime: Float!
  }

  type PerformanceMetrics {
    avgLoadTime: Float!
    errorRate: Float!
    cacheHitRate: Float!
  }

  type QuizResult {
    pontuacaoTotal: Int!
    acertos: Int!
    totalQuestoes: Int!
    percentualAcerto: Float!
    tempoTotal: Int!
    bonusTempo: Int!
    medalha: String!
    resultadoDetalhado: [QuestionResult!]!
  }

  type QuestionResult {
    questaoId: ID!
    correto: Boolean!
    respostaSelecionada: Int!
    respostaCorreta: Int!
    pontos: Int!
    explicacao: String!
  }

  input QuizResultInput {
    respostas: [AnswerInput!]!
    tempoTotal: Int!
    categoria: String!
  }

  input AnswerInput {
    questaoId: ID!
    respostaSelecionada: Int!
  }

  input ScoreInput {
    nomeJogador: String!
    jogo: String!
    pontuacao: Int!
    categoria: String
    dificuldade: String
    detalhes: String
  }

  type Query {
    quizCategories: [QuizCategory!]!
    quizQuestions(categoria: String, dificuldade: String, limite: Int): [QuizQuestion!]!
    especies: [Species!]!
    ameacas: [Threat!]!
    ranking(jogo: String, limite: Int): [Score!]!
    estatisticas: Statistics!
    analytics(timeRange: String!): Analytics!
  }

  type Mutation {
    submitQuizResult(input: QuizResultInput!): QuizResult!
    saveScore(input: ScoreInput!): Score!
  }
`);

// GraphQL Resolvers
const rootResolver = {
  // Queries
  quizCategories: async () => {
    try {
      const result = await query(`
        SELECT 
          c.id,
          c.nome,
          c.emoji,
          COUNT(q.id) as questoes,
          c.ativo
        FROM quiz_categorias c
        LEFT JOIN quiz_questoes q ON c.id = q.categoria_id AND q.ativo = true
        WHERE c.ativo = true
        GROUP BY c.id, c.nome, c.emoji, c.ativo
        ORDER BY c.id
      `);
      
      return result.rows.map(row => ({
        ...row,
        questoes: parseInt(row.questoes)
      }));
    } catch (error) {
      throw new Error('Erro ao buscar categorias');
    }
  },

  quizQuestions: async ({ categoria, dificuldade, limite = 10 }) => {
    try {
      let whereConditions = ['ativo = true'];
      let queryParams = [];
      let paramIndex = 1;
      
      if (categoria) {
        whereConditions.push(`categoria_id = $${paramIndex}`);
        queryParams.push(categoria);
        paramIndex++;
      }
      
      if (dificuldade) {
        whereConditions.push(`dificuldade = $${paramIndex}`);
        queryParams.push(dificuldade);
        paramIndex++;
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      const result = await query(`
        SELECT 
          id,
          categoria_id as categoria,
          pergunta,
          opcoes,
          resposta_correta,
          explicacao,
          dificuldade,
          pontos
        FROM quiz_questoes 
        WHERE ${whereClause}
        ORDER BY RANDOM()
        LIMIT $${paramIndex}
      `, [...queryParams, limite]);
      
      return result.rows.map(row => ({
        ...row,
        respostaCorreta: row.resposta_correta
      }));
    } catch (error) {
      throw new Error('Erro ao buscar questões');
    }
  },

  especies: async () => {
    // Return static data for now
    const especiesData = [
      {
        id: '1',
        nome: 'Caranguejo-uçá',
        descricao: 'Grande caranguejo que vive nos mangues e ajuda a oxigenar o solo cavando buracos profundos na lama.',
        habitat: 'Buracos na lama do mangue, entre as raízes das árvores',
        imagem: '🦀',
        adaptacoes: [
          'Brânquias modificadas para respirar fora da água',
          'Garras fortes para cavar buracos profundos',
          'Carapaça resistente para proteção'
        ],
        categoria: 'animal'
      }
      // Add more species as needed
    ];
    return especiesData;
  },

  ameacas: async () => {
    // Return static data for now
    const ameacasData = [
      {
        id: '1',
        titulo: 'Poluição da Água',
        descricao: 'Lixo, produtos químicos e esgoto são jogados na água, deixando-a suja e perigosa.',
        impacto: 'Peixes, caranguejos e outros animais ficam doentes ou morrem.',
        solucoes: [
          'Não jogue lixo na natureza',
          'Use produtos de limpeza naturais',
          'Participe de mutirões de limpeza'
        ],
        imagem: '🌊',
        gravidade: 4
      }
      // Add more threats as needed
    ];
    return ameacasData;
  },

  ranking: async ({ jogo, limite = 20 }) => {
    try {
      let whereCondition = '';
      let queryParams = [limite];
      
      if (jogo) {
        whereCondition = 'WHERE jogo = $2';
        queryParams.push(jogo);
      }
      
      const result = await query(`
        SELECT 
          id,
          nome_jogador,
          jogo,
          pontuacao,
          categoria,
          dificuldade,
          detalhes,
          created_at as data,
          ROW_NUMBER() OVER (ORDER BY pontuacao DESC, created_at ASC) as posicao
        FROM pontuacoes 
        ${whereCondition}
        ORDER BY pontuacao DESC, created_at ASC
        LIMIT $1
      `, queryParams);
      
      return result.rows.map(row => ({
        ...row,
        data: row.data.toISOString(),
        detalhes: JSON.stringify(row.detalhes || {})
      }));
    } catch (error) {
      throw new Error('Erro ao buscar ranking');
    }
  },

  estatisticas: async () => {
    try {
      const [totalResult, jogosTipoResult, pontuacaoMediaResult, melhorResult, jogadorAtivoResult] = await Promise.all([
        query('SELECT COUNT(*) as total FROM pontuacoes'),
        query('SELECT jogo, COUNT(*) as count FROM pontuacoes GROUP BY jogo'),
        query('SELECT jogo, ROUND(AVG(pontuacao)) as media FROM pontuacoes GROUP BY jogo'),
        query('SELECT MAX(pontuacao) as melhor FROM pontuacoes'),
        query(`
          SELECT nome_jogador, COUNT(*) as jogos 
          FROM pontuacoes 
          GROUP BY nome_jogador 
          ORDER BY COUNT(*) DESC 
          LIMIT 1
        `)
      ]);
      
      return {
        totalJogos: parseInt(totalResult.rows[0]?.total || 0),
        jogosPorTipo: JSON.stringify(Object.fromEntries(
          jogosTipoResult.rows.map(row => [row.jogo, parseInt(row.count)])
        )),
        pontuacaoMedia: JSON.stringify(Object.fromEntries(
          pontuacaoMediaResult.rows.map(row => [row.jogo, parseInt(row.media)])
        )),
        melhorPontuacao: parseInt(melhorResult.rows[0]?.melhor || 0),
        jogadorMaisAtivo: jogadorAtivoResult.rows[0] ? {
          nome: jogadorAtivoResult.rows[0].nome_jogador,
          jogos: parseInt(jogadorAtivoResult.rows[0].jogos)
        } : null
      };
    } catch (error) {
      throw new Error('Erro ao buscar estatísticas');
    }
  },

  analytics: async ({ timeRange }) => {
    try {
      // Mock analytics data - in production, this would query real analytics
      const mockAnalytics = {
        totalUsers: 156,
        activeUsers: 89,
        gamesPlayed: 1247,
        averageScore: 750.5,
        popularCategories: [
          { categoria: 'biodiversidade', count: 523, percentage: 42.0 },
          { categoria: 'estrutura', count: 412, percentage: 33.1 },
          { categoria: 'conservacao', count: 312, percentage: 25.0 }
        ],
        userEngagement: [
          { date: '2024-01-15', users: 45, games: 123, avgSessionTime: 12.5 },
          { date: '2024-01-16', users: 52, games: 145, avgSessionTime: 15.2 },
          { date: '2024-01-17', users: 38, games: 98, avgSessionTime: 11.8 }
        ],
        performanceMetrics: {
          avgLoadTime: 2.3,
          errorRate: 0.02,
          cacheHitRate: 0.85
        }
      };

      return mockAnalytics;
    } catch (error) {
      throw new Error('Erro ao buscar analytics');
    }
  },

  // Mutations
  submitQuizResult: async ({ input }) => {
    try {
      const { respostas, tempoTotal, categoria } = input;
      
      // Get questions to calculate result
      const questaoIds = respostas.map(r => r.questaoId);
      const questoesResult = await query(`
        SELECT id, resposta_correta, pontos, explicacao
        FROM quiz_questoes 
        WHERE id = ANY($1)
      `, [questaoIds]);
      
      const questoesMap = new Map(questoesResult.rows.map(q => [q.id, q]));
      
      let pontuacaoTotal = 0;
      let acertos = 0;
      const resultadoDetalhado = [];
      
      respostas.forEach(resposta => {
        const questao = questoesMap.get(resposta.questaoId);
        if (questao) {
          const correto = questao.resposta_correta === resposta.respostaSelecionada;
          if (correto) {
            acertos++;
            pontuacaoTotal += questao.pontos;
          }
          
          resultadoDetalhado.push({
            questaoId: questao.id,
            correto,
            respostaSelecionada: resposta.respostaSelecionada,
            respostaCorreta: questao.resposta_correta,
            pontos: correto ? questao.pontos : 0,
            explicacao: questao.explicacao
          });
        }
      });
      
      // Time bonus
      const tempoIdeal = respostas.length * 30;
      const bonusTempo = Math.max(0, Math.floor((tempoIdeal - tempoTotal) / 10));
      pontuacaoTotal += bonusTempo;
      
      const resultado = {
        pontuacaoTotal,
        acertos,
        totalQuestoes: respostas.length,
        percentualAcerto: (acertos / respostas.length) * 100,
        tempoTotal,
        bonusTempo,
        medalha: acertos === respostas.length ? 'ouro' :
                 acertos >= respostas.length * 0.8 ? 'prata' :
                 acertos >= respostas.length * 0.6 ? 'bronze' : 'participacao',
        resultadoDetalhado
      };
      
      return resultado;
    } catch (error) {
      throw new Error('Erro ao processar resultado do quiz');
    }
  },

  saveScore: async ({ input }) => {
    try {
      const { nomeJogador, jogo, pontuacao, categoria, dificuldade, detalhes } = input;
      
      const result = await query(`
        INSERT INTO pontuacoes (
          nome_jogador, 
          jogo, 
          pontuacao, 
          categoria, 
          dificuldade, 
          detalhes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        nomeJogador,
        jogo,
        pontuacao,
        categoria,
        dificuldade,
        detalhes
      ]);
      
      const savedScore = result.rows[0];
      return {
        ...savedScore,
        data: savedScore.created_at.toISOString(),
        detalhes: JSON.stringify(savedScore.detalhes || {})
      };
    } catch (error) {
      throw new Error('Erro ao salvar pontuação');
    }
  }
};

// GraphQL endpoint
router.use('/graphql', createHandler({
  schema: schema,
  rootValue: rootResolver,
  context: (req) => ({ req }),
  graphiql: process.env.NODE_ENV === 'development',
}));

export default router;