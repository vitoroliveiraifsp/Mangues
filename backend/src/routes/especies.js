import express from 'express';
const router = express.Router();
import especiesData from '../data/especies.js';

// GET /api/especies - Get all species
router.get('/especies', (req, res) => {
  try {
    // Simulate network delay
    setTimeout(() => {
      res.json(especiesData);
    }, 200);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar espécies' });
  }
});

// GET /api/especies/:id - Get specific species
router.get('/especies/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const especie = especiesData.find(e => e.id === id);
    
    if (!especie) {
      return res.status(404).json({ error: 'Espécie não encontrada' });
    }
    
    res.json(especie);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar espécie' });
  }
});

export default router;