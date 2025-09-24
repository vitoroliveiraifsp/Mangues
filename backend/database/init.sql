-- Script de inicialização do banco de dados - Mundo dos Mangues
-- Execute este arquivo no PostgreSQL para criar todas as tabelas e dados iniciais

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de categorias do quiz
CREATE TABLE IF NOT EXISTS quiz_categorias (
  id VARCHAR(50) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de questões do quiz
CREATE TABLE IF NOT EXISTS quiz_questoes (
  id SERIAL PRIMARY KEY,
  categoria_id VARCHAR(50) REFERENCES quiz_categorias(id),
  pergunta TEXT NOT NULL,
  opcoes TEXT[] NOT NULL,
  resposta_correta INTEGER NOT NULL CHECK (resposta_correta >= 0 AND resposta_correta <= 3),
  explicacao TEXT,
  dificuldade VARCHAR(20) DEFAULT 'facil' CHECK (dificuldade IN ('facil', 'medio', 'dificil')),
  pontos INTEGER DEFAULT 10,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pontuações
CREATE TABLE IF NOT EXISTS pontuacoes (
  id SERIAL PRIMARY KEY,
  nome_jogador VARCHAR(100) NOT NULL,
  jogo VARCHAR(50) NOT NULL,
  pontuacao INTEGER NOT NULL DEFAULT 0,
  categoria VARCHAR(50),
  dificuldade VARCHAR(20),
  detalhes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários (para futuras implementações)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de resultados detalhados do quiz
CREATE TABLE IF NOT EXISTS quiz_resultados (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  nome_jogador VARCHAR(100),
  categoria VARCHAR(50),
  pontuacao_total INTEGER NOT NULL,
  acertos INTEGER NOT NULL,
  total_questoes INTEGER NOT NULL,
  tempo_total INTEGER, -- em segundos
  detalhes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_quiz_questoes_categoria ON quiz_questoes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questoes_dificuldade ON quiz_questoes(dificuldade);
CREATE INDEX IF NOT EXISTS idx_pontuacoes_jogo ON pontuacoes(jogo);
CREATE INDEX IF NOT EXISTS idx_pontuacoes_pontuacao ON pontuacoes(pontuacao DESC);
CREATE INDEX IF NOT EXISTS idx_pontuacoes_created_at ON pontuacoes(created_at DESC);

-- Inserir categorias iniciais
INSERT INTO quiz_categorias (id, nome, emoji) VALUES
  ('biodiversidade', 'Vida no Mangue', '🐾'),
  ('estrutura', 'Como Funciona', '🔄'),
  ('conservacao', 'Vamos Cuidar', '🌍')
ON CONFLICT (id) DO NOTHING;

-- Inserir questões iniciais
INSERT INTO quiz_questoes (categoria_id, pergunta, opcoes, resposta_correta, explicacao, dificuldade, pontos) VALUES
  ('biodiversidade', 'Qual animal do mangue consegue respirar fora da água?', 
   ARRAY['Caranguejo-uçá', 'Peixe-boi', 'Garça-branca', 'Camarão-rosa'], 
   0, 'O caranguejo-uçá tem brânquias modificadas que funcionam como pulmões primitivos, permitindo que respire ar atmosférico por até 6 horas!', 
   'facil', 10),

  ('biodiversidade', 'Que árvore consegue tirar o sal da água do mar?', 
   ARRAY['Eucalipto', 'Mangue-vermelho', 'Ipê-amarelo', 'Pau-brasil'], 
   1, 'O mangue-vermelho possui folhas especiais com glândulas que eliminam o excesso de sal, funcionando como filtros naturais!', 
   'facil', 10),

  ('estrutura', 'O que acontece durante a maré alta no mangue?', 
   ARRAY['Todos os animais saem para comer', 'A água cobre quase tudo', 'Os caranguejos fazem buracos', 'As plantas produzem flores'], 
   1, 'Durante a maré alta, a água do mar entra no mangue e cobre quase toda a área, permitindo que os peixes nadem em lugares novos!', 
   'medio', 15),

  ('estrutura', 'Por que as marés são importantes para o mangue?', 
   ARRAY['Só para os peixes nadarem', 'Trazem comida, limpam e ajudam plantas', 'Para fazer barulho', 'Apenas para encher de água'], 
   1, 'As marés trazem alimento, limpam o mangue levando o lixo embora, e ajudam as sementes das plantas a encontrarem novos lugares para crescer!', 
   'medio', 15),

  ('conservacao', 'O que podemos fazer para proteger os mangues?', 
   ARRAY['Jogar lixo na água', 'Cortar todas as árvores', 'Não jogar lixo e plantar mudas', 'Pescar todos os peixes'], 
   2, 'Protegemos os mangues não jogando lixo na natureza, plantando mudas de árvores nativas e ensinando outras pessoas sobre sua importância!', 
   'facil', 10),

  ('conservacao', 'Qual é o maior problema causado pela poluição da água?', 
   ARRAY['A água fica mais bonita', 'Os animais ficam doentes ou morrem', 'Os peixes ficam mais rápidos', 'As plantas crescem mais'], 
   1, 'A poluição da água com lixo e produtos químicos deixa a água suja e perigosa, fazendo com que peixes, caranguejos e outros animais fiquem doentes ou morram.', 
   'medio', 15),

  ('biodiversidade', 'Qual animal é conhecido como "berçário do mar"?', 
   ARRAY['Tubarão', 'Peixes que nascem no mangue', 'Baleia', 'Polvo'], 
   1, 'O mangue é chamado de "berçário do mar" porque muitos peixes nascem e crescem lá antes de ir para o oceano quando ficam adultos!', 
   'dificil', 20),

  ('estrutura', 'Como os caranguejos ajudam o mangue a "respirar"?', 
   ARRAY['Fazendo buracos na lama', 'Nadando muito rápido', 'Comendo plantas', 'Subindo nas árvores'], 
   0, 'Os caranguejos fazem buracos profundos na lama que ajudam a oxigenar o solo do mangue, permitindo que as raízes das plantas respirem melhor!', 
   'dificil', 20),

  ('conservacao', 'O que acontece quando cortamos muitas árvores do mangue?', 
   ARRAY['Nascem árvores novas rapidamente', 'Os animais perdem seu lar', 'O mangue fica mais bonito', 'Mais peixes aparecem'], 
   1, 'Quando cortamos as árvores do mangue (desmatamento), os animais perdem seu lar e não têm onde viver. Sem árvores, o mangue também não consegue proteger a costa das ondas!', 
   'medio', 15),

  ('biodiversidade', 'Qual é o superpoder do Guará?', 
   ARRAY['Voar muito alto', 'Mudar de cor', 'Espalhar sementes voando entre mangues', 'Nadar debaixo d''água'], 
   2, 'O Guará tem a plumagem vermelha viva e voa entre diferentes mangues, ajudando a espalhar sementes e conectar os ecossistemas!', 
   'dificil', 20);

-- Inserir algumas pontuações de exemplo
INSERT INTO pontuacoes (nome_jogador, jogo, pontuacao, categoria, dificuldade, detalhes) VALUES
  ('Ana Silva', 'quiz', 180, 'biodiversidade', 'facil', '{"acertos": 8, "total": 10, "tempo": 120}'),
  ('Carlos Santos', 'memoria', 850, NULL, 'medio', '{"tentativas": 12, "tempo": 45, "pares": 10}'),
  ('Maria Costa', 'conexoes', 420, NULL, NULL, '{"conexoesCorretas": 6, "tentativas": 8}'),
  ('João Oliveira', 'quiz', 240, 'estrutura', 'medio', '{"acertos": 9, "total": 10, "tempo": 95}'),
  ('Lucia Lima', 'quiz', 160, 'conservacao', 'facil', '{"acertos": 7, "total": 10, "tempo": 140}');

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_quiz_categorias_updated_at BEFORE UPDATE ON quiz_categorias 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questoes_updated_at BEFORE UPDATE ON quiz_questoes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;