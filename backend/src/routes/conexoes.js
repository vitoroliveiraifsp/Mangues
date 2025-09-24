import express from 'express';
const router = express.Router();

// Data for the connections game
const animaisConexoes = [
  { 
    id: 1, 
    nome: "Caranguejo-uçá", 
    imagem: "🦀", 
    categoria: "animal",
    superpoder: "Oxigena o solo fazendo buracos na lama"
  },
  { 
    id: 2, 
    nome: "Garça-branca", 
    imagem: "🦢", 
    categoria: "animal",
    superpoder: "Controla a população de peixes e crustáceos"
  },
  { 
    id: 3, 
    nome: "Mangue-vermelho", 
    imagem: "🌳", 
    categoria: "planta",
    superpoder: "Filtra a água salgada com suas raízes especiais"
  },
  { 
    id: 4, 
    nome: "Peixe-boi", 
    imagem: "🐋", 
    categoria: "animal",
    superpoder: "Limpa a vegetação aquática mantendo o ecossistema"
  },
  { 
    id: 5, 
    nome: "Guará", 
    imagem: "🦩", 
    categoria: "animal",
    superpoder: "Espalha sementes voando entre os mangues"
  },
  { 
    id: 6, 
    nome: "Sabiá-da-praia", 
    imagem: "🐦", 
    categoria: "animal",
    superpoder: "Controla insetos com seu canto e alimentação"
  }
];

// GET /api/conexoes - Get animals for the connections game
router.get('/conexoes', (req, res) => {
  try {
    setTimeout(() => {
      res.json(animaisConexoes);
    }, 200);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados das conexões' });
  }
});

export default router;