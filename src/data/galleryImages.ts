// Galeria de imagens reais dos mangues (URLs do Pexels)
export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  photographer?: string;
  source?: string;
}

export const galleryImages: GalleryImage[] = [
  // Paisagens de Mangue
  {
    id: 'mangue-1',
    url: 'https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Raízes Aéreas do Mangue',
    description: 'As impressionantes raízes aéreas do mangue-vermelho que ajudam a planta a se sustentar no solo mole e filtrar a água salgada.',
    category: 'paisagem',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  {
    id: 'mangue-2',
    url: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Ecossistema de Mangue',
    description: 'Vista panorâmica de um ecossistema de mangue mostrando a diversidade de plantas e a importância deste habitat.',
    category: 'paisagem',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  {
    id: 'mangue-3',
    url: 'https://images.pexels.com/photos/1029609/pexels-photo-1029609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Canais do Mangue',
    description: 'Os canais naturais formados pelas marés no mangue, essenciais para a circulação de nutrientes e vida aquática.',
    category: 'paisagem',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  
  // Fauna
  {
    id: 'caranguejo-1',
    url: 'https://images.pexels.com/photos/1618606/pexels-photo-1618606.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Caranguejo do Mangue',
    description: 'Um caranguejo típico dos mangues, importante para a oxigenação do solo através dos buracos que cava.',
    category: 'fauna',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  {
    id: 'ave-1',
    url: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Aves do Mangue',
    description: 'Aves aquáticas que dependem do mangue para alimentação e reprodução, como garças e guarás.',
    category: 'fauna',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  {
    id: 'peixe-1',
    url: 'https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Peixes Juvenis',
    description: 'Peixes jovens que usam o mangue como berçário antes de migrar para o oceano aberto.',
    category: 'fauna',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  
  // Flora
  {
    id: 'folhas-1',
    url: 'https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Folhas Adaptadas',
    description: 'Folhas especializadas das plantas de mangue que conseguem eliminar o excesso de sal absorvido.',
    category: 'flora',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  {
    id: 'sementes-1',
    url: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Propágulos',
    description: 'Sementes especiais do mangue que flutuam na água até encontrar um local adequado para germinar.',
    category: 'flora',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  
  // Conservação
  {
    id: 'conservacao-1',
    url: 'https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Área Protegida',
    description: 'Mangue preservado mostrando a importância da conservação destes ecossistemas únicos.',
    category: 'conservacao',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  {
    id: 'restauracao-1',
    url: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Restauração de Mangue',
    description: 'Projeto de restauração de mangue mostrando como podemos ajudar a recuperar áreas degradadas.',
    category: 'conservacao',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  
  // Ameaças
  {
    id: 'poluicao-1',
    url: 'https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Impacto da Poluição',
    description: 'Exemplo dos impactos da poluição nos ecossistemas de mangue e a importância de protegê-los.',
    category: 'ameacas',
    photographer: 'Pexels',
    source: 'Pexels'
  },
  {
    id: 'desmatamento-1',
    url: 'https://images.pexels.com/photos/1029609/pexels-photo-1029609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Área Degradada',
    description: 'Mangue impactado pelo desmatamento, mostrando a necessidade urgente de conservação.',
    category: 'ameacas',
    photographer: 'Pexels',
    source: 'Pexels'
  }
];

// Função para obter imagens por categoria
export const getImagesByCategory = (category: string): GalleryImage[] => {
  return galleryImages.filter(image => image.category === category);
};

// Função para obter imagem aleatória
export const getRandomImage = (): GalleryImage => {
  const randomIndex = Math.floor(Math.random() * galleryImages.length);
  return galleryImages[randomIndex];
};

// Função para obter imagens relacionadas
export const getRelatedImages = (currentImageId: string, limit = 4): GalleryImage[] => {
  const currentImage = galleryImages.find(img => img.id === currentImageId);
  if (!currentImage) return [];
  
  return galleryImages
    .filter(img => img.id !== currentImageId && img.category === currentImage.category)
    .slice(0, limit);
};