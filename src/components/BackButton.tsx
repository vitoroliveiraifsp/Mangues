import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  label?: string;
  to?: string;
  className?: string;
}

export function BackButton({ label = "Voltar", to, className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      data-testid="button-back"
      className={`
        inline-flex items-center space-x-2 px-4 py-2 rounded-full 
        bg-gradient-to-r from-blue-400 to-blue-500 
        hover:from-blue-500 hover:to-blue-600 
        text-white font-medium text-sm
        transition-all duration-200 transform hover:scale-105 
        shadow-md hover:shadow-lg
        ${className}
      `}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
      <span>🏠</span>
    </button>
  );
}