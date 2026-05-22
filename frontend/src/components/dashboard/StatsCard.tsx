import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: 'bg-[#141C25]/80 border-white/5',
  primary: 'bg-[#C4622D]/5 border-[#C4622D]/20 shadow-[0_0_15px_rgba(196,98,45,0.1)]',
  success: 'bg-[#3D7A5C]/5 border-[#3D7A5C]/20 shadow-[0_0_15px_rgba(61,122,92,0.1)]',
  warning: 'bg-[#D4A847]/5 border-[#D4A847]/20 shadow-[0_0_15px_rgba(212,168,71,0.1)]',
  danger: 'bg-red-900/5 border-red-900/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
};

const iconVariantStyles = {
  default: 'bg-white/5 text-[#8A9BAD]',
  primary: 'bg-[#C4622D]/10 text-[#C4622D] shadow-[0_0_10px_rgba(196,98,45,0.4)]',
  success: 'bg-[#3D7A5C]/10 text-[#3D7A5C] shadow-[0_0_10px_rgba(61,122,92,0.4)]',
  warning: 'bg-[#D4A847]/10 text-[#D4A847] shadow-[0_0_10px_rgba(212,168,71,0.4)]',
  danger: 'bg-red-900/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]',
};

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-all duration-500 hover:scale-[1.02] group animate-fade-in backdrop-blur-sm',
        variantStyles[variant],
        className
      )}
    >
      {/* Decorative Corner Accent */}
      <div className="absolute top-0 right-0 p-1">
        <div className="h-4 w-4 border-t border-r border-white/10 rounded-tr-sm" />
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[#8A9BAD]/60 group-hover:text-[#D4A847] transition-colors">
            {title}
          </p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-display font-bold tracking-tight text-white group-hover:translate-x-1 transition-transform tabular-nums">
              {value}
            </h3>
            {trend && (
              <span
                className={cn(
                  'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border',
                  trend.isPositive
                    ? 'text-[#3D7A5C] bg-[#3D7A5C]/10 border-[#3D7A5C]/20'
                    : 'text-red-500 bg-red-500/10 border-red-500/20'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </div>
          {description && (
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-4 bg-[#C4622D]/20" />
              <p className="text-[10px] font-label text-[#8A9BAD] uppercase tracking-widest">{description}</p>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-xl border border-white/5 transition-all group-hover:rotate-6',
            iconVariantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>

      {/* Background Pattern Hint */}
      <div className="absolute -bottom-4 -left-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
        <div className="h-24 w-24 border-[10px] border-white rotate-45" />
      </div>
    </div>
  );
}
