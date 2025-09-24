# 🔧 Correções Necessárias para Nginx - Mundo dos Mangues

## 🎯 Problema Identificado

O hook `useApi` atual não detecta corretamente quando a aplicação está rodando com Nginx (porta 8080), causando falha nas chamadas de API.

---

## 📝 Arquivo a Modificar

### `src/hooks/useApi.ts`

**❌ Código Atual (Problemático):**
```typescript
const backendUrl = window.location.hostname.includes('replit') || window.location.hostname.includes('.app')
  ? '/api-proxy'  
  : 'http://localhost:3001'; // ← PROBLEMA: sempre usa porta 3001
```

**✅ Código Corrigido:**
```typescript
// Detecta o ambiente correto baseado na porta
const currentPort = window.location.port;
const hostname = window.location.hostname;

let backendUrl: string;

if (hostname.includes('replit') || hostname.includes('.app')) {
  // Ambiente Replit/produção
  backendUrl = '/api-proxy';
} else if (currentPort === '8080') {
  // Ambiente com Nginx (proxy reverso)
  backendUrl = '';  // URL relativa - Nginx faz o roteamento
} else if (currentPort === '5000' || currentPort === '') {
  // Desenvolvimento direto (sem Nginx)
  backendUrl = 'http://localhost:3001';
} else {
  // Fallback - tenta URL relativa primeiro
  backendUrl = '';
}

const fullUrl = backendUrl ? `${backendUrl}${url}` : url;
```

---

## 🔍 Debug Recomendado

Adicione logs para identificar problemas:

```typescript
console.log('🔍 Debug API Call:', {
  hostname,
  port: currentPort,
  backendUrl,
  finalUrl: fullUrl
});
```

---

## 📊 Comportamento Esperado

| Ambiente | Porta | URL Final | Funcionamento |
|----------|-------|-----------|---------------|
| **Desenvolvimento** | 5000 | `http://localhost:3001/api/especies` | Direto ao backend |
| **Nginx/Produção** | 8080 | `/api/especies` | Através do proxy Nginx |
| **Replit** | várias | `/api-proxy/api/especies` | Proxy do Replit |

---

## 🚀 Como Aplicar as Correções

### 1. Quando decidir usar Nginx:

```bash
# 1. Edite o arquivo src/hooks/useApi.ts
# 2. Substitua a lógica de detecção de ambiente
# 3. Reinicie os containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build

# 4. Teste em http://localhost:8080
# 5. Verifique o console do navegador (F12) para logs de debug
```

### 2. Para continuar sem Nginx (atual):

```bash
# Continue usando o setup simples
docker-compose up --build

# Acesse em http://localhost:5000
# Não precisa alterar nenhum código
```

---

## 🎯 Outros Arquivos que Podem Precisar de Ajuste

Se você tiver chamadas de API diretas em outros arquivos (fora do hook `useApi`), procure por:

### Padrões a Procurar:
```typescript
// ❌ Problemático com Nginx
fetch('http://localhost:3001/api/especies')
axios.get('http://localhost:3001/api/ameacas')

// ✅ Funciona com ambos
fetch('/api/especies')  // URL relativa
axios.get('/api/ameacas')  // URL relativa
```

### Arquivos Prováveis:
- `src/pages/BiodiversidadePage.tsx`
- `src/pages/AmeacasPage.tsx`  
- `src/pages/JogoDaMemoria.tsx`
- `src/pages/JogoConexoes.tsx`
- `src/context/GameContext.tsx`
- Qualquer componente que faça chamadas HTTP

---

## 🔧 Script de Busca Rápida

Para encontrar todas as chamadas de API no projeto:

```bash
# No terminal, dentro do projeto:
grep -r "localhost:3001" src/
grep -r "fetch(" src/
grep -r "axios" src/
```

---

## ✅ Checklist de Correção

Quando decidir implementar:

- [ ] Modificar `src/hooks/useApi.ts` com a lógica de detecção de porta
- [ ] Adicionar logs de debug temporários
- [ ] Procurar outras chamadas HTTP diretas no código
- [ ] Substituir URLs absolutas por relativas onde necessário
- [ ] Testar em ambos os ambientes (5000 e 8080)
- [ ] Remover logs de debug após confirmação

---

## 🎮 Estratégia Recomendada

1. **AGORA:** Continue com `docker-compose up` (porta 5000)
2. **FUTURO:** Quando quiser demonstrar Nginx, aplique as correções
3. **DEPLOY:** Use URLs relativas para máxima compatibilidade

---

## 💡 Nota Final

O problema atual não afeta o funcionamento sem Nginx. As correções são necessárias APENAS se/quando você quiser usar a configuração completa com Nginx para demonstrar conhecimento avançado de arquitetura.

**Status atual: ✅ Funcionando perfeitamente sem Nginx**  
**Status com Nginx: ⚠️ Requer as correções acima**