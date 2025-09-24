export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Animação de loading mais divertida para crianças */}
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
        <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
          🌳
        </div>
      </div>
      
      {/* Loading dots animation */}
      <div className="flex space-x-2 items-center">
        <span className="text-xl font-medium text-green-700">Carregando</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
      
      <p className="text-sm text-green-600 text-center max-w-xs">
        🌊 Explorando o mundo dos mangues... 🦀
      </p>
    </div>
  );
}