# 🐳 Guia Docker - Mundo dos Mangues v2.2

## 📋 Visão Geral

Este guia fornece instruções completas para executar o projeto Mundo dos Mangues usando Docker, incluindo as novas funcionalidades da versão 2.2.

---

## 🚀 Execução Rápida

### Desenvolvimento (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mundo-dos-mangues.git
cd mundo-dos-mangues

# 2. Execute com Docker
docker-compose up --build

# 3. Acesse a aplicação
# Frontend: http://localhost:5000
# Backend: http://localhost:3001
# Health Check: http://localhost:3001/api/health
```

### Produção

```bash
# Executar em modo produção
docker-compose -f docker-compose.prod.yml up --build -d

# Acesso: http://localhost:8080
```

---

## 📁 Estrutura Docker

```
projeto/
├── docker-compose.yml              # Desenvolvimento
├── docker-compose.prod.yml         # Produção  
├── Dockerfile.backend              # Container do backend
├── Dockerfile.frontend             # Container do frontend (dev)
├── Dockerfile.frontend.prod        # Container do frontend (prod)
├── nginx.conf                      # Configuração Nginx
└── .dockerignore                   # Arquivos ignorados
```

---

## 🛠️ Comandos Docker Essenciais

### Desenvolvimento

```bash
# Iniciar aplicação
docker-compose up --build

# Executar em background
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f frontend
docker-compose logs -f backend

# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Reconstruir imagens
docker-compose build --no-cache
```

### Produção

```bash
# Deploy produção
docker-compose -f docker-compose.prod.yml up --build -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs produção
docker-compose -f docker-compose.prod.yml logs -f

# Parar produção
docker-compose -f docker-compose.prod.yml down
```

### Manutenção

```bash
# Limpar containers parados
docker container prune

# Limpar imagens não utilizadas
docker image prune

# Limpar volumes não utilizados
docker volume prune

# Limpeza completa (CUIDADO!)
docker system prune -a
```

---

## 🔧 Configurações Detalhadas

### docker-compose.yml (Desenvolvimento)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: mangues-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
    volumes:
      - ./backend:/app/backend
    networks:
      - mangues-network
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: mangues-frontend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://backend:3001
    depends_on:
      - backend
    volumes:
      - ./src:/app/src
      - ./index.html:/app/index.html
    networks:
      - mangues-network
    restart: unless-stopped

networks:
  mangues-network:
    driver: bridge
```

### docker-compose.prod.yml (Produção)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: mangues-backend-prod
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    networks:
      - mangues-network
    restart: always

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend.prod
    container_name: mangues-frontend-prod
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - mangues-network
    restart: always

  nginx:
    image: nginx:alpine
    container_name: mangues-nginx
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
    networks:
      - mangues-network
    restart: always

networks:
  mangues-network:
    driver: bridge
```

---

## 🌐 Configuração Nginx

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    upstream backend {
        server backend:3001;
    }
    
    upstream frontend {
        server frontend:80;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # API Backend
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Accept, Authorization, Content-Type, X-Requested-With";
            
            if ($request_method = OPTIONS) {
                return 204;
            }
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

---

## 🔍 Monitoramento e Logs

### Verificar Status dos Containers

```bash
# Status geral
docker-compose ps

# Detalhes de um container
docker inspect mangues-frontend

# Uso de recursos
docker stats

# Logs específicos
docker logs mangues-backend --tail 50 -f
```

### Métricas de Performance

```bash
# Uso de CPU e memória
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Espaço em disco
docker system df

# Informações detalhadas
docker system info
```

---

## 🚨 Solução de Problemas

### Container não Inicia

```bash
# Verificar logs de erro
docker-compose logs backend
docker-compose logs frontend

# Verificar se portas estão livres
netstat -tulpn | grep :5000
netstat -tulpn | grep :3001

# Reconstruir sem cache
docker-compose build --no-cache
```

### Problemas de Rede

```bash
# Verificar rede Docker
docker network ls
docker network inspect mangues_mangues-network

# Testar conectividade entre containers
docker exec mangues-frontend ping backend
docker exec mangues-backend ping frontend
```

### Problemas de Volume

```bash
# Verificar volumes
docker volume ls

# Inspecionar volume
docker volume inspect mangues_node_modules

# Remover volumes órfãos
docker volume prune
```

### Hot Reload não Funciona

```bash
# No Windows, pode ser necessário polling
# Adicione ao docker-compose.yml:
environment:
  - CHOKIDAR_USEPOLLING=true
```

---

## 🌍 Deploy em Produção

### AWS/Cloud

```bash
# 1. Configurar variáveis de ambiente
export DB_HOST=seu-rds-endpoint
export DB_PASSWORD=senha-producao
export CORS_ORIGIN=https://seu-dominio.com

# 2. Build e push para registry
docker build -t seu-registry/mangues-backend -f Dockerfile.backend .
docker build -t seu-registry/mangues-frontend -f Dockerfile.frontend.prod .

docker push seu-registry/mangues-backend
docker push seu-registry/mangues-frontend

# 3. Deploy no servidor
docker-compose -f docker-compose.prod.yml up -d
```

### Heroku

```bash
# Instalar Heroku CLI
# Configurar heroku.yml

# Deploy
git push heroku main
```

### DigitalOcean/VPS

```bash
# Conectar ao servidor
ssh user@seu-servidor

# Clonar repositório
git clone https://github.com/seu-usuario/mundo-dos-mangues.git
cd mundo-dos-mangues

# Configurar .env para produção
cp .env.example .env
# Editar .env com configurações do servidor

# Executar
docker-compose -f docker-compose.prod.yml up -d

# Configurar SSL com Let's Encrypt (opcional)
sudo apt install certbot
sudo certbot --nginx -d seu-dominio.com
```

---

## 📊 Monitoramento Avançado

### Prometheus + Grafana (Opcional)

```yaml
# Adicionar ao docker-compose.prod.yml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Logs Centralizados

```bash
# Configurar log driver
docker-compose -f docker-compose.prod.yml \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  up -d
```

---

## 🔒 Segurança

### Boas Práticas

```bash
# 1. Usar secrets para senhas
echo "senha-super-secreta" | docker secret create db_password -

# 2. Executar como usuário não-root
# Adicionar ao Dockerfile:
USER node

# 3. Escanear vulnerabilidades
docker scan mangues-backend:latest
```

### Backup

```bash
# Backup de volumes
docker run --rm -v mangues_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restore
docker run --rm -v mangues_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

---

## 📈 Otimizações

### Multi-stage Build

```dockerfile
# Exemplo no Dockerfile.frontend.prod
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### Cache de Dependências

```bash
# Usar BuildKit para cache
DOCKER_BUILDKIT=1 docker-compose build

# Cache entre builds
docker-compose build --parallel
```

---

## 🎯 Funcionalidades v2.2 no Docker

### Certificados Blockchain

```bash
# Verificar blockchain
curl http://localhost:3001/api/certificates/blockchain

# Emitir certificado de teste
curl -X POST http://localhost:3001/api/certificates/issue \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","type":"quiz_master","metadata":{"score":950}}'
```

### Streaming de Vídeo

```bash
# Listar vídeos disponíveis
curl http://localhost:3001/api/videos

# Buscar por categoria
curl "http://localhost:3001/api/videos?category=biodiversidade"
```

### Sistema de Gamificação

```bash
# Ver conquistas de usuário
curl http://localhost:3001/api/gamification/achievements/user123

# Ver missões ativas
curl http://localhost:3001/api/gamification/missions/user123
```

---

## 📞 Suporte Docker

### Problemas Comuns

1. **Porta em uso**: Altere as portas no docker-compose.yml
2. **Memória insuficiente**: Aumente limite do Docker Desktop
3. **Permissões**: Execute com `sudo` se necessário (Linux)

### Comandos de Debug

```bash
# Entrar no container
docker exec -it mangues-backend sh
docker exec -it mangues-frontend sh

# Verificar variáveis de ambiente
docker exec mangues-backend env

# Testar conectividade
docker exec mangues-frontend ping backend
```

---

*Documentação Docker atualizada para v2.2 - Janeiro 2025*