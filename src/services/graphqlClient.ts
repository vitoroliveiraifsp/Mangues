// GraphQL client for improved data fetching
interface GraphQLQuery {
  query: string;
  variables?: { [key: string]: any };
  operationName?: string;
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

class GraphQLClient {
  private endpoint: string;
  private headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };

  constructor() {
    this.endpoint = this.getGraphQLEndpoint();
  }

  private getGraphQLEndpoint(): string {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname.includes('replit') || hostname.includes('.app')) {
      return '/api-proxy/graphql';
    } else if (port === '8080') {
      return '/api/graphql';
    } else {
      return 'http://localhost:3001/api/graphql';
    }
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.headers['Authorization'];
  }

  async query<T = any>(queryData: GraphQLQuery): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(queryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL query');
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  // Predefined queries
  async getQuizCategories() {
    return this.query({
      query: `
        query GetQuizCategories {
          quizCategories {
            id
            nome
            emoji
            questoes
            ativo
          }
        }
      `
    });
  }

  async getQuizQuestions(categoria?: string, dificuldade?: string, limite = 10) {
    return this.query({
      query: `
        query GetQuizQuestions($categoria: String, $dificuldade: String, $limite: Int) {
          quizQuestions(categoria: $categoria, dificuldade: $dificuldade, limite: $limite) {
            id
            categoria
            pergunta
            opcoes
            respostaCorreta
            explicacao
            dificuldade
            pontos
          }
        }
      `,
      variables: { categoria, dificuldade, limite }
    });
  }

  async getSpecies() {
    return this.query({
      query: `
        query GetSpecies {
          especies {
            id
            nome
            descricao
            habitat
            imagem
            adaptacoes
            categoria
          }
        }
      `
    });
  }

  async getThreats() {
    return this.query({
      query: `
        query GetThreats {
          ameacas {
            id
            titulo
            descricao
            impacto
            solucoes
            imagem
            gravidade
          }
        }
      `
    });
  }

  async getRanking(jogo?: string, limite = 20) {
    return this.query({
      query: `
        query GetRanking($jogo: String, $limite: Int) {
          ranking(jogo: $jogo, limite: $limite) {
            id
            nomeJogador
            jogo
            pontuacao
            categoria
            dificuldade
            data
            posicao
            detalhes
          }
        }
      `,
      variables: { jogo, limite }
    });
  }

  async getStatistics() {
    return this.query({
      query: `
        query GetStatistics {
          estatisticas {
            totalJogos
            jogosPorTipo
            pontuacaoMedia
            melhorPontuacao
            jogadorMaisAtivo {
              nome
              jogos
            }
          }
        }
      `
    });
  }

  async submitQuizResult(resultData: any) {
    return this.query({
      query: `
        mutation SubmitQuizResult($input: QuizResultInput!) {
          submitQuizResult(input: $input) {
            pontuacaoTotal
            acertos
            totalQuestoes
            percentualAcerto
            tempoTotal
            bonusTempo
            medalha
            resultadoDetalhado {
              questaoId
              correto
              respostaSelecionada
              respostaCorreta
              pontos
              explicacao
            }
          }
        }
      `,
      variables: { input: resultData }
    });
  }

  async saveScore(scoreData: any) {
    return this.query({
      query: `
        mutation SaveScore($input: ScoreInput!) {
          saveScore(input: $input) {
            id
            nomeJogador
            jogo
            pontuacao
            created_at
          }
        }
      `,
      variables: { input: scoreData }
    });
  }

  // Analytics queries
  async getAnalytics(timeRange: string = '7d') {
    return this.query({
      query: `
        query GetAnalytics($timeRange: String!) {
          analytics(timeRange: $timeRange) {
            totalUsers
            activeUsers
            gamesPlayed
            averageScore
            popularCategories {
              categoria
              count
              percentage
            }
            userEngagement {
              date
              users
              games
              avgSessionTime
            }
            performanceMetrics {
              avgLoadTime
              errorRate
              cacheHitRate
            }
          }
        }
      `,
      variables: { timeRange }
    });
  }

  async getUserProgress(userId: string) {
    return this.query({
      query: `
        query GetUserProgress($userId: ID!) {
          userProgress(userId: $userId) {
            totalGames
            totalScore
            averageScore
            bestScore
            timeSpent
            achievements {
              id
              title
              description
              icon
              unlockedAt
              category
            }
            gameStats {
              memoria {
                played
                bestScore
                averageTime
              }
              quiz {
                played
                bestScore
                correctAnswers
              }
              conexoes {
                played
                bestScore
                correctConnections
              }
            }
          }
        }
      `,
      variables: { userId }
    });
  }
}

export const graphqlClient = new GraphQLClient();