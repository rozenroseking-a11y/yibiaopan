"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AppShell } from "../app-shell";
import { MetricCard, Pill, SectionTitle, Button, Select } from "../ui";
import { buildDailyTrend, buildProjectComparison, buildRecent, buildProjectPeriodSummary, buildTodayProjectSummary, computeStats, countBy, filterRecords } from "@/lib/analytics";
import { useStoredBacklinks, useStoredProjects } from "../use-local-storage-data";
import { DashboardFilters } from "@/lib/types";

const TrendChart = dynamic(() => import("../charts").then((mod) => mod.TrendChart), { ssr: false });
const BarCompareChart = dynamic(() => import("../charts").then((mod) => mod.BarCompareChart), { ssr: false });
const DoughnutChart = dynamic(() => import("../charts").then((mod) => mod.DoughnutChart), { ssr: false });

const presets = [
  { value: "all", label: "全部项目" },
  { value: "today", label: "今日" },
  { value: "7d", label: "最近 7 天" },
  { value: "30d", label: "最近 30 天" },
  { value: "month", label: "本月" },
  { value: "custom", label: "自定义" },
];

export function DashboardView() {
  const router = useRouter();
  const [projects] = useStoredProjects();
  const [records] = useStoredBacklinks();
  const [projectId, setProjectId] = useState("all");
  const [timePreset, setTimePreset] = useState<DashboardFilters["timePreset"]>("30d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [periodView, setPeriodView] = useState<"7d" | "month">("7d");
  const [reportMode, setReportMode] = useState<"日报" | "周报" | "月报">("周报");

  const filtered = useMemo(
    () => filterRecords(records, { projectId, timePreset, dateFrom, dateTo, search: "", platformType: "all", executionStatus: "all", reviewStatus: "all" }),
    [records, projectId, timePreset, dateFrom, dateTo]
  );
  const stats = computeStats(filtered);
  const trend = buildDailyTrend(filtered, 14);
  const projectBars = buildProjectComparison(filtered, projects);
  const platformPie = countBy(filtered, "platformType");
  const executionPie = countBy(filtered, "executionStatus");
  const reviewPie = countBy(filtered, "reviewStatus");
  const recent = buildRecent(filtered, 8);
  const todayProjectSummary = buildTodayProjectSummary(records, projects);
  const periodProjectSummary = buildProjectPeriodSummary(records, projects, periodView);
  const topPlatform = [...platformPie].sort((a, b) => b.value - a.value)[0];
  const activeProjects = projects.filter((project) => project.isActive).length;

  const buildReport = (
    title: string,
    summary: string,
    conclusion: string,
    risk: string,
    nextStep: string
  ) =>
    [
      `【${title}】`,
      `一、工作概况`,
      `当前维护 ${projects.length} 个项目（${activeProjects} 个启用），累计 ${stats.total} 条工作记录。`,
      `当前筛选范围内，最近 7 天新增 ${stats.week} 条，其中已提交 ${stats.submitted} 条、待审核 ${stats.awaitingReview} 条、失败 ${stats.failed} 条。`,
      `二、阶段结论`,
      conclusion,
      `三、主要工作`,
      summary,
      `四、风险提示`,
      risk,
      `五、下一步计划`,
      nextStep,
      topPlatform ? `补充：目前平台类型中 ${topPlatform.name} 占比最高。` : "补充：当前暂无足够数据判断平台分布。",
    ].join("\n");

  const buildBriefReport = (title: string, oneLine: string, nextStep: string) =>
    [
      `【${title}（简版）】`,
      oneLine,
      `下一步：${nextStep}`,
    ].join("\n");

  const dailyReport = buildReport(
    "日报",
    "继续登记当天新增工作，优先跟进已提交链接的审核反馈。",
    "今天的工作重点是完成新增记录的整理与更新，整体进度稳定。",
    "部分链接仍处于审核或待确认阶段，需要继续跟踪结果，避免遗漏。",
    "检查今日新增项目的收录情况，并补充失败原因和备注。"
  );

  const weeklyReport = buildReport(
    "周报",
    "本周持续维护项目资料库，集中处理已提交 / 待审核记录，并同步更新项目基础信息。",
    "本周工作以执行、跟踪和复盘为主，项目资料已开始形成可复用台账。",
    "仍有少量失败和未检查记录，需要在下周继续复盘原因并提升转化效率。",
    "按项目汇总本周成果、失败案例和下周投放计划。"
  );

  const monthlyReport = buildReport(
    "月报",
    "本月重点是沉淀可复用的外链渠道和项目资料，持续优化提交流程。",
    "月度工作已经从单次执行转向沉淀方法和复盘机制，便于后续持续复制。",
    "当前主要风险在于平台审核节奏不稳定，以及部分平台存在拒绝或失败情况。",
    "输出月度复盘：完成量、通过率、失败原因和下月优化方向。"
  );

  const dailyBrief = buildBriefReport(
    "日报",
    `今日维护 ${projects.length} 个项目，新增 ${stats.week} 条工作记录。`,
    "补充已提交链接的审核反馈和失败原因。"
  );

  const weeklyBrief = buildBriefReport(
    "周报",
    `本周累计新增 ${stats.week} 条，已提交 ${stats.submitted} 条，待审核 ${stats.awaitingReview} 条。`,
    "按项目汇总成果、风险和下周计划。"
  );

  const monthlyBrief = buildBriefReport(
    "月报",
    `本月重点放在渠道沉淀、项目资料维护和流程复盘。`,
    "输出月度复盘和下月优化方向。"
  );

  const reportBundle = {
    日报: { detailed: dailyReport, brief: dailyBrief },
    周报: { detailed: weeklyReport, brief: weeklyBrief },
    月报: { detailed: monthlyReport, brief: monthlyBrief },
  } as const;

  const selectedReport = reportBundle[reportMode].detailed;
  const selectedBrief = reportBundle[reportMode].brief;

  const copyText = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      window.alert(successMessage);
    } catch {
      window.alert("复制失败，请手动选择文本复制");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Internal Ops</div>
            <h1 className="mt-2 text-3xl font-bold text-white">外链执行与复盘工作台</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">给自己和公司领导看的内部台账：看清楚当前做了哪些项目、哪些平台已经提交、哪些还在审核，以及下一步要补什么。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => router.push("/backlinks/new")}>+ 登记工作记录</Button>
            <Button onClick={() => router.push("/backlinks")}>查看工作明细</Button>
            <Button variant="secondary" onClick={() => copyText(selectedReport, `已复制${reportMode}正式版`) }>复制当前正式版</Button>
            <Button variant="secondary" onClick={() => copyText(selectedBrief, `已复制${reportMode}简版`) }>复制当前简版</Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="all">全部项目</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </Select>
          <Select value={timePreset} onChange={(e) => setTimePreset(e.target.value as DashboardFilters["timePreset"])}>
            {presets.map((preset) => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
          </Select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none" />
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">当前筛选：{filtered.length} 条</div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">本地存储 · 仅内部使用</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <SectionTitle title="领导汇报摘要" description="可切换日报 / 周报 / 月报，并直接复制正式版或简版。" />
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant={reportMode === "日报" ? "primary" : "secondary"} onClick={() => setReportMode("日报")}>预览日报</Button>
            <Button variant={reportMode === "周报" ? "primary" : "secondary"} onClick={() => setReportMode("周报")}>预览周报</Button>
            <Button variant={reportMode === "月报" ? "primary" : "secondary"} onClick={() => setReportMode("月报")}>预览月报</Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-200 whitespace-pre-line">
              {selectedReport}
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-7 text-cyan-50">
              <div className="font-medium text-white">本周工作重点</div>
              <ul className="mt-2 space-y-1 list-disc pl-5 text-cyan-50/90">
                <li>持续登记和整理各项目外链投放情况</li>
                <li>跟踪已提交链接的审核、收录和失败原因</li>
                <li>维护项目资料，保证提交信息可复用</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <SectionTitle title="今日各项目外链情况" description="按项目看今天录入了多少条、哪些已提交、哪些还在审核。" />
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">项目</th>
                    <th className="px-4 py-3 font-medium">今日新增</th>
                    <th className="px-4 py-3 font-medium">已提交</th>
                    <th className="px-4 py-3 font-medium">待审核</th>
                    <th className="px-4 py-3 font-medium">失败</th>
                    <th className="px-4 py-3 font-medium">最新状态</th>
                    <th className="px-4 py-3 font-medium">最后录入</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {todayProjectSummary.length ? (
                    todayProjectSummary.map((item) => (
                      <tr key={item.projectId} className="text-slate-200">
                        <td className="px-4 py-3">{item.projectName}</td>
                        <td className="px-4 py-3 font-semibold text-white">{item.todayTotal}</td>
                        <td className="px-4 py-3">{item.submitted}</td>
                        <td className="px-4 py-3">{item.awaitingReview}</td>
                        <td className="px-4 py-3">{item.failed}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Pill>{item.latestExecutionStatus}</Pill>
                            <Pill>{item.latestReviewStatus}</Pill>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(item.latestRecordedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                        今天还没有录入任何项目外链记录。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <SectionTitle title="本周 / 本月项目追踪" description="按项目看近 7 天或本月的外链上传情况、提交情况和风险。" />
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant={periodView === "7d" ? "primary" : "secondary"} onClick={() => setPeriodView("7d")}>看本周</Button>
            <Button variant={periodView === "month" ? "primary" : "secondary"} onClick={() => setPeriodView("month")}>看本月</Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">项目</th>
                    <th className="px-4 py-3 font-medium">{periodView === "7d" ? "本周新增" : "本月新增"}</th>
                    <th className="px-4 py-3 font-medium">已提交</th>
                    <th className="px-4 py-3 font-medium">待审核</th>
                    <th className="px-4 py-3 font-medium">失败</th>
                    <th className="px-4 py-3 font-medium">最新状态</th>
                    <th className="px-4 py-3 font-medium">最后录入</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {periodProjectSummary.length ? (
                    periodProjectSummary.map((item) => (
                      <tr key={item.projectId} className="text-slate-200">
                        <td className="px-4 py-3">{item.projectName}</td>
                        <td className="px-4 py-3 font-semibold text-white">{item.periodTotal}</td>
                        <td className="px-4 py-3">{item.submitted}</td>
                        <td className="px-4 py-3">{item.awaitingReview}</td>
                        <td className="px-4 py-3">{item.failed}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Pill>{item.latestExecutionStatus}</Pill>
                            <Pill>{item.latestReviewStatus}</Pill>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{new Date(item.latestRecordedAt).toLocaleString("zh-CN")}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-slate-400" colSpan={7}>
                        这个周期还没有任何项目外链记录。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <MetricCard label="总外链数" value={stats.total} subtext="当前筛选范围内" tone="cyan" />
          <MetricCard label="今日新增" value={stats.today} subtext="今天录入 / 发布" tone="violet" />
          <MetricCard label="本周新增" value={stats.week} subtext="最近 7 天" tone="emerald" />
          <MetricCard label="本月新增" value={stats.month} subtext="本月累计" tone="amber" />
          <MetricCard label="已提交数量" value={stats.submitted} subtext="已提交 / 待确认 / 待审核" tone="rose" />
          <MetricCard label="待审核数量" value={stats.awaitingReview} subtext="审核中 / 待审核" tone="cyan" />
          <MetricCard label="通过数量" value={stats.passed} subtext="审核通过" tone="emerald" />
          <MetricCard label="失败数量" value={stats.failed} subtext="拒绝 / 失败" tone="rose" />
          <MetricCard label="通过率" value={`${stats.passRate}%`} subtext="按已检查结果计算" tone="violet" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <TrendChart data={trend} />
          <BarCompareChart data={projectBars} />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <DoughnutChart title="平台类型分布" data={platformPie} />
          <DoughnutChart title="执行状态分布" data={executionPie} />
          <DoughnutChart title="审核状态分布" data={reviewPie} />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <SectionTitle title="最近新增外链" description="快速看最新录入的工作内容、状态和审核结果。" />
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">项目</th>
                    <th className="px-4 py-3 font-medium">平台域名</th>
                    <th className="px-4 py-3 font-medium">平台类型</th>
                    <th className="px-4 py-3 font-medium">执行状态</th>
                    <th className="px-4 py-3 font-medium">审核状态</th>
                    <th className="px-4 py-3 font-medium">录入时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recent.map((item) => (
                    <tr key={item.id} className="text-slate-200">
                      <td className="px-4 py-3">{item.projectName}</td>
                      <td className="px-4 py-3">{item.platformDomain}</td>
                      <td className="px-4 py-3"><Pill>{item.platformType}</Pill></td>
                      <td className="px-4 py-3">{item.executionStatus}</td>
                      <td className="px-4 py-3">{item.reviewStatus}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(item.recordedAt).toLocaleString("zh-CN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
