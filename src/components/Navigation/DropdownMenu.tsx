import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DropdownItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  highlight?: string;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownItem[];
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function DropdownMenu({ label, items, icon: Icon, className = "" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Check if any item in dropdown is active
  const isActive = items.some(item => location.pathname === item.path);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const getHighlightClass = (highlight?: string) => {
    switch (highlight) {
      case 'purple': return 'hover:bg-purple-700';
      case 'indigo': return 'hover:bg-indigo-700';
      case 'blue': return 'hover:bg-blue-700';
      case 'yellow': return 'hover:bg-yellow-600';
      default: return 'hover:bg-green-600';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
          isActive || isOpen
            ? 'bg-green-800 text-white shadow-lg ring-2 ring-green-400'
            : 'text-green-100 hover:bg-green-600 hover:text-white hover:shadow-md'
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 mt-2 ${
          isMobile ? 'left-0 right-0' : 'left-0 w-80'
        } bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}>
          <div className="p-2">
            {items.map((item) => {
              const ItemIcon = item.icon;
              const itemIsActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 group ${
                    itemIsActive
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    itemIsActive ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-green-100'
                  }`}>
                    <ItemIcon className={`h-5 w-5 ${
                      itemIsActive ? 'text-green-600' : 'text-gray-600 group-hover:text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-sm mb-1 ${
                      itemIsActive ? 'text-green-800' : 'text-gray-800'
                    }`}>
                      {item.label}
                    </h4>
                    {item.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {itemIsActive && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}