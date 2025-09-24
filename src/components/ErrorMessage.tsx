import { RefreshCcw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
      {/* Emoji animado para tornar o erro menos assustador para crianças */}
      <div className="text-6xl animate-bounce">
        😅
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-red-700">
          Ops! Algo não funcionou
        </h3>
        <p className="text-red-600 text-sm max-w-md">
          {message}
        </p>
        <p className="text-xs text-red-500">
          🦀 Não se preocupe! Vamos tentar de novo!
        </p>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          data-testid="button-retry"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <RefreshCcw className="h-5 w-5 animate-spin" />
          <span>Tentar Novamente</span>
          <span>🌳</span>
        </button>
      )}
    </div>
  );
}