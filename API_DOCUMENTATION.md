# 📚 Documentação da API - Mundo dos Mangues

## 🎯 Visão Geral

A API do Mundo dos Mangues fornece endpoints para quiz educativo, ranking de pontuações, conteúdo sobre mangues e funcionalidades PWA com suporte offline.

**Base URL**: `http://localhost:3001/api`  
**Versão**: 1.0.0  
**Formato**: JSON  

---

## 🔐 Autenticação

Atualmente a API é pública, sem necessidade de autenticação. Em futuras versões será implementado sistema de usuários.

---

## 📊 Endpoints Principais

### 🧠 Quiz

#### GET /api/quiz/categorias
Retorna todas as categorias disponíveis para o quiz.

**Resposta:**
```json
[
  {
    "id": "biodiversidade",
    "nome": "Vida no Mangue",
    "emoji": "🐾",
    "questoes": 15
  },
  {
    "id": "estrutura", 
    "nome": "Como Funciona",
    "emoji": "🔄",
    "questoes": 12
  },
  {
    "id": "conservacao",
    "nome": "Vamos Cuidar", 
    "emoji": "🌍",
    "questoes": 18
  }
]
```

#### GET /api/quiz
Retorna questões do quiz com filtros opcionais.

**Parâmetros:**
- `categoria` (string, opcional): Filtrar por categoria
- `dificuldade` (string, opcional): facil, medio, dificil
- `limite` (number, opcional): Número máximo de questões (padrão: 10)

**Exemplo:** `GET /api/quiz?categoria=biodiversidade&limite=5`

**Resposta:**
```json
[
  {
    "id": "uuid-questao-1",
    "categoria": "biodiversidade",
    "pergunta": "Qual animal do mangue consegue respirar fora da água?",
    "opcoes": [
      "Caranguejo-uçá",
      "Peixe-boi", 
      "Garça-branca",
      "Camarão-rosa"
    ],
    "resposta_correta": 0,
    "explicacao": "O caranguejo-uçá tem brânquias modificadas que funcionam como pulmões primitivos!",
    "dificuldade": "facil",
    "pontos": 10
  }
]
```

#### POST /api/quiz/resultado
Processa resultado do quiz e retorna pontuação detalhada.

**Body:**
```json
{
  "respostas": [
    {
      "questaoId": "uuid-questao-1",
      "respostaSelecionada": 0
    }
  ],
  "tempoTotal": 120,
  "categoria": "biodiversidade"
}
```

**Resposta:**
```json
{
  "pontuacaoTotal": 180,
  "acertos": 8,
  "totalQuestoes": 10,
  "percentualAcerto": 80,
  "tempoTotal": 120,
  "bonusTempo": 50,
  "medalha": "prata",
  "resultadoDetalhado": [
    {
      "questaoId": "uuid-questao-1",
      "correto": true,
      "respostaSelecionada": 0,
      "respostaCorreta": 0,
      "pontos": 10,
      "explicacao": "..."
    }
  ]
}
```

### 🏆 Pontuações e Ranking

#### GET /api/ranking
Retorna ranking dos melhores jogadores.

**Parâmetros:**
- `jogo` (string, opcional): quiz, memoria, conexoes
- `limite` (number, opcional): Número de resultados (padrão: 20)

**Resposta:**
```json
[
  {
    "id": "uuid-pontuacao-1",
    "nome_jogador": "Ana Silva",
    "jogo": "quiz",
    "pontuacao": 850,
    "categoria": "biodiversidade",
    "dificuldade": "medio",
    "data": "2024-01-15T10:30:00Z",
    "posicao": 1,
    "detalhes": {
      "acertos": 9,
      "total": 10,
      "tempo": 95
    }
  }
]
```

#### POST /api/pontuacoes
Salva nova pontuação do jogador.

**Body:**
```json
{
  "nomeJogador": "João Santos",
  "jogo": "quiz",
  "pontuacao": 750,
  "categoria": "conservacao",
  "dificuldade": "facil",
  "detalhes": {
    "acertos": 8,
    "total": 10,
    "tempo": 140,
    "medalha": "bronze"
  }
}
```

**Resposta:**
```json
{
  "id": "uuid-nova-pontuacao",
  "nome_jogador": "João Santos",
  "jogo": "quiz",
  "pontuacao": 750,
  "created_at": "2024-01-15T14:20:00Z"
}
```

#### GET /api/estatisticas
Retorna estatísticas gerais dos jogos.

**Resposta:**
```json
{
  "totalJogos": 1247,
  "jogosPorTipo": {
    "quiz": 523,
    "memoria": 412,
    "conexoes": 312
  },
  "pontuacaoMedia": {
    "quiz": 650,
    "memoria": 780,
    "conexoes": 420
  },
  "melhorPontuacao": 1850,
  "jogadorMaisAtivo": {
    "nome": "Maria Costa",
    "jogos": 45
  }
}
```

### 🌿 Conteúdo Educativo

#### GET /api/especies
Retorna informações sobre espécies do mangue.

**Resposta:**
```json
[
  {
    "id": "uuid-especie-1",
    "nome": "Caranguejo-uçá",
    "nome_cientifico": "Ucides cordatus",
    "descricao": "Grande caranguejo que vive nos mangues...",
    "habitat": "Buracos na lama do mangue",
    "categoria": "animal",
    "imagem_emoji": "🦀",
    "adaptacoes": [
      "Brânquias modificadas para respirar fora da água",
      "Garras fortes para cavar buracos profundos"
    ],
    "curiosidades": [
      "Pode ficar até 6 horas fora da água",
      "Seus buracos ajudam a oxigenar o solo"
    ],
    "status_conservacao": "vulneravel"
  }
]
```

#### GET /api/ameacas
Retorna informações sobre ameaças aos mangues.

**Resposta:**
```json
[
  {
    "id": "uuid-ameaca-1",
    "titulo": "Poluição da Água",
    "descricao": "Lixo e produtos químicos são jogados na água...",
    "impacto": "Animais ficam doentes ou morrem...",
    "solucoes": [
      "Não jogue lixo na natureza",
      "Use produtos de limpeza naturais"
    ],
    "gravidade": 4,
    "imagem_emoji": "🌊"
  }
]
```

### 🎮 Jogos

#### GET /api/jogo-memoria
Retorna cartas para o jogo da memória.

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Caranguejo",
    "imagem": "🦀",
    "categoria": "animal"
  },
  {
    "id": 2,
    "nome": "Mangue",
    "imagem": "🌳", 
    "categoria": "planta"
  }
]
```

#### GET /api/conexoes
Retorna dados para o jogo das conexões.

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Caranguejo-uçá",
    "imagem": "🦀",
    "categoria": "animal",
    "superpoder": "Oxigena o solo fazendo buracos na lama"
  }
]
```

### 🔧 Sistema

#### GET /api/health
Verifica saúde da API e banco de dados.

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "development",
  "database": {
    "status": "healthy",
    "connections": 5,
    "version": "PostgreSQL 13.8"
  }
}
```

---

## 🔄 Funcionalidades Offline

### Cache Strategy

A API implementa diferentes estratégias de cache:

- **Network First**: Endpoints de quiz e pontuações
- **Cache First**: Conteúdo educativo (espécies, ameaças)
- **Stale While Revalidate**: Estatísticas e ranking

### Sincronização

Quando offline, os dados são armazenados localmente e sincronizados automaticamente quando a conexão é restaurada.

**Endpoints que funcionam offline:**
- ✅ GET /api/quiz/categorias
- ✅ GET /api/quiz (questões cacheadas)
- ✅ GET /api/especies
- ✅ GET /api/ameacas
- ✅ GET /api/ranking (dados cacheados)
- ✅ POST /api/pontuacoes (sincronização posterior)

---

## 📱 PWA Integration

### Service Worker

O Service Worker intercepta requisições da API e implementa:

- Cache inteligente por tipo de conteúdo
- Fallback para dados offline
- Sincronização em background
- Notificações de status

### IndexedDB

Dados armazenados localmente:
- Questões do quiz por categoria
- Pontuações não sincronizadas
- Cache de imagens
- Configurações do usuário

---

## ⚠️ Códigos de Erro

### HTTP Status Codes

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

### Formato de Erro

```json
{
  "error": "Descrição do erro",
  "code": "ERROR_CODE",
  "details": {
    "field": "Campo específico com erro"
  }
}
```

### Erros Comuns

```json
// Dados inválidos
{
  "error": "Nome do jogador é obrigatório",
  "code": "VALIDATION_ERROR"
}

// Recurso não encontrado
{
  "error": "Questão não encontrada", 
  "code": "NOT_FOUND"
}

// Erro de banco
{
  "error": "Erro ao conectar com banco de dados",
  "code": "DATABASE_ERROR"
}
```

---

## 🚀 Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Limite**: 100 requisições por 15 minutos por IP
- **Headers de resposta**:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp do reset

---

## 🧪 Exemplos de Uso

### JavaScript/Fetch

```javascript
// Buscar categorias
const categorias = await fetch('/api/quiz/categorias')
  .then(res => res.json());

// Fazer quiz
const questoes = await fetch('/api/quiz?categoria=biodiversidade&limite=5')
  .then(res => res.json());

// Salvar pontuação
const pontuacao = await fetch('/api/pontuacoes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nomeJogador: 'Ana',
    jogo: 'quiz',
    pontuacao: 850
  })
}).then(res => res.json());
```

### cURL

```bash
# Buscar ranking
curl "http://localhost:3001/api/ranking?limite=10"

# Salvar pontuação
curl -X POST "http://localhost:3001/api/pontuacoes" \
  -H "Content-Type: application/json" \
  -d '{"nomeJogador":"João","jogo":"quiz","pontuacao":750}'

# Health check
curl "http://localhost:3001/api/health"
```

---

## 📊 Monitoramento

### Métricas Disponíveis

- Total de jogos por tipo
- Pontuações médias
- Jogadores mais ativos
- Performance das questões
- Taxa de acerto por categoria

### Logs

A API registra:
- Todas as requisições com timestamp
- Erros com stack trace
- Performance de queries
- Status de sincronização

---

## 🔮 Roadmap da API

### Versão 1.1 (Próxima)
- [ ] Autenticação JWT
- [ ] Perfis de usuário
- [ ] Conquistas e badges
- [ ] API de imagens

### Versão 1.2 (Futura)
- [ ] WebSockets para tempo real
- [ ] Multiplayer
- [ ] Analytics avançados
- [ ] API GraphQL

---

## 🤝 Contribuição

### Adicionando Endpoints

1. Criar rota em `/backend/src/routes/`
2. Implementar validação
3. Adicionar testes
4. Documentar aqui
5. Atualizar Postman collection

### Padrões de Código

- Usar async/await
- Validar entrada sempre
- Retornar JSON consistente
- Logar erros apropriadamente
- Implementar rate limiting

---

## 📞 Suporte

- **Issues**: GitHub Issues
- **Email**: [seu-email]
- **Documentação**: README.md
- **Postman**: [Collection Link]

---

*Documentação atualizada em: Janeiro 2024*