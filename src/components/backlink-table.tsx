"use client";

import { useMemo, useState } from "react";
import { BacklinkRecord, Project } from "@/lib/types";
import { Button, Card, Input, Pill, Select, Textarea } from "./ui";
import { dateOnly, niceDate } from "@/lib/analytics";
import { downloadText, recordsToCsv } from "@/lib/export";

const executionStatuses = ["all", "待填写", "已填写待确认", "已提交", "已提交待确认", "待审核", "失败"] as const;
type ExecutionOption = Exclude<(typeof executionStatuses)[number], "all">;
const editableExecutionStatuses: ExecutionOption[] = ["待填写", "已填写待确认", "已提交", "已提交待确认", "待审核", "失败"];

const reviewStatuses = ["all", "未检查", "审核中", "通过", "拒绝", "不确定"] as const;
type ReviewOption = Exclude<(typeof reviewStatuses)[number], "all">;
const editableReviewStatuses: ReviewOption[] = ["未检查", "审核中", "通过", "拒绝", "不确定"];

const platformTypes = ["all", "博客评论", "Contact", "Submit Tool", "Profile", "论坛回复", "资源页", "其他"] as const;
const timePresets = [
  { value: "all", label: "全部" },
  { value: "today", label: "今日" },
  { value: "7d", label: "最近 7 天" },
  { value: "30d", label: "最近 30 天" },
  { value: "month", label: "本月" },
  { value: "custom", label: "自定义" },
] as const;

const NOW_MS = Date.now();

type Tone = "slate" | "cyan" | "emerald" | "amber" | "rose" | "violet";

function statusTone(status: string): Tone {
  if (status === "通过") return "emerald";
  if (status === "拒绝" || status === "失败") return "rose";
  if (status === "审核中" || status === "待审核") return "amber";
  if (status === "已提交" || status === "已提交待确认") return "cyan";
  return "slate";
}

export function BacklinkTable({
  records,
  projects,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  records: BacklinkRecord[];
  projects: Project[];
  onUpdate: (record: BacklinkRecord) => void;
  onDelete: (id: string) => void;
  onDuplicate: (record: BacklinkRecord) => void;
}) {
  const [projectId, setProjectId] = useState("all");
  const [search, setSearch] = useState("");
  const [platformType, setPlatformType] = useState("all");
  const [executionStatus, setExecutionStatus] = useState("all");
  const [reviewStatus, setReviewStatus] = useState("all");
  const [timePreset, setTimePreset] = useState<(typeof timePresets)[number]["value"]>("30d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editing, setEditing] = useState<BacklinkRecord | null>(null);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      if (projectId !== "all" && record.projectId !== projectId) return false;
      if (platformType !== "all" && record.platformType !== platformType) return false;
      if (executionStatus !== "all" && record.executionStatus !== executionStatus) return false;
      if (reviewStatus !== "all" && record.reviewStatus !== reviewStatus) return false;
      if (search) {
        const text = [record.projectName, record.platformDomain, record.sourcePageUrl, record.generatedContent, record.notes].join(" ").toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
      }
      const ts = new Date(record.recordedAt).getTime();
      if (timePreset === "today" && dateOnly(record.recordedAt) !== dateOnly(new Date().toISOString())) return false;
      if (timePreset === "7d" && ts < NOW_MS - 6 * 86400000) return false;
      if (timePreset === "30d" && ts < NOW_MS - 29 * 86400000) return false;
      if (timePreset === "month") {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        if (ts < start.getTime()) return false;
      }
      if (timePreset === "custom" && dateFrom && dateTo) {
        const from = new Date(dateFrom).getTime();
        const to = new Date(`${dateTo}T23:59:59`).getTime();
        if (ts < from || ts > to) return false;
      }
      return true;
    });
  }, [records, projectId, search, platformType, executionStatus, reviewStatus, timePreset, dateFrom, dateTo]);

  return (
    <>
      <Card>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">工作明细台账</h2>
            <p className="mt-1 text-sm text-slate-400">搜索、筛选、编辑、删除、复制记录都在这里，方便给领导复盘。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => downloadText(`backlinks-${new Date().toISOString().slice(0, 10)}.csv`, recordsToCsv(filtered), "text/csv;charset=utf-8")}
            >
              导出当前筛选 CSV
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input placeholder="搜索项目 / 域名 / 页面 / 文案" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="all">全部项目</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </Select>
          <Select value={platformType} onChange={(e) => setPlatformType(e.target.value)}>
            {platformTypes.map((item) => <option key={item} value={item}>{item === "all" ? "全部平台类型" : item}</option>)}
          </Select>
          <Select value={executionStatus} onChange={(e) => setExecutionStatus(e.target.value)}>
            {executionStatuses.map((item) => <option key={item} value={item}>{item === "all" ? "全部执行状态" : item}</option>)}
          </Select>
          <Select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)}>
            {reviewStatuses.map((item) => <option key={item} value={item}>{item === "all" ? "全部审核状态" : item}</option>)}
          </Select>
          <Select value={timePreset} onChange={(e) => setTimePreset(e.target.value as (typeof timePresets)[number]["value"])}>
            {timePresets.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </Card>

      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">项目</th>
                <th className="px-4 py-3 font-medium">平台域名</th>
                <th className="px-4 py-3 font-medium">平台类型</th>
                <th className="px-4 py-3 font-medium">执行状态</th>
                <th className="px-4 py-3 font-medium">审核状态</th>
                <th className="px-4 py-3 font-medium">发布时间</th>
                <th className="px-4 py-3 font-medium">录入时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((record) => (
                <tr key={record.id} className="align-top text-slate-200 hover:bg-white/5">
                  <td className="px-4 py-4">
                    <div className="font-medium text-white">{record.projectName}</div>
                    <div className="mt-1 text-xs text-slate-400">{record.promotionWebsite || "未填写官网"}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div>{record.platformDomain}</div>
                    <div className="mt-1 max-w-72 truncate text-xs text-slate-400">{record.sourcePageUrl}</div>
                  </td>
                  <td className="px-4 py-4"><Pill>{record.platformType}</Pill></td>
                  <td className="px-4 py-4"><Pill tone={statusTone(record.executionStatus)}>{record.executionStatus}</Pill></td>
                  <td className="px-4 py-4"><Pill tone={statusTone(record.reviewStatus)}>{record.reviewStatus}</Pill></td>
                  <td className="px-4 py-4 whitespace-nowrap">{niceDate(record.publishedAt)}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{niceDate(record.recordedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => setEditing(record)}>编辑</Button>
                      <Button variant="ghost" onClick={() => onDuplicate(record)}>复制</Button>
                      <Button variant="danger" onClick={() => onDelete(record.id)}>删除</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-400" colSpan={8}>没有匹配的记录</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">编辑外链记录</h3>
                <p className="text-sm text-slate-400">修改后会同步到本地 localStorage。</p>
              </div>
              <Button variant="ghost" onClick={() => setEditing(null)}>关闭</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">平台域名</span>
                <Input value={editing.platformDomain} onChange={(e) => setEditing({ ...editing, platformDomain: e.target.value })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">来源页面</span>
                <Input value={editing.sourcePageUrl} onChange={(e) => setEditing({ ...editing, sourcePageUrl: e.target.value })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">执行状态</span>
                <Select
                  value={editing.executionStatus}
                  onChange={(e) =>
                    setEditing((current) =>
                      current ? { ...current, executionStatus: e.target.value as BacklinkRecord["executionStatus"] } : current
                    )
                  }
                >
                  {editableExecutionStatuses.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">审核状态</span>
                <Select
                  value={editing.reviewStatus}
                  onChange={(e) =>
                    setEditing((current) =>
                      current ? { ...current, reviewStatus: e.target.value as BacklinkRecord["reviewStatus"] } : current
                    )
                  }
                >
                  {editableReviewStatuses.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-slate-300">生成文案</span>
                <Textarea value={editing.generatedContent} onChange={(e) => setEditing({ ...editing, generatedContent: e.target.value })} />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-slate-300">备注</span>
                <Textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setEditing(null)}>取消</Button>
              <Button
                onClick={() => {
                  onUpdate({ ...editing, updatedAt: new Date().toISOString() });
                  setEditing(null);
                }}
              >
                保存修改
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
