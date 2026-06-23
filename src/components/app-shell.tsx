import Link from "next/link";
import { BarChart3, FilePlus2, FolderOpenDot, LayoutDashboard } from "lucide-react";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "领导汇报总览", icon: LayoutDashboard },
  { href: "/backlinks/new", label: "登记工作记录", icon: FilePlus2 },
  { href: "/backlinks", label: "工作明细台账", icon: BarChart3 },
  { href: "/projects", label: "项目资料库", icon: FolderOpenDot },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_25%),linear-gradient(180deg,#0b1020_0%,#090d16_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-black/20 px-5 py-6 backdrop-blur xl:block">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Backlink Ops</div>
            <h1 className="mt-2 text-2xl font-semibold text-white">外链工作看板</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">深色数据看板 · 手动录入 · 复盘统计 · 本地演示版</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
            <div className="font-medium">当前模式</div>
            <div className="mt-2 leading-6 text-cyan-50/80">本地可运行 Demo，数据先存浏览器 localStorage，不会自动发外链。</div>
          </div>
        </aside>
        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/60 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="border-b border-white/10 px-5 py-4 xl:hidden">
              <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Backlink Ops</div>
              <h1 className="mt-1 text-lg font-semibold">外链工作看板</h1>
            </div>
            <div className="px-4 py-5 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
