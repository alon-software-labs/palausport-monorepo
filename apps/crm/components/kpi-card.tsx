import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type KpiVariant = 'default' | 'primary' | 'muted';
/** Icon circle colors when the whole card is not `primary` */
export type KpiIconAccent = 'default' | 'primary' | 'blue' | 'green';

export interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  variant?: KpiVariant;
  /** Icon circle palette (ignored when `variant` is `primary`; then the icon uses primary emphasis). */
  iconAccent?: KpiIconAccent;
  className?: string;
}

function iconWrapperClass(variant: KpiVariant, iconAccent: KpiIconAccent) {
  if (variant === 'primary') {
    return 'bg-primary/15 text-primary';
  }
  switch (iconAccent) {
    case 'blue':
      return 'bg-blue-500/10 text-blue-500';
    case 'green':
      return 'bg-green-500/10 text-green-500';
    case 'primary':
      return 'bg-primary/10 text-primary';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

export function KpiCard({
  title,
  value,
  description,
  icon,
  variant = 'default',
  iconAccent = 'default',
  className,
}: KpiCardProps) {
  return (
    <Card
      className={cn(
        'h-full min-h-[7.5rem] flex flex-col gap-0 overflow-hidden py-0 shadow-sm transition-all hover:shadow-md',
        variant === 'primary' && 'border-primary/30 bg-primary/5',
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col justify-center px-6 pb-4 pt-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div
              className={cn(
                'mt-1 text-2xl font-bold tabular-nums tracking-tight font-mono',
                variant === 'primary' && 'text-primary'
              )}
            >
              {value}
            </div>
            {description ? (
              <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {icon ? (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full [&_svg]:size-5',
                iconWrapperClass(variant, iconAccent)
              )}
            >
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
