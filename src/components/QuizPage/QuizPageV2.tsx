import { useState, useEffect } from 'react';
import { graphqlClient } from '../../services/graphqlClient';
import { SocialShareButton } from '../SocialShare/SocialShareButton';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { useI18n } from '../../hooks/useI18n';

// Enhanced QuizPage with GraphQL and social sharing
export function QuizPageV2() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [gameResult, setGameResult] = useState<any>(null);
  const { t } = useI18n();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await graphqlClient.getQuizCategories();
      setCategories(data.quizCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadCategories} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🧠 {t('navigation.quiz')}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {t('quiz.description') || 'Teste seus conhecimentos sobre os mangues!'}
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((categoria) => (
            <div
              key={categoria.id}
              className="bg-white rounded-3xl p-8 shadow-lg cursor-pointer transition-all duration-300 
                       transform hover:scale-105 hover:shadow-2xl group"
            >
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {categoria.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {categoria.nome}
                </h3>
                <p className="text-gray-600 mb-4">
                  {categoria.questoes} {t('quiz.questionsAvailable') || 'questões disponíveis'}
                </p>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 
                              rounded-full font-medium group-hover:from-purple-600 group-hover:to-pink-600 
                              transition-colors">
                  {t('quiz.startQuiz') || 'Começar Quiz'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Share (if game completed) */}
        {gameResult && (
          <div className="text-center">
            <SocialShareButton
              scoreData={{
                game: 'quiz',
                score: gameResult.pontuacaoTotal,
                category: gameResult.categoria,
                difficulty: gameResult.dificuldade
              }}
              className="mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}