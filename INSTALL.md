# Instalação Corrigida - Mundo dos Mangues PWA

## Estrutura de Pastas Corrigida

```
mundo-dos-mangues/
├── package.json (frontend)
├── backend/
│   ├── package.json (backend)
│   ├── server.js
│   ├── database/
│   │   └── init.sql
│   └── src/
│       ├── config/
│       │   └── database.js
│       ├── routes/
│       │   ├── quiz.js
│       │   ├── pontuacoes.js
│       │   ├── especies.js
│       │   ├── ameacas.js
│       │   ├── jogo.js
│       │   └── conexoes.js
│       └── data/
└── .env
```

## Passos de Instalação

### 1. Configurar Frontend (Raiz do Projeto)
```bash
# Substituir package.json da raiz pelo corrigido
npm install
```

### 2. Configurar Backend
```bash
# Criar pasta backend se não existir
mkdir -p backend

# Criar package.json do backend
cd backend
# Cole o conteúdo do backend/package.json
npm install

cd ..
```

### 3. Configurar Banco de Dados
```bash
# Opção A: PostgreSQL Local
createdb mangues_quiz
psql -d mangues_quiz -f backend/database/init.sql

# Opção B: Docker
docker run --name postgres-mangues \
  -e POSTGRES_DB=mangues_quiz \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:13

sleep 5
docker exec -i postgres-mangues psql -U postgres -d mangues_quiz < backend/database/init.sql
```

### 4. Configurar Variáveis de Ambiente
```bash
# Criar .env na raiz do projeto
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mangues_quiz
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5000
EOF
```

### 5. Executar Aplicação
```bash
# Executar frontend e backend simultaneamente
npm run dev

# OU executar separadamente:
# Terminal 1 (Backend):
npm run dev:backend

# Terminal 2 (Frontend):
npm run dev:frontend
```

## Arquivos a Substituir/Criar

### Arquivo: `package.json` (raiz)
Use o package.json corrigido do frontend

### Arquivo: `backend/package.json`
Use o package.json específico do backend

### Arquivo: `backend/server.js`
Use o server.js corrigido

### Arquivo: `backend/src/routes/quiz.js`
Use o quiz.js com async/await

### Arquivo: `backend/src/routes/pontuacoes.js`
Use o pontuacoes.js com async/await

### Arquivo: `backend/database/init.sql`
Use o script SQL completo de inicialização

## Verificação

Após a instalação, teste:

```bash
# Health check
curl http://localhost:3001/api/health

# Categorias do quiz
curl http://localhost:3001/api/quiz/categorias

# Frontend
curl http://localhost:5000
```

Deve retornar JSON válido sem erro 500.

## Troubleshooting

### Se der erro de módulo não encontrado:
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

cd backend
rm -rf node_modules package-lock.json
npm install
```

### Se banco não conectar:
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql
# ou
docker ps | grep postgres
```

### Se ainda der erro 500:
```bash
# Verificar logs do backend
npm run dev:backend

# Verificar se todas as tabelas foram criadas
psql -d mangues_quiz -c "\dt"
```

## Scripts Úteis

```bash
# Resetar banco de dados
npm run db:reset

# Instalar tudo do zero
npm run setup

# Executar apenas frontend
npm run dev:frontend

# Executar apenas backend
npm run dev:backend
```