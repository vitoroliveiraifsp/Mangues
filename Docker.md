# 🐳 Configuração Docker - Mundo dos Mangues

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+

## 🚀 Execução Rápida (Desenvolvimento)

```bash
# 1. Clone o repositório (se necessário)
git clone <seu-repositorio>
cd mundo-dos-mangues

# 2. Copie o arquivo de ambiente
cp .env.example .env

# 3. Execute a aplicação
docker-compose up --build

# 4. Acesse:
# Frontend: http://localhost:5000
# Backend: http://localhost:3001
```

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento (com hot reload)
docker-compose up --build

# Executar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar os containers
docker-compose down

# Remover volumes e imagens
docker-compose down -v --rmi all
```

### Produção
```bash
# Build e execução para produção
docker-compose -f docker-compose.prod.yml up --build -d

# Acesso: http://localhost:8080
```

## 🌐 Deploy Externo (ngrok, AWS, etc.)

### Com ngrok:
```bash
# Terminal 1: Execute a aplicação
docker-compose up

# Terminal 2: Exponha com ngrok
ngrok http 5000
```

### Para AWS/Cloud:
1. Ajuste as variáveis de ambiente no `.env`
2. Configure o CORS no backend para aceitar o domínio da nuvem
3. Use `docker-compose.prod.yml` para produção

## 🔧 Configurações Importantes

### Variáveis de Ambiente
```env
# Backend
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://seu-dominio.com

# Frontend
VITE_API_URL=https://api.seu-dominio.com
```

### CORS (backend/server.js)
Para produção, ajuste:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
  credentials: true
}));
```

## 🐛 Solução de Problemas

### Frontend não carrega:
- Verifique se ambos containers estão rodando: `docker-compose ps`
- Confirme as portas: `docker-compose port frontend 5000`

### API não conecta:
- Verifique logs do backend: `docker-compose logs backend`
- Confirme a variável VITE_API_URL no frontend

### Hot reload não funciona:
- Certifique-se que os volumes estão montados corretamente
- No Windows, pode ser necessário usar polling: adicione `CHOKIDAR_USEPOLLING=true`

## 📁 Estrutura de Arquivos Docker

```
projeto/
├── docker-compose.yml          # Desenvolvimento
├── docker-compose.prod.yml     # Produção
├── Dockerfile.backend          # Backend container
├── Dockerfile.frontend         # Frontend container (dev)
├── Dockerfile.frontend.prod    # Frontend container (prod)
├── .dockerignore              # Arquivos ignorados
├── .env.example               # Variáveis de ambiente
└── nginx.conf                 # Configuração Nginx (prod)
```

## 🎯 Próximos Passos

1. Teste local com `docker-compose up`
2. Configure variáveis para seu domínio
3. Deploy usando `docker-compose.prod.yml`
4. Configure CI/CD se necessário

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `docker-compose logs`
2. Confirme que as portas estão livres: `netstat -tulpn | grep :5000`
3. Reinicie os containers: `docker-compose restart`