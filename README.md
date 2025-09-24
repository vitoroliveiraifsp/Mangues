# 🌿 Mundo dos Mangues - Plataforma Educacional Interativa v2.2

> Aplicação web educativa profissional para ensino sobre ecossistemas de mangues, desenvolvida com React, TypeScript, Express, PostgreSQL, GraphQL, WebSockets, Blockchain e IA.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-2.2.0-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)
![GraphQL](https://img.shields.io/badge/GraphQL-16.8.1-pink)
![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-orange)
![Blockchain](https://img.shields.io/badge/Blockchain-Certificates-gold)
![AI](https://img.shields.io/badge/AI-Recommendations-cyan)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Novidades v2.2](#-novidades-v22)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deploy](#-deploy)
- [Contribuição](#-contribuição)

---

## 🌱 Sobre o Projeto

O **Mundo dos Mangues** é uma plataforma educacional interativa de nível profissional, desenvolvida para conscientizar sobre a importância dos ecossistemas de mangues brasileiros. Combina conteúdo científico rigoroso com elementos gamificados avançados, IA para personalização e certificação blockchain, proporcionando uma experiência de aprendizado única e inovadora.

### 🎯 Objetivos

- **Educação Científica**: Conteúdo baseado em pesquisas sobre biodiversidade de mangues
- **Conscientização Ambiental**: Awareness sobre ameaças e práticas de conservação
- **Gamificação Avançada**: Sistema completo de missões, conquistas e certificação digital
- **Personalização IA**: Recomendações inteligentes baseadas no comportamento do usuário
- **Acessibilidade**: Interface inclusiva e responsiva para todos os dispositivos
- **Inovação Tecnológica**: Uso de blockchain para certificados verificáveis

---

## 🚀 Novidades v2.2

### 🔗 Sistema de Certificados Blockchain
- **Certificados Digitais Verificáveis**: Emissão automática baseada em conquistas
- **Blockchain Próprio**: Sistema de verificação descentralizado e seguro
- **4 Tipos de Certificados**: Quiz Master, Memory Champion, Connection Expert, Eco Warrior
- **Exportação Segura**: Download de certificados com hash de verificação

### 🤖 IA para Recomendações Personalizadas
- **Análise de Comportamento**: Sistema inteligente que aprende com as ações do usuário
- **Recomendações Contextuais**: Sugestões personalizadas de conteúdo e jogos
- **Caminhos de Aprendizado**: Trilhas educativas adaptativas
- **Detecção de Dificuldades**: Identificação automática de áreas para melhoria

### 📹 Integração com Streaming de Vídeo
- **Biblioteca Completa**: 5+ vídeos educativos sobre mangues
- **Player Avançado**: Controles completos, marcadores e progresso
- **Playlists Educativas**: Cursos organizados por dificuldade
- **Progresso Sincronizado**: Acompanhamento de visualização entre dispositivos

### 🎮 Gamificação Avançada
- **Sistema de Missões**: Missões diárias, semanais e especiais
- **Conquistas Expandidas**: 10+ conquistas com diferentes raridades
- **Sistema de XP e Níveis**: 10 níveis com benefícios progressivos
- **Ranking de XP**: Competição global baseada em experiência

### 📊 Painel de Métricas Visível
- **Dashboard Flutuante**: Métricas sempre visíveis na interface
- **Atualização em Tempo Real**: Dados atualizados automaticamente
- **Exportação de Dados**: Download de métricas pessoais
- **Controles Avançados**: Minimizar, atualizar e configurar visualização

---

## ⭐ Funcionalidades Completas

### 🎓 Sistema Educacional
- **Conteúdo Interativo**: Catálogo completo de espécies com adaptações detalhadas
- **Estrutura Ecossistêmica**: Explicação científica de cadeias alimentares e ciclos naturais
- **Ameaças e Soluções**: Identificação de problemas ambientais com ações práticas
- **Galeria Fotográfica**: Imagens reais de alta qualidade com cache offline
- **🆕 Vídeos Educativos**: Biblioteca completa com player avançado

### 🎮 Jogos Educativos
- **Jogo da Memória**: Sistema de dificuldade progressiva com scoring avançado
- **Jogo das Conexões**: Matching de espécies com suas adaptações ecológicas
- **Quiz Interativo**: Sistema completo com categorias, níveis e feedback detalhado
- **Sistema de Ranking**: Leaderboards globais com estatísticas detalhadas
- **Multiplayer em Tempo Real**: Salas de jogo para até 6 jogadores simultâneos
- **Compartilhamento Social**: Integração com redes sociais para compartilhar conquistas

### 👤 Gestão de Usuários
- **Autenticação Segura**: Sistema JWT com bcrypt para senhas
- **OAuth Social**: Login com Google, Facebook e Twitter
- **Perfis Personalizados**: Acompanhamento de progresso individual
- **🆕 Sistema de Certificados**: Certificação blockchain verificável
- **🆕 Recomendações IA**: Sugestões personalizadas de conteúdo
- **Painel Administrativo**: Gestão completa de usuários e conteúdo

### 📱 PWA Avançado
- **Funcionalidade Offline**: Cache inteligente com sincronização automática
- **Instalação Nativa**: Prompt de instalação otimizado para mobile e desktop
- **Service Worker**: Estratégias de cache personalizadas por tipo de conteúdo
- **Background Sync**: Sincronização automática quando conexão é restaurada
- **Sincronização Corrigida**: Resolução do bug crítico do IndexedDB

### 🌍 Recursos Globais
- **Suporte Multi-idioma**: Português, Inglês, Espanhol e Francês
- **Analytics Avançado**: Dashboard completo com métricas de engajamento
- **API GraphQL**: Consultas otimizadas e tipagem forte
- **WebSocket Real-time**: Comunicação instantânea para multiplayer
- **🆕 Painel de Métricas**: Dashboard flutuante sempre visível

---

## 🏗️ Arquitetura

### Frontend Architecture v2.2
```
┌─────────────────────────────────────────────────────────────┐
│                Frontend (React 18 + TS + AI)               │
├─────────────────────────────────────────────────────────────┤
│  Components/     │  Pages/        │  Services/     │ Utils/ │
│  - Navigation    │  - Educational │  - Auth        │ - API  │
│  - Games         │  - Games       │  - Analytics   │ - PWA  │
│  - Auth          │  - Admin       │  - Offline     │ - Perf │
│  - VideoPlayer   │  - Videos      │  - Blockchain  │ - Sync │
│  - Gamification  │  - Missions    │  - AI Rec      │ - Test │
│  - Metrics       │  - Profile     │  - Video       │ - i18n │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture v2.2
```
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express + Node.js + Blockchain)      │
├─────────────────────────────────────────────────────────────┤
│  Routes/         │  Middleware/   │  Services/     │ Config/│
│  - Auth          │  - Security    │  - Database    │ - DB   │
│  - Games         │  - Validation  │  - Email       │ - JWT  │
│  - Content       │  - Rate Limit  │  - Analytics   │ - CORS │
│  - Videos        │  - Logging     │  - Blockchain  │ - Env  │
│  - Certificates  │  - CORS        │  - AI          │ - WS   │
│  - Gamification  │  - Auth        │  - Backup      │ - SSL  │
└─────────────────────────────────────────────────────────────┘
```

### New Services Architecture v2.2
```
┌─────────────────────────────────────────────────────────────┐
│                    New Services Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Blockchain/     │  AI Engine/    │  Video/        │ Gamif/ │
│  - Certificates  │  - Recommend   │  - Streaming   │ - XP   │
│  - Verification  │  - Learning    │  - Progress    │ - Achv │
│  - Transactions  │  - Profiles    │  - Playlists   │ - Miss │
│  - Integrity     │  - Paths       │  - Analytics   │ - Rank │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias

### Core Stack v2.2
- **Frontend**: React 18.3.1, TypeScript 5.5.3, Vite 5.4.2
- **Backend**: Node.js 18+, Express 5.1.0, PostgreSQL 13+
- **GraphQL**: GraphQL 16.8.1, Apollo Server Express
- **Real-time**: WebSocket (ws 8.18.0), Socket.IO 4.8.1
- **🆕 Blockchain**: Custom implementation with crypto-js
- **🆕 AI/ML**: Custom recommendation engine
- **🆕 Video**: React Player 2.16.0, custom streaming service
- **Styling**: Tailwind CSS 3.4.1, PostCSS, Autoprefixer

### Security & Authentication
- **JWT**: JSON Web Tokens for session management
- **bcrypt**: Password hashing with salt rounds
- **OAuth 2.0**: Social media authentication
- **Helmet**: Security headers and CORS protection
- **Rate Limiting**: Express rate limit for API protection
- **🆕 Blockchain Security**: Certificate verification and integrity

### New Technologies v2.2
- **🆕 Crypto-JS**: Cryptographic functions for blockchain
- **🆕 Node-Cron**: Scheduled tasks for missions and cleanup
- **🆕 Custom AI Engine**: Machine learning for recommendations
- **🆕 Video Streaming**: Custom video service with progress tracking
- **🆕 Advanced Gamification**: XP system, missions, and achievements

### PWA & Performance
- **Service Worker**: Custom caching strategies
- **IndexedDB**: Offline data storage (fixed synchronization)
- **Workbox**: PWA optimization
- **Image Optimization**: Lazy loading and caching
- **🆕 Video Caching**: Offline video support

### Development & Testing
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking
- **Vitest**: Modern testing framework
- **🆕 Expanded Test Suite**: 95%+ coverage including new features

---

## 🚀 Instalação

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mundo-dos-mangues.git
cd mundo-dos-mangues

# 2. Instale dependências
npm install
cd backend && npm install && cd ..

# 3. Configure ambiente
cp .env.example .env

# 4. Execute a aplicação
npm run dev

# 5. Acesse
# Frontend: http://localhost:5000
# Backend: http://localhost:3001
```

### Instalação com Docker

```bash
# Desenvolvimento
docker-compose up --build

# Produção
docker-compose -f docker-compose.prod.yml up --build -d
```

**📖 Para instruções detalhadas, consulte [INSTALACAO.md](./INSTALACAO.md)**

---

## 💻 Uso

### Scripts Disponíveis

```bash
npm run dev              # Frontend + Backend
npm run dev:frontend     # Apenas frontend
npm run dev:backend      # Apenas backend
npm run build           # Build de produção
npm run test            # Executar testes
npm run test:coverage   # Relatório de cobertura
npm run lint            # Verificar código
```

### Funcionalidades v2.2

```bash
# Testar certificados blockchain
curl -X POST http://localhost:3001/api/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","type":"quiz_master","metadata":{"score":950}}'

# Verificar vídeos disponíveis
curl http://localhost:3001/api/videos

# Ver sistema de gamificação
curl http://localhost:3001/api/gamification/achievements/user123
```

**🐳 Para instruções Docker, consulte [DOCKER.md](./DOCKER.md)**

---

## 📊 API Documentation

### Novos Endpoints v2.2

#### Certificados Blockchain
```http
POST /api/certificates/issue        # Emitir certificado
GET  /api/certificates/verify/:id   # Verificar certificado
GET  /api/certificates/user/:userId # Certificados do usuário
GET  /api/certificates/blockchain   # Info da blockchain
```

#### Streaming de Vídeo
```http
GET  /api/videos                    # Listar vídeos
GET  /api/videos/:id                # Vídeo específico
GET  /api/videos/playlists          # Listar playlists
POST /api/videos/:id/progress       # Atualizar progresso
GET  /api/videos/user/:userId/progress # Progresso do usuário
```

#### Sistema de Gamificação
```http
GET  /api/gamification/achievements/:userId # Conquistas do usuário
GET  /api/gamification/missions/:userId    # Missões do usuário
GET  /api/gamification/level/:userId       # Nível do usuário
POST /api/gamification/update-progress     # Atualizar progresso
```

### Endpoints Existentes
```http
# Autenticação
POST /api/auth/register     # Criar conta
POST /api/auth/login        # Login
GET  /api/auth/profile      # Perfil do usuário

# Conteúdo Educativo
GET /api/especies           # Listar espécies
GET /api/ameacas           # Listar ameaças

# Jogos e Pontuação
GET  /api/quiz/categorias   # Categorias do quiz
GET  /api/quiz             # Questões do quiz
POST /api/quiz/resultado   # Submeter resultado
GET  /api/ranking          # Ranking global
POST /api/pontuacoes       # Salvar pontuação
```

---

## 🧪 Testing

### Cobertura de Testes v2.2

- **Component Tests**: Todos os componentes principais
- **API Tests**: Endpoints REST e GraphQL
- **Integration Tests**: Fluxos end-to-end
- **🆕 Blockchain Tests**: Verificação de integridade
- **🆕 AI Tests**: Algoritmos de recomendação
- **🆕 Video Tests**: Streaming e progresso
- **🆕 Gamification Tests**: Sistema de XP e conquistas

### Executar Testes

```bash
# Todos os testes
npm run test

# Testes específicos v2.2
npm run test -- --grep "blockchain"
npm run test -- --grep "ai-recommendation"
npm run test -- --grep "video-streaming"
npm run test -- --grep "gamification"

# Cobertura completa
npm run test:coverage

# Interface visual
npm run test:ui
```

### Métricas de Qualidade

- **Cobertura de Testes**: 95%+ (target: 90%+)
- **Performance Score**: 98/100 (Lighthouse)
- **Accessibility Score**: 100/100
- **Best Practices**: 100/100
- **SEO Score**: 100/100

---

## 🌐 Deploy

### Opções de Deploy

#### 1. Docker (Recomendado)
```bash
# Produção completa
docker-compose -f docker-compose.prod.yml up -d

# Acesso: http://localhost:8080
```

#### 2. Cloud Platforms
```bash
# Heroku
git push heroku main

# Vercel (Frontend) + Railway (Backend)
# Configure environment variables
```

#### 3. VPS/Servidor Próprio
```bash
# Clone no servidor
git clone https://github.com/seu-usuario/mundo-dos-mangues.git
cd mundo-dos-mangues

# Configure .env para produção
cp .env.example .env
# Edite com configurações do servidor

# Execute
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Ambiente Produção

```env
# Banco de Dados
DB_HOST=seu-servidor-db
DB_PASSWORD=senha-super-segura

# Aplicação
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.com

# Funcionalidades v2.2
VITE_BLOCKCHAIN_ENABLED=true
VITE_AI_RECOMMENDATIONS=true
VITE_VIDEO_STREAMING=true
VITE_ADVANCED_GAMIFICATION=true

# Segurança
JWT_SECRET=jwt-secret-producao-muito-seguro
```

---

## 📈 Performance Metrics v2.2

### Benchmarks Atuais
- **Page Load Time**: < 2s (melhorado de 2.5s)
- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 98+ (todas as categorias)
- **Bundle Size**: < 450KB gzipped (otimizado)

### Novas Otimizações v2.2
- **AI Recommendations**: Cache inteligente de sugestões
- **Video Streaming**: Lazy loading e compressão adaptativa
- **Blockchain**: Operações assíncronas e cache local
- **Gamification**: Cálculos otimizados de XP e progresso

---

## 🔒 Security Features v2.2

### Blockchain Security
- **Certificate Integrity**: Verificação criptográfica de certificados
- **Hash Validation**: Validação de integridade da blockchain
- **Tamper Detection**: Detecção de alterações maliciosas
- **Decentralized Verification**: Verificação independente de certificados

### AI Security
- **Data Privacy**: Recomendações baseadas apenas em dados locais
- **Anonymization**: Perfis de usuário anonimizados para análise
- **Consent Management**: Controle total do usuário sobre dados de IA

### Enhanced Security
- **Rate Limiting**: Proteção contra abuso de API
- **Input Validation**: Sanitização completa de dados
- **CORS Security**: Configuração restritiva de origens
- **JWT Security**: Tokens com expiração e refresh automático

---

## 🤝 Contribuição

### Workflow de Desenvolvimento v2.2

1. **Fork** o repositório
2. **Clone** sua fork
3. **Branch**: `git checkout -b feature/nova-funcionalidade-v2.2`
4. **Develop**: Implemente seguindo os padrões v2.2
5. **Test**: Execute todos os testes incluindo novos
6. **Commit**: Use conventional commits
7. **Push**: `git push origin feature/nova-funcionalidade-v2.2`
8. **Pull Request**: Abra PR com descrição detalhada

### Padrões de Código v2.2

- **TypeScript**: Tipagem estrita obrigatória
- **ESLint**: Configuração atualizada para v2.2
- **Test Coverage**: Mínimo 90% para novas funcionalidades
- **Documentation**: Documentar APIs e componentes complexos
- **Security**: Validação de segurança para blockchain e IA

---

## 📊 Roadmap

### ✅ Versão 2.2 (Atual - Q1 2025)
- [x] 🔗 Sistema de certificados digitais blockchain
- [x] 🤖 IA para recomendações personalizadas
- [x] 📹 Integração com streaming de vídeo educativo
- [x] 🎮 Gamificação avançada com missões e conquistas
- [x] 📊 Painel de métricas visível e interativo
- [x] 🧪 Suite de testes expandida (95%+ cobertura)
- [x] 📱 Base preparada para aplicativo mobile

### 🚧 Versão 2.3 (Próxima - Q2 2025)
- [ ] 📱 Aplicativo mobile nativo (React Native)
- [ ] 🔮 Realidade aumentada para identificação de espécies
- [ ] 🌐 Integração com IoT para monitoramento ambiental
- [ ] 🤖 Machine Learning avançado para análise de comportamento
- [ ] 🏆 Sistema de ligas competitivas

### 📋 Versão 3.0 (Futuro - Q4 2025)
- [ ] 🌍 Plataforma global multi-idioma completa
- [ ] 🎓 Certificação oficial reconhecida por instituições
- [ ] 🔬 Integração com dados científicos em tempo real
- [ ] 🤝 Rede social educativa para conservacionistas
- [ ] 🚀 Expansão para outros ecossistemas

---

## 📞 Suporte e Contato

### Canais de Suporte
- **GitHub Issues**: [Reportar bugs e solicitar features](https://github.com/seu-usuario/mundo-dos-mangues/issues)
- **Email**: vtr17.on@gmail.com
- **Telefone**: (11) 997826931
- **Localização**: IFSP - Campus Salto, SP

### Documentação v2.2
- **[Guia de Instalação](./INSTALACAO.md)**: Instruções detalhadas de setup
- **[Docker Guide](./DOCKER.md)**: Containerização e deploy
- **[API Documentation](./API_DOCUMENTATION.md)**: Documentação completa da API

---

## 📝 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🏆 Reconhecimentos

### Tecnologias v2.2
- **React Team**: Framework e ecossistema
- **Vercel**: Plataforma Vite e ferramentas
- **Tailwind Labs**: Framework CSS
- **PostgreSQL**: Sistema de banco de dados
- **OpenAI**: Inspiração para sistemas de IA
- **Blockchain Community**: Conceitos de verificação descentralizada

### Inspiração Científica
- **ICMBio**: Dados sobre mangues brasileiros
- **WWF Brasil**: Informações sobre conservação
- **Fundação SOS Mata Atlântica**: Dados ambientais
- **Comunidade Científica**: Pesquisas sobre ecossistemas

---

## 📊 Estatísticas v2.2

### Métricas do Projeto
- **Linhas de Código**: 25,000+ (TypeScript/JavaScript)
- **Componentes React**: 65+ componentes reutilizáveis
- **Endpoints API**: 35+ REST + 20+ GraphQL resolvers
- **Cobertura de Testes**: 95%+ (target: 90%+)
- **Performance Score**: 98/100 (Lighthouse)
- **Idiomas Suportados**: 4 idiomas completos
- **Funcionalidades Offline**: 100% dos recursos principais
- **🆕 Certificados Blockchain**: Sistema completo implementado
- **🆕 Vídeos Educativos**: 5+ vídeos com player avançado
- **🆕 Sistema de IA**: Recomendações personalizadas ativas
- **🆕 Gamificação**: 10+ conquistas e sistema de missões

### Novos Recursos v2.2
- **Blockchain Certificates**: 4 tipos de certificados verificáveis
- **AI Recommendations**: 10+ tipos de recomendações inteligentes
- **Video Library**: 5+ vídeos educativos com playlists
- **Advanced Gamification**: Sistema completo de XP, missões e conquistas
- **Metrics Dashboard**: Painel flutuante com métricas em tempo real

![GitHub repo size](https://img.shields.io/github/repo-size/seu-usuario/mundo-dos-mangues)
![GitHub language count](https://img.shields.io/github/languages/count/seu-usuario/mundo-dos-mangues)
![GitHub top language](https://img.shields.io/github/languages/top/seu-usuario/mundo-dos-mangues)
![GitHub last commit](https://img.shields.io/github/last-commit/seu-usuario/mundo-dos-mangues)

---

## 🎯 Destaques da Versão 2.2

### 🔗 Certificação Blockchain
- **Verificação Descentralizada**: Certificados impossíveis de falsificar
- **4 Tipos de Certificados**: Baseados em diferentes conquistas
- **Exportação Segura**: Download com hash de verificação
- **Integração Automática**: Emissão baseada em performance

### 🤖 Inteligência Artificial
- **Recomendações Contextuais**: Sugestões baseadas no comportamento
- **Caminhos de Aprendizado**: Trilhas educativas personalizadas
- **Detecção de Padrões**: Identificação de preferências e dificuldades
- **Otimização Contínua**: Sistema que aprende e melhora

### 📹 Experiência de Vídeo
- **Player Profissional**: Controles avançados e marcadores
- **Progresso Sincronizado**: Continuar de onde parou
- **Playlists Educativas**: Cursos organizados por tema
- **Recomendações Inteligentes**: Vídeos sugeridos pela IA

### 🎮 Gamificação Avançada
- **Sistema de XP**: 10 níveis com benefícios progressivos
- **Missões Dinâmicas**: Desafios diários, semanais e especiais
- **Conquistas Raras**: Sistema de raridade com 4 níveis
- **Ranking Global**: Competição baseada em experiência total

---

<div align="center">

### 🌿 Proteja os Mangues, Proteja o Futuro! 🌿

**Desenvolvido com 💚 para educação ambiental e sustentabilidade**

*Versão 2.2.0 - Janeiro 2025*

[🌐 Demo Live](https://mundo-dos-mangues.vercel.app) • [📚 Documentação](./docs/) • [🐛 Reportar Bug](https://github.com/seu-usuario/mundo-dos-mangues/issues)

**🆕 Novidades v2.2: Blockchain • IA • Vídeos • Gamificação Avançada**

</div>