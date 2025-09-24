import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mangues-quiz-secret-key-change-in-production';

// Middleware para verificar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// POST /api/auth/register - Criar nova conta
router.post('/register', async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    // Validação
    if (!nome || !email || !password) {
      return res.status(400).json({ 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      });
    }

    // Verificar se email já existe
    const existingUser = await query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Este email já está em uso' 
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const result = await query(`
      INSERT INTO usuarios (nome, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, nome, email, created_at
    `, [nome.trim(), email.toLowerCase(), hashedPassword]);

    const user = result.rows[0];

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    
    // Se a tabela 'usuarios' não existir, retornar erro específico
    if (error.message && error.message.includes('relation "usuarios" does not exist')) {
      return res.status(500).json({ 
        error: 'Sistema de usuários não configurado. Execute o script de inicialização do banco.' 
      });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login - Fazer login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    const result = await query(
      'SELECT id, nome, email, password_hash, created_at FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }

    const user = result.rows[0];

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    
    // Se a tabela 'usuarios' não existir, retornar erro específico
    if (error.message && error.message.includes('relation "usuarios" does not exist')) {
      return res.status(500).json({ 
        error: 'Sistema de usuários não configurado. Execute o script de inicialização do banco.' 
      });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/profile - Obter perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nome, email, created_at FROM usuarios WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/auth/profile - Atualizar perfil
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const result = await query(`
      UPDATE usuarios 
      SET nome = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, nome, email, created_at
    `, [nome.trim(), req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export { authenticateToken };
export default router;