import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import { offlineStorage } from '../utils/offlineStorage';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  photographer?: string;
  source?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function ImageGallery({ images, isOpen, onClose, initialIndex = 0 }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [imageCache, setImageCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      preloadImages();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Pré-carregar imagens para melhor performance
  const preloadImages = async () => {
    const currentImage = images[currentIndex];
    if (!currentImage) return;

    // Carregar imagem atual e adjacentes
    const indicesToLoad = [
      currentIndex,
      currentIndex - 1,
      currentIndex + 1
    ].filter(i => i >= 0 && i < images.length);

    for (const index of indicesToLoad) {
      const image = images[index];
      if (image && !imageCache.has(image.url)) {
        try {
          await loadAndCacheImage(image.url);
        } catch (error) {
          console.error('Erro ao carregar imagem:', error);
        }
      }
    }
  };

  // Carregar e cachear imagem
  const loadAndCacheImage = async (url: string): Promise<string> => {
    try {
      // Verificar cache offline primeiro
      const cachedBlob = await offlineStorage.getCachedImage(url);
      if (cachedBlob) {
        const objectUrl = URL.createObjectURL(cachedBlob);
        setImageCache(prev => new Map(prev.set(url, objectUrl)));
        return objectUrl;
      }

      // Carregar da rede
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao carregar imagem');

      const blob = await response.blob();
      
      // Cachear offline
      await offlineStorage.cacheImage(url, blob);
      
      // Criar URL do objeto
      const objectUrl = URL.createObjectURL(blob);
      setImageCache(prev => new Map(prev.set(url, objectUrl)));
      
      return objectUrl;
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      return url; // Fallback para URL original
    }
  };

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case '+':
      case '=':
        setZoom(prev => Math.min(prev + 0.25, 3));
        break;
      case '-':
        setZoom(prev => Math.max(prev - 0.25, 0.5));
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDownload = async () => {
    if (!currentImage) return;

    try {
      setIsLoading(true);
      const imageUrl = imageCache.get(currentImage.url) || currentImage.url;
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentImage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!currentImage) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.title,
          text: currentImage.description,
          url: window.location.href
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar URL para clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
      } catch (error) {
        console.error('Erro ao copiar link:', error);
      }
    }
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">{currentImage.title}</h2>
            <span className="text-sm opacity-75">
              {currentIndex + 1} de {images.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            
            <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
            
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              disabled={zoom >= 3}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <Download className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegação */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full 
                     bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full 
                     bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Imagem principal */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={imageCache.get(currentImage.url) || currentImage.url}
          alt={currentImage.title}
          className="max-w-full max-h-full object-contain transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
          onLoad={() => preloadImages()}
        />
      </div>

      {/* Footer com informações */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-4">
        <div className="text-white">
          <p className="text-lg font-medium mb-2">{currentImage.description}</p>
          <div className="flex items-center justify-between text-sm opacity-75">
            <span>Categoria: {currentImage.category}</span>
            {currentImage.photographer && (
              <span>Foto: {currentImage.photographer}</span>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-2 bg-black/30 rounded-full p-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-white scale-110' 
                    : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={imageCache.get(image.url) || image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay para fechar clicando fora */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}

// Hook para usar a galeria
export function useImageGallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  const openGallery = (galleryImages: GalleryImage[], startIndex = 0) => {
    setImages(galleryImages);
    setInitialIndex(startIndex);
    setIsOpen(true);
  };

  const closeGallery = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    images,
    initialIndex,
    openGallery,
    closeGallery
  };
}