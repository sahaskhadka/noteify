import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const sizes = {
    small: { container: 'w-7 h-7', text: 'text-base' },
    medium: { container: 'w-8 h-8', text: 'text-xl' },
    large: { container: 'w-10 h-10', text: 'text-2xl' }
  };

  return (
    <div className="flex items-center gap-2">
      <img 
        src="/logo.png" 
        alt="Noteify Logo" 
        className={`${sizes[size].container} rounded-lg object-cover`}
      />
      {showText && (
        <span className={`font-bold ${sizes[size].text} bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight`}>
          Noteify
        </span>
      )}
    </div>
  );
};