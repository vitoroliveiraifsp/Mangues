// Service Worker para PWA - Mundo dos Mangues
const CACHE_NAME = 'mangues-quiz-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

// Recursos da API para cache
const API_CACHE_NAME = 'mangues-api-v1.0.0';
const IMAGE_CACHE_NAME = 'mangues-images-v1.0.0';

// URLs da API que devem ser cacheadas
const API_URLS = [
  '/api/quiz/categorias',
  '/api/quiz',
  '/api/especies',
  '/api/ameacas',
  '/api/jogo-memoria',
  '/api/conexoes',
  '/api/ranking',
  '/api/estatisticas'
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache dos recursos essenciais
      caches.open(CACHE_NAME).then(cache => {
        console.log('Service Worker: Cacheando recursos essenciais');
        return cache.addAll(ESSENTIAL_RESOURCES);
      }),
      
      // Cache da API
      caches.open(API_CACHE_NAME).then(cache => {
        console.log('Service Worker: Preparando cache da API');
        return Promise.resolve();
      }),
      
      // Cache de imagens
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        console.log('Service Worker: Preparando cache de imagens');
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('Service Worker: Instalação completa');
      return self.skipWaiting();
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME) {
              console.log('Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Tomar controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Ativação completa');
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégia para diferentes tipos de recursos
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // Estratégia Network First para API
      event.respondWith(handleApiRequest(request));
    } else if (request.destination === 'image') {
      // Estratégia Cache First para imagens
      event.respondWith(handleImageRequest(request));
    } else {
      // Estratégia Cache First para recursos estáticos
      event.respondWith(handleStaticRequest(request));
    }
  } else if (request.method === 'POST' && url.pathname.startsWith('/api/')) {
    // Lidar com requisições POST (pontuações, etc.)
    event.respondWith(handlePostRequest(request));
  }
});

// Lidar com requisições da API (Network First)
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear resposta bem-sucedida
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Rede falhou, buscando do cache:', request.url);
    
    // Buscar do cache se a rede falhar
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar dados offline padrão se não houver cache
    return new Response(JSON.stringify(getOfflineData(request.url)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Lidar com imagens (Cache First)
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Retornar imagem placeholder se falhar
    return new Response('', { status: 404 });
  }
}

// Lidar com recursos estáticos (Cache First)
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Retornar página offline para navegação
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    
    return new Response('', { status: 404 });
  }
}

// Lidar com requisições POST (para pontuações offline)
async function handlePostRequest(request) {
  try {
    // Tentar enviar pela rede
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Armazenar dados offline para sincronização posterior
    const requestData = await request.json();
    await storeOfflineData(request.url, requestData);
    
    // Retornar resposta simulada
    return new Response(JSON.stringify({
      success: true,
      offline: true,
      message: 'Dados salvos offline. Serão sincronizados quando a conexão for restaurada.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Dados offline padrão
function getOfflineData(url) {
  const urlPath = new URL(url).pathname;
  
  switch (urlPath) {
    case '/api/quiz/categorias':
      return [
        {
          id: 'biodiversidade',
          nome: 'Vida no Mangue',
          questoes: 5,
          emoji: '🐾'
        },
        {
          id: 'estrutura',
          nome: 'Como Funciona',
          questoes: 3,
          emoji: '🔄'
        },
        {
          id: 'conservacao',
          nome: 'Vamos Cuidar',
          questoes: 4,
          emoji: '🌍'
        }
      ];
      
    case '/api/quiz':
      return [
        {
          id: 1,
          categoria: 'biodiversidade',
          pergunta: 'Qual animal do mangue consegue respirar fora da água?',
          opcoes: ['Caranguejo-uçá', 'Peixe-boi', 'Garça-branca', 'Camarão-rosa'],
          respostaCorreta: 0,
          explicacao: 'O caranguejo-uçá tem brânquias modificadas que funcionam como pulmões primitivos!',
          dificuldade: 'facil',
          pontos: 10
        }
      ];
      
    case '/api/ranking':
      return [];
      
    case '/api/estatisticas':
      return {
        totalJogos: 0,
        jogosPorTipo: {},
        pontuacaoMedia: {},
        melhorPontuacao: 0,
        jogadorMaisAtivo: null
      };
      
    default:
      return { error: 'Dados não disponíveis offline' };
  }
}

// Armazenar dados offline
async function storeOfflineData(url, data) {
  const offlineData = await getStoredOfflineData();
  const timestamp = Date.now();
  
  offlineData.push({
    url,
    data,
    timestamp,
    synced: false
  });
  
  await self.registration.sync.register('background-sync');
  
  // Armazenar no IndexedDB (simulado com localStorage para simplicidade)
  self.postMessage({
    type: 'STORE_OFFLINE_DATA',
    payload: { url, data, timestamp }
  });
}

// Recuperar dados offline armazenados
async function getStoredOfflineData() {
  // Em uma implementação real, usaria IndexedDB
  return [];
}

// Sincronização em background
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Iniciando sincronização em background');
    event.waitUntil(syncOfflineData());
  }
});

// Sincronizar dados offline
async function syncOfflineData() {
  try {
    // Recuperar dados não sincronizados
    const offlineData = await getStoredOfflineData();
    const unsynced = offlineData.filter(item => !item.synced);
    
    for (const item of unsynced) {
      try {
        const response = await fetch(item.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          // Marcar como sincronizado
          item.synced = true;
          console.log('Service Worker: Dados sincronizados:', item.url);
        }
      } catch (error) {
        console.log('Service Worker: Falha na sincronização:', error);
      }
    }
  } catch (error) {
    console.log('Service Worker: Erro na sincronização:', error);
  }
}

// Notificar sobre atualizações
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});