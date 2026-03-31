import { IcBook } from "@/src/apps/recipes/icons";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <IcBook className="h-5 w-5 text-primary" />
      <span className="text-[15px] font-bold tracking-tight text-primary">
        PantryClip
      </span>
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

export function ImgPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gradient-to-br from-[oklch(0.28_0.02_48)] via-[oklch(0.22_0.01_260)] to-[oklch(0.18_0.005_260)] ${className ?? ""}`}
    />
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
