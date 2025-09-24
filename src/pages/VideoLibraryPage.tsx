import { VideoLibrary } from '../components/VideoLibrary/VideoLibrary';
import { BackButton } from '../components/BackButton';

export function VideoLibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>
        
        <VideoLibrary />
      </div>
    </div>
  );
}