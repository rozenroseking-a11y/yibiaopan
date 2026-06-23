import { ReactNode } from "react";

export function SectionTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 ${className}`}>{children}</div>;
}

export function MetricCard({ label, value, subtext, tone = "cyan" }: { label: string; value: string | number; subtext?: string; tone?: "cyan" | "violet" | "emerald" | "amber" | "rose" }) {
  const ring = {
    cyan: "from-cyan-400/25 to-cyan-400/5 border-cyan-400/20",
    violet: "from-violet-400/25 to-violet-400/5 border-violet-400/20",
    emerald: "from-emerald-400/25 to-emerald-400/5 border-emerald-400/20",
    amber: "from-amber-400/25 to-amber-400/5 border-amber-400/20",
    rose: "from-rose-400/25 to-rose-400/5 border-rose-400/20",
  }[tone];
  return (
    <Card className={`bg-gradient-to-br ${ring}`}>
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</div>
      {subtext ? <div className="mt-2 text-xs text-slate-400">{subtext}</div> : null}
    </Card>
  );
}

export function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "cyan" | "emerald" | "amber" | "rose" | "violet" }) {
  const styles = {
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-200",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
    amber: "border-amber-400/20 bg-amber-400/10 text-amber-100",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-100",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-100",
  }[tone];
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${styles}`}>{children}</span>;
}

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 ${className}`} />;
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50 ${className}`}>{children}</select>;
}

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`min-h-28 w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 ${className}`} />;
}

export function Button({ children, variant = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const styles = {
    primary: "bg-cyan-500 text-white hover:bg-cyan-400",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    danger: "bg-rose-500 text-white hover:bg-rose-400",
    ghost: "bg-transparent text-slate-200 hover:bg-white/10",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
