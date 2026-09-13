import React from 'react';
import defaultLogoSrc from '../../assets/charithra-learning-hub-logo.png';
import fullLogoLight from '../../assets/charithra-full-logo.png';
import fullLogoDark from '../../assets/charithra-full-dark.png';
import emblemLight from '../../assets/charithra-emblem.png';
import emblemDark from '../../assets/charithra-emblem-dark.png';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  mode?: 'full' | 'emblem';
  variant?: 'light' | 'dark'; // 'light' for light/white surfaces, 'dark' for dark/slate surfaces
  showText?: boolean;
  moduleTag?: 'ADMIN' | 'TUTOR' | 'PARENT';
  subtitle?: string;
  className?: string;
  imageOnly?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  mode = 'emblem',
  variant = 'light',
  showText = true,
  moduleTag,
  subtitle,
  className = '',
  imageOnly = false
}) => {
  const isDarkBg = variant === 'dark';

  // Mode: Full Official Lockup (Artwork with emblem + text)
  if (mode === 'full') {
    const fullLogoSrc = isDarkBg ? fullLogoDark : (fullLogoLight || defaultLogoSrc);
    const fullHeightClasses = {
      xs: 'h-8',
      sm: 'h-12',
      md: 'h-16',
      lg: 'h-24',
      xl: 'h-32',
      '2xl': 'h-40'
    }[size];

    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        <img
          src={fullLogoSrc}
          alt="Charithra Learning Hub"
          className={`${fullHeightClasses} w-auto max-w-full object-contain transition-transform duration-200`}
        />
        {subtitle && (
          <p className={`text-xs font-semibold mt-2 tracking-wide text-center ${isDarkBg ? 'text-slate-300' : 'text-slate-600'}`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // Mode: Circular Emblem + Styled HTML Typography
  const emblemSrc = isDarkBg ? emblemDark : (emblemLight || defaultLogoSrc);

  const emblemSizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-11 h-11',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-36 h-36'
  }[size];

  const titleSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm sm:text-[15px]',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl'
  }[size];

  if (imageOnly) {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${emblemSizeClasses} ${className}`}>
        <img
          src={emblemSrc}
          alt="Charithra Learning Hub"
          className="w-full h-full object-contain drop-shadow-xs"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Crisp Circular Emblem */}
      <div className={`relative inline-flex items-center justify-center shrink-0 ${emblemSizeClasses}`}>
        <img
          src={emblemSrc}
          alt="Charithra Learning Hub"
          className="w-full h-full object-contain drop-shadow-xs"
        />
      </div>

      {/* Brand Text: Charithra Learning Hub + Subtitle */}
      {showText && (
        <div className="flex flex-col min-w-0 justify-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-black tracking-tight leading-tight whitespace-nowrap ${titleSizeClasses} ${
                isDarkBg ? 'text-white' : 'text-slate-900'
              }`}
            >
              Charithra Learning Hub
            </span>
          </div>
          {subtitle && (
            <span
              className={`text-[11px] font-bold tracking-wide mt-0.5 whitespace-nowrap ${
                isDarkBg ? 'text-amber-400' : 'text-indigo-600'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
