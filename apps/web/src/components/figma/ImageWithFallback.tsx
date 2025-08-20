import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ImageWithFallback({ src, alt, className = '', style }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center ${className}`}
        style={style}
      >
        <span className="text-white text-sm">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}
