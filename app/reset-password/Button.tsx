'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  type = 'button',
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
  variant = 'primary',
}: ButtonProps) {
  const baseStyles =
    'px-4 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2';

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed',
    secondary:
      'bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
