import express from 'express';
const router = express.Router();
import jogoData from '../data/jogo.js';

// GET /api/jogo-memoria - Get memory game cards
router.get('/jogo-memoria', (req, res) => {
  try {
    setTimeout(() => {
      res.json(jogoData);
    }, 200);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cartas do jogo' });
  }
});

export default router;