'use client';
import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: Props) {
  return (
    <input
      {...props}
      className="rounded-md border px-3 py-2 text-sm w-full"
      style={{border:'1px solid #d1d5db',outline:'none'}}
    />
  );
}