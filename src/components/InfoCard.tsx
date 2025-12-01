import { ReactNode } from 'react';

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function InfoCard({ icon, title, children }: InfoCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition-all duration-300 hover:border-[#EAC360]/50 hover:bg-neutral-800/50 hover:-translate-y-1 active:scale-[0.98] cursor-default h-full">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-xl font-bold group-hover:text-[#EAC360] transition-colors">{title}</h3>
      </div>
      <div className="text-neutral-400 text-sm space-y-1">
        {children}
      </div>
    </div>
  );
}
