interface RuleCardProps {
  title: string;
  description: string;
}

export function RuleCard({ title, description }: RuleCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 transition-all duration-300 hover:border-[#EAC360]/50 hover:bg-neutral-800/50 hover:-translate-y-1 active:scale-[0.99] cursor-default group">
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#EAC360] transition-colors">{title}</h3>
      <p className="text-neutral-400 group-hover:text-neutral-300 transition-colors">
        {description}
      </p>
    </div>
  );
}
