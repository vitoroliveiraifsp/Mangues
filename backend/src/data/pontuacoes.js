// Sistema de pontuação local (em produção, usar banco de dados)
let pontuacoes = [
  {
    id: 1,
    nomeJogador: "Ana",
    jogo: "memoria",
    pontuacao: 850,
    dificuldade: "medio",
    data: new Date('2024-01-15').toISOString(),
    detalhes: {
      tentativas: 12,
      tempo: 45,
      pares: 10
    }
  },
  {
    id: 2,
    nomeJogador: "Carlos",
    jogo: "quiz",
    pontuacao: 180,
    categoria: "biodiversidade",
    dificuldade: "facil",
    data: new Date('2024-01-14').toISOString(),
    detalhes: {
      acertos: 8,
      total: 10,
      tempo: 120
    }
  },
  {
    id: 3,
    nomeJogador: "Maria",
    jogo: "conexoes",
    pontuacao: 420,
    data: new Date('2024-01-13').toISOString(),
    detalhes: {
      conexoesCorretas: 6,
      tentativas: 8
    }
  }
];

let proximoId = 4;

export const obterPontuacoes = () => pontuacoes;

export const adicionarPontuacao = (novaPontuacao) => {
  const pontuacao = {
    id: proximoId++,
    ...novaPontuacao,
    data: new Date().toISOString()
  };
  
  pontuacoes.push(pontuacao);
  
  // Manter apenas as 100 melhores pontuações para não sobrecarregar
  pontuacoes = pontuacoes
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .slice(0, 100);
  
  return pontuacao;
};

export const obterRanking = (jogo = null, limite = 10) => {
  let ranking = [...pontuacoes];
  
  if (jogo) {
    ranking = ranking.filter(p => p.jogo === jogo);
  }
  
  return ranking
    .sort((a, b) => b.pontuacao - a.pontuacao)
    .slice(0, limite)
    .map((pontuacao, index) => ({
      ...pontuacao,
      posicao: index + 1
    }));
};

export const obterEstatisticas = () => {
  const totalJogos = pontuacoes.length;
  const jogosPorTipo = {};
  const pontuacaoMedia = {};
  
  pontuacoes.forEach(p => {
    if (!jogosPorTipo[p.jogo]) {
      jogosPorTipo[p.jogo] = 0;
      pontuacaoMedia[p.jogo] = [];
    }
    jogosPorTipo[p.jogo]++;
    pontuacaoMedia[p.jogo].push(p.pontuacao);
  });
  
  // Calcular médias
  Object.keys(pontuacaoMedia).forEach(jogo => {
    const pontuacoes = pontuacaoMedia[jogo];
    pontuacaoMedia[jogo] = Math.round(
      pontuacoes.reduce((a, b) => a + b, 0) / pontuacoes.length
    );
  });
  
  return {
    totalJogos,
    jogosPorTipo,
    pontuacaoMedia,
    melhorPontuacao: Math.max(...pontuacoes.map(p => p.pontuacao)),
    jogadorMaisAtivo: obterJogadorMaisAtivo()
  };
};

const obterJogadorMaisAtivo = () => {
  const jogadores = {};
  pontuacoes.forEach(p => {
    if (!jogadores[p.nomeJogador]) {
      jogadores[p.nomeJogador] = 0;
    }
    jogadores[p.nomeJogador]++;
  });
  
  const jogadorMaisAtivo = Object.entries(jogadores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return jogadorMaisAtivo ? {
    nome: jogadorMaisAtivo[0],
    jogos: jogadorMaisAtivo[1]
  } : null;
};

export default {
  obterPontuacoes,
  adicionarPontuacao,
  obterRanking,
  obterEstatisticas
};