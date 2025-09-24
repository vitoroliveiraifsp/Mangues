import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: ID!
    nome: String!
    email: String!
    created_at: DateTime!
    pontuacoes: [Pontuacao!]!
    estatisticas: UserStats!
  }

  type UserStats {
    totalJogos: Int!
    pontuacaoMedia: Float!
    melhorPontuacao: Int!
    tempoTotalJogado: Int!
    jogoFavorito: String
    nivelMedio: String!
  }

  type Especie {
    id: ID!
    nome: String!
    descricao: String!
    habitat: String!
    imagem: String!
    adaptacoes: [String!]!
    categoria: String
    status_conservacao: String
  }

  type Ameaca {
    id: ID!
    nome: String!
    descricao: String!
    gravidade: String!
    solucoes: [String!]!
    imagem: String
    exemplos: [String!]!
  }

  type QuestaoQuiz {
    id: ID!
    categoria_id: String!
    pergunta: String!
    opcoes: [String!]!
    resposta_correta: Int!
    explicacao: String
    dificuldade: String!
    pontos: Int!
    ativo: Boolean!
  }

  type Pontuacao {
    id: ID!
    nome_jogador: String!
    jogo: String!
    pontuacao: Int!
    categoria: String
    dificuldade: String
    detalhes: JSON
    created_at: DateTime!
  }

  type QuizResult {
    pontuacao_total: Int!
    acertos: Int!
    total_questoes: Int!
    tempo_total: Int
    categoria: String!
    dificuldade: String!
    questoes_respondidas: [QuestaoResposta!]!
  }

  type QuestaoResposta {
    questao_id: ID!
    pergunta: String!
    opcoes: [String!]!
    resposta_usuario: Int!
    resposta_correta: Int!
    is_correta: Boolean!
    tempo_resposta: Int!
    pontos_ganhos: Int!
    explicacao: String
  }

  type JogoMemoria {
    id: ID!
    dificuldade: String!
    cartas: [CartaMemoria!]!
    pontuacao_maxima: Int!
    tempo_limite: Int
  }

  type CartaMemoria {
    id: String!
    imagem: String!
    nome: String!
    par_id: String!
  }

  type ConexaoJogo {
    id: ID!
    animal: String!
    habilidade: String!
    descricao: String!
    dica: String
  }

  type RankingEntry {
    posicao: Int!
    nome_jogador: String!
    pontuacao: Int!
    jogo: String!
    categoria: String
    created_at: DateTime!
  }

  type AnalyticsData {
    totalJogadores: Int!
    jogosRealizados: Int!
    pontuacaoMedia: Float!
    jogoMaisPopular: String!
    categoriaPreferida: String!
    estatisticasPorJogo: [GameStats!]!
    engajamentoDiario: [DailyEngagement!]!
  }

  type GameStats {
    jogo: String!
    totalJogadas: Int!
    pontuacaoMedia: Float!
    tempoMedio: Int!
    taxaConclusao: Float!
  }

  type DailyEngagement {
    data: String!
    jogadores_ativos: Int!
    sessoes: Int!
    tempo_medio_sessao: Int!
  }

  type MultiplayerRoom {
    id: ID!
    codigo: String!
    nome: String!
    host_id: String!
    jogo_tipo: String!
    status: String!
    jogadores: [MultiplayerPlayer!]!
    configuracoes: RoomSettings!
    created_at: DateTime!
  }

  type MultiplayerPlayer {
    id: ID!
    nome: String!
    pontuacao: Int!
    is_ready: Boolean!
    is_host: Boolean!
    posicao: Int
  }

  type RoomSettings {
    max_jogadores: Int!
    tempo_por_questao: Int!
    total_questoes: Int!
    dificuldade: String
  }

  type LeaderboardStats {
    ranking_global: [RankingEntry!]!
    ranking_mensal: [RankingEntry!]!
    ranking_semanal: [RankingEntry!]!
    minha_posicao: Int
    total_jogadores: Int!
  }

  scalar JSON

  input QuizInput {
    categoria: String!
    dificuldade: String!
    total_questoes: Int = 10
  }

  input RespostaQuizInput {
    questao_id: ID!
    resposta: Int!
    tempo_resposta: Int!
  }

  input JogoMemoriaInput {
    dificuldade: String!
    tentativas: Int!
    tempo_total: Int!
    pares_encontrados: Int!
  }

  input ConexaoJogoInput {
    conexoes: [ConexaoInput!]!
    tempo_total: Int!
    tentativas: Int!
  }

  input ConexaoInput {
    animal_id: String!
    habilidade_id: String!
    is_correta: Boolean!
  }

  input UserInput {
    nome: String!
    email: String!
    password: String!
  }

  input UserUpdateInput {
    nome: String
    email: String
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    leaderboard(jogo: String, categoria: String, limit: Int = 10): [RankingEntry!]!
    leaderboardStats: LeaderboardStats!
    
    # Content queries
    especies(categoria: String, limit: Int): [Especie!]!
    especie(id: ID!): Especie
    ameacas(gravidade: String, limit: Int): [Ameaca!]!
    ameaca(id: ID!): Ameaca
    
    # Quiz queries
    questoesQuiz(input: QuizInput!): [QuestaoQuiz!]!
    questao(id: ID!): QuestaoQuiz
    categorias: [String!]!
    
    # Game queries
    jogoMemoria(dificuldade: String!): JogoMemoria!
    conexoesJogo: [ConexaoJogo!]!
    
    # Analytics queries
    analytics(days: Int = 30): AnalyticsData!
    minhasEstatisticas: UserStats
    
    # Multiplayer queries
    multiplayerRooms: [MultiplayerRoom!]!
    multiplayerRoom(codigo: String!): MultiplayerRoom
  }

  type Mutation {
    # User mutations
    register(input: UserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(input: UserUpdateInput!): User!
    
    # Quiz mutations
    iniciarQuiz(input: QuizInput!): [QuestaoQuiz!]!
    responderQuestao(input: RespostaQuizInput!): QuizResult!
    finalizarQuiz: QuizResult!
    
    # Game mutations
    salvarPontuacaoMemoria(input: JogoMemoriaInput!): Pontuacao!
    salvarPontuacaoConexao(input: ConexaoJogoInput!): Pontuacao!
    
    # Multiplayer mutations
    criarSalaMultiplayer(nome: String!, jogo_tipo: String!): MultiplayerRoom!
    entrarSalaMultiplayer(codigo: String!, nome_jogador: String!): MultiplayerRoom!
    sairSalaMultiplayer(room_id: ID!): Boolean!
    
    # Analytics mutations
    trackEvent(categoria: String!, acao: String!, label: String, value: Int): Boolean!
  }

  type Subscription {
    # Multiplayer subscriptions
    roomUpdated(roomId: ID!): MultiplayerRoom!
    gameStarted(roomId: ID!): MultiplayerRoom!
    playerJoined(roomId: ID!): MultiplayerPlayer!
    playerLeft(roomId: ID!): String!
    
    # Real-time analytics
    liveStats: AnalyticsData!
    newScore(jogo: String): Pontuacao!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

export default typeDefs;