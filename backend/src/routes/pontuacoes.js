import express from 'express';
const router = express.Router();
import { query } from '../config/database.js';

// GET /api/pontuacoes - Get all scores
router.get('/pontuacoes', async (req, res) => {
  try {
    const { jogo, limite } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (jogo) {
      whereConditions.push(`jogo = $${paramIndex}`);
      queryParams.push(jogo);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const limitClause = limite ? `LIMIT $${paramIndex}` : '';
    if (limite) queryParams.push(parseInt(limite));
    
    const result = await query(`
      SELECT 
        id,
        nome_jogador,
        jogo,
        pontuacao,
        categoria,
        dificuldade,
        detalhes,
        created_at as data
      FROM pontuacoes 
      ${whereClause}
      ORDER BY pontuacao DESC, created_at DESC
      ${limitClause}
    `, queryParams);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pontuações:', error);
    res.status(500).json({ error: 'Erro ao buscar pontuações' });
  }
});

// POST /api/pontuacoes - Add new score
router.post('/pontuacoes', async (req, res) => {
  try {
    const { nomeJogador, jogo, pontuacao, dificuldade, categoria, detalhes } = req.body;
    
    if (!nomeJogador || !jogo || pontuacao === undefined) {
      return res.status(400).json({ 
        error: 'Nome do jogador, jogo e pontuação são obrigatórios' 
      });
    }
    
    if (typeof pontuacao !== 'number' || pontuacao < 0) {
      return res.status(400).json({ 
        error: 'Pontuação deve ser um número positivo' 
      });
    }
    
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
      nomeJogador.trim(),
      jogo,
      pontuacao,
      categoria || null,
      dificuldade || null,
      JSON.stringify(detalhes || {})
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao salvar pontuação:', error);
    res.status(500).json({ error: 'Erro ao salvar pontuação' });
  }
});

// GET /api/ranking - Get ranking
router.get('/ranking', async (req, res) => {
  try {
    const { jogo, limite } = req.query;
    const limiteNum = limite ? parseInt(limite) : 20;
    
    let whereCondition = '';
    let queryParams = [limiteNum];
    
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
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// GET /api/estatisticas - Get statistics
router.get('/estatisticas', async (req, res) => {
  try {
    const [totalResult, jogosTipoResult, pontuacaoMediaResult, melhorResult, jogadorAtivoResult] = await Promise.all([
      // Total de jogos
      query('SELECT COUNT(*) as total FROM pontuacoes'),
      
      // Jogos por tipo
      query('SELECT jogo, COUNT(*) as count FROM pontuacoes GROUP BY jogo'),
      
      // Pontuação média por jogo
      query('SELECT jogo, ROUND(AVG(pontuacao)) as media FROM pontuacoes GROUP BY jogo'),
      
      // Melhor pontuação
      query('SELECT MAX(pontuacao) as melhor FROM pontuacoes'),
      
      // Jogador mais ativo
      query(`
        SELECT nome_jogador, COUNT(*) as jogos 
        FROM pontuacoes 
        GROUP BY nome_jogador 
        ORDER BY COUNT(*) DESC 
        LIMIT 1
      `)
    ]);
    
    const estatisticas = {
      totalJogos: parseInt(totalResult.rows[0]?.total || 0),
      jogosPorTipo: Object.fromEntries(
        jogosTipoResult.rows.map(row => [row.jogo, parseInt(row.count)])
      ),
      pontuacaoMedia: Object.fromEntries(
        pontuacaoMediaResult.rows.map(row => [row.jogo, parseInt(row.media)])
      ),
      melhorPontuacao: parseInt(melhorResult.rows[0]?.melhor || 0),
      jogadorMaisAtivo: jogadorAtivoResult.rows[0] ? {
        nome: jogadorAtivoResult.rows[0].nome_jogador,
        jogos: parseInt(jogadorAtivoResult.rows[0].jogos)
      } : null
    };
    
    res.json(estatisticas);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/pontuacoes/jogador/:nome - Get scores for specific player
router.get('/pontuacoes/jogador/:nome', async (req, res) => {
  try {
    const nome = req.params.nome;
    
    const result = await query(`
      SELECT 
        id,
        nome_jogador,
        jogo,
        pontuacao,
        categoria,
        dificuldade,
        detalhes,
        created_at as data
      FROM pontuacoes 
      WHERE LOWER(nome_jogador) = LOWER($1)
      ORDER BY pontuacao DESC, created_at DESC
    `, [nome]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pontuações do jogador:', error);
    res.status(500).json({ error: 'Erro ao buscar pontuações do jogador' });
  }
});

export default router;