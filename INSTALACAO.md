# 🚀 Guia de Instalação - Mundo dos Mangues v2.2

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.0.0 ou superior
- **npm** 8.0.0 ou superior  
- **PostgreSQL** 13.0 ou superior (opcional, funciona sem banco)
- **Git** para clonar o repositório

### Verificar Versões

```bash
node --version    # Deve ser v18.0.0+
npm --version     # Deve ser 8.0.0+
psql --version    # Deve ser 13.0+ (opcional)
```

---

## 🎯 Instalação Rápida (Recomendada)

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/mundo-dos-mangues.git
cd mundo-dos-mangues
```

### 2. Instalar Dependências

```bash
# Instalar dependências do frontend
npm install

# Instalar dependências do backend
cd backend
npm install
cd ..
```

### 3. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env na raiz do projeto
cp .env.example .env

# Editar o arquivo .env com suas configurações
# Valores padrão funcionam para desenvolvimento local
```

### 4. Executar a Aplicação

```bash
# Executar frontend e backend simultaneamente
npm run dev

# OU executar separadamente:
# Terminal 1 (Backend):
npm run dev:backend

# Terminal 2 (Frontend):  
npm run dev:frontend
```

### 5. Acessar a Aplicação

- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🐳 Instalação com Docker (Alternativa)

### Pré-requisitos Docker
- Docker 20.10.0+
- Docker Compose 2.0+

### Execução

```bash
# Desenvolvimento
docker-compose up --build

# Produção
docker-compose -f docker-compose.prod.yml up --build -d
```

### Acessos Docker
- **Desenvolvimento**: http://localhost:5000
- **Produção**: http://localhost:8080

---

## 🗄️ Configuração do Banco de Dados (Opcional)

A aplicação funciona sem banco de dados usando dados em memória. Para persistência completa:

### PostgreSQL Local

```bash
# 1. Criar banco de dados
createdb mangues_quiz

# 2. Executar script de inicialização
psql -d mangues_quiz -f backend/database/init.sql

# 3. Configurar .env
echo "DB_PASSWORD=sua_senha_aqui" >> .env
```

### PostgreSQL com Docker

```bash
# Executar PostgreSQL em container
docker run --name postgres-mangues \
  -e POSTGRES_DB=mangues_quiz \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:13

# Aguardar inicialização
sleep 10

# Executar script de inicialização
docker exec -i postgres-mangues psql -U postgres -d mangues_quiz < backend/database/init.sql
```

---

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente Completas

```env
# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mangues_quiz
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Aplicação
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5000

# Autenticação
JWT_SECRET=seu-jwt-secret-super-seguro

# Frontend
VITE_API_URL=http://localhost:3001

# Funcionalidades v2.2
VITE_BLOCKCHAIN_ENABLED=true
VITE_AI_RECOMMENDATIONS=true
VITE_VIDEO_STREAMING=true
VITE_ADVANCED_GAMIFICATION=true

# Integrações Sociais (Opcional)
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
VITE_FACEBOOK_APP_ID=seu_facebook_app_id
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Frontend + Backend
npm run dev:frontend     # Apenas frontend
npm run dev:backend      # Apenas backend

# Produção
npm run build           # Build do frontend
npm run preview         # Preview do build

# Testes
npm run test            # Executar testes
npm run test:coverage   # Relatório de cobertura
npm run test:ui         # Interface de testes

# Banco de Dados
npm run db:init         # Inicializar banco
npm run db:reset        # Resetar banco

# Utilitários
npm run lint            # Verificar código
npm run setup           # Instalação completa
```

---

## 🔧 Solução de Problemas

### Erro: "ERR_CONNECTION_REFUSED"

```bash
# Verificar se o backend está rodando
curl http://localhost:3001/api/health

# Se não estiver, iniciar o backend
npm run dev:backend
```

### Erro: "Module not found"

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Para o backend também
cd backend
rm -rf node_modules package-lock.json  
npm install
```

### Erro: "Port already in use"

```bash
# Verificar processos usando as portas
lsof -i :5000  # Frontend
lsof -i :3001  # Backend

# Matar processos se necessário
kill -9 <PID>
```

### Banco de Dados não Conecta

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Ou com Docker
docker ps | grep postgres

# Testar conexão
psql -h localhost -U postgres -d mangues_quiz -c "SELECT 1;"
```

### Problemas de Permissão

```bash
# Corrigir permissões (Linux/Mac)
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh

# Limpar cache npm
npm cache clean --force
```

---

## 🌐 Configuração para Produção

### 1. Variáveis de Ambiente de Produção

```env
NODE_ENV=production
DB_HOST=seu-servidor-db
DB_PASSWORD=senha-super-segura
JWT_SECRET=jwt-secret-producao-muito-seguro
CORS_ORIGIN=https://seu-dominio.com
```

### 2. Build de Produção

```bash
# Build do frontend
npm run build

# Verificar build
npm run preview
```

### 3. Deploy com PM2

```bash
# Instalar PM2
npm install -g pm2

# Executar backend em produção
cd backend
pm2 start server.js --name "mangues-backend"

# Servir frontend com nginx ou servidor estático
```

---

## 📊 Funcionalidades v2.2

### Novas Funcionalidades Incluídas

- ✅ **Sistema de Certificados Blockchain**: Certificados digitais verificáveis
- ✅ **IA para Recomendações**: Sistema inteligente de recomendações personalizadas  
- ✅ **Streaming de Vídeo**: Biblioteca completa de vídeos educativos
- ✅ **Gamificação Avançada**: Missões, conquistas e sistema de XP
- ✅ **Painel de Métricas**: Dashboard em tempo real sempre visível

### Como Ativar as Funcionalidades

```bash
# Todas as funcionalidades estão ativas por padrão
# Para desativar alguma, edite o .env:

VITE_BLOCKCHAIN_ENABLED=false      # Desativar certificados
VITE_AI_RECOMMENDATIONS=false     # Desativar IA
VITE_VIDEO_STREAMING=false        # Desativar vídeos
VITE_ADVANCED_GAMIFICATION=false  # Desativar gamificação
```

---

## 🧪 Executar Testes

```bash
# Testes unitários
npm run test

# Testes com interface visual
npm run test:ui

# Cobertura de testes
npm run test:coverage

# Testes específicos
npm run test -- --grep "blockchain"
npm run test -- --grep "gamification"
```

---

## 📱 Preparação para Mobile (React Native)

### Estrutura Base Criada

O projeto já inclui a estrutura base para migração para React Native:

```bash
# Estrutura preparada em:
src/
├── services/          # Serviços reutilizáveis
├── utils/            # Utilitários compartilhados  
├── hooks/            # Hooks customizados
└── components/       # Componentes modulares
```

### Próximos Passos para Mobile

1. **Instalar React Native CLI**
2. **Criar projeto React Native**
3. **Migrar serviços e hooks**
4. **Adaptar componentes para mobile**

---

## 🆘 Suporte

### Canais de Ajuda

- **GitHub Issues**: [Reportar problemas](https://github.com/seu-usuario/mundo-dos-mangues/issues)
- **Email**: vtr17.on@gmail.com
- **Telefone**: (11) 997826931

### Logs Úteis

```bash
# Ver logs do backend
npm run dev:backend

# Ver logs do frontend  
npm run dev:frontend

# Ver logs do Docker
docker-compose logs -f
```

### Arquivos de Log

- **Backend**: Console do terminal
- **Frontend**: Console do navegador (F12)
- **Docker**: `docker-compose logs`

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Backend funcionando (http://localhost:3001/api/health)
- [ ] Frontend funcionando (http://localhost:5000)
- [ ] Banco de dados configurado (opcional)
- [ ] Testes passando (`npm run test`)
- [ ] Funcionalidades v2.2 ativas

---

## 🎉 Próximos Passos

Após a instalação bem-sucedida:

1. **Explore a aplicação** em http://localhost:5000
2. **Teste as novas funcionalidades** v2.2
3. **Execute os testes** para verificar integridade
4. **Consulte a documentação** completa no README.md
5. **Configure para produção** se necessário

---

*Instalação atualizada para v2.2 - Janeiro 2025*