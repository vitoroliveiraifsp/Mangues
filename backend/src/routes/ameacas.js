import express from 'express';
const router = express.Router();
import ameacasData from '../data/ameacas.js';

// GET /api/ameacas - Get all threats
router.get('/ameacas', (req, res) => {
  try {
    setTimeout(() => {
      res.json(ameacasData);
    }, 200);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ameaças' });
  }
});

// GET /api/ameacas/:id - Get specific threat
router.get('/ameacas/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ameaca = ameacasData.find(a => a.id === id);
    
    if (!ameaca) {
      return res.status(404).json({ error: 'Ameaça não encontrada' });
    }
    
    res.json(ameaca);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ameaça' });
  }
});

export default router;