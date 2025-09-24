import express from 'express';
const router = express.Router();
import { query } from '../config/database.js';

// GET /api/quiz - Get quiz questions
router.get('/quiz', async (req, res) => {
  try {
    const { categoria, dificuldade, limite = 10 } = req.query;
    
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
    
    const queryText = `
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
    `;
    
    queryParams.push(parseInt(limite));
    
    const result = await query(queryText, queryParams);
    
    // Simular delay de rede
    setTimeout(() => {
      res.json(result.rows);
    }, 200);
  } catch (error) {
    console.error('Erro ao buscar questões:', error);
    res.status(500).json({ error: 'Erro ao buscar questões do quiz' });
  }
});

// GET /api/quiz/:id - Get specific question  
router.get('/quiz/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
      WHERE id = $1 AND ativo = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar questão:', error);
    res.status(500).json({ error: 'Erro ao buscar questão' });
  }
});

// GET /api/quiz/categorias - Get available categories
router.get('/quiz/categorias', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        c.id,
        c.nome,
        c.emoji,
        COUNT(q.id) as questoes
      FROM quiz_categorias c
      LEFT JOIN quiz_questoes q ON c.id = q.categoria_id AND q.ativo = true
      WHERE c.ativo = true
      GROUP BY c.id, c.nome, c.emoji
      ORDER BY c.id
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// POST /api/quiz/resultado - Submit quiz result
router.post('/quiz/resultado', async (req, res) => {
  try {
    const { respostas, tempoTotal, categoria, dificuldade } = req.body;
    
    if (!respostas || !Array.isArray(respostas)) {
      return res.status(400).json({ error: 'Respostas inválidas' });
    }
    
    // Buscar questões para calcular resultado
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
    
    // Bônus por tempo (se completou em menos de 30 segundos por questão)
    const tempoIdeal = respostas.length * 30; // 30 segundos por questão
    const bonusTempo = Math.max(0, Math.floor((tempoIdeal - tempoTotal) / 10));
    pontuacaoTotal += bonusTempo;
    
    const resultado = {
      pontuacaoTotal,
      acertos,
      totalQuestoes: respostas.length,
      percentualAcerto: Math.round((acertos / respostas.length) * 100),
      tempoTotal,
      bonusTempo,
      categoria,
      dificuldade,
      resultadoDetalhado,
      medalha: acertos === respostas.length ? 'ouro' :
               acertos >= respostas.length * 0.8 ? 'prata' :
               acertos >= respostas.length * 0.6 ? 'bronze' : 'participacao'
    };
    
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao processar resultado:', error);
    res.status(500).json({ error: 'Erro ao processar resultado do quiz' });
  }
});

export default router;