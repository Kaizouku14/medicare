import type { LucideIcon } from "lucide-react";

export function PageHeader({
  icon: Icon,
  label,
  title,
  description,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Icon className="size-3.5 text-primary" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            {label}
          </span>
        </div>
        <h1 className="mt-3 font-serif text-2xl sm:text-4xl font-medium tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
