'use client';
import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      {...props}
      className={`rounded-md border py-2 text-sm w-full text-white ${className}`}
      style={{ outline: 'none' }}
    />
  );
}