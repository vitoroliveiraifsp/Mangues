import pkg from 'pg';
const { Pool } = pkg;

// Configuração do banco PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mangues_quiz',
  password: process.env.DB_PASSWORD || '17112007',
  port: process.env.DB_PORT || 5432,
  
  // Configurações de conexão
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite para conexões inativas
  connectionTimeoutMillis: 2000, // tempo limite para estabelecer conexão
  
  // SSL para produção
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Testar conexão
pool.on('connect', () => {
  console.log('🐘 Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no PostgreSQL:', err);
});

// Função para executar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executada:', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
};

// Função para transações
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Função para verificar saúde do banco
export const healthCheck = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version,
      connections: pool.totalCount
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Função para inicializar o banco (executar migrations)
export const initDatabase = async () => {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // Verificar se as tabelas existem
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('quiz_categorias', 'quiz_questoes', 'pontuacoes')
    `);
    
    if (tablesCheck.rows.length === 0) {
      console.log('⚠️  Tabelas não encontradas. Execute o script init.sql primeiro.');
      return false;
    }
    
    console.log('✅ Banco de dados inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    return false;
  }
};

export default pool;