import { format, isAfter, isBefore, startOfMonth, startOfToday, subDays } from "date-fns";
import { BacklinkRecord, DashboardFilters, Project } from "./types";

export function niceDate(value: string) {
  return format(new Date(value), "yyyy-MM-dd HH:mm");
}

export function dateOnly(value: string) {
  return format(new Date(value), "yyyy-MM-dd");
}

export function buildDateRange(filters: DashboardFilters) {
  const today = startOfToday();
  if (filters.timePreset === "today") return { from: today, to: new Date(today.getTime() + 86400000) };
  if (filters.timePreset === "7d") return { from: subDays(today, 6), to: new Date(today.getTime() + 86400000) };
  if (filters.timePreset === "30d") return { from: subDays(today, 29), to: new Date(today.getTime() + 86400000) };
  if (filters.timePreset === "month") return { from: startOfMonth(today), to: new Date(today.getTime() + 86400000) };
  if (filters.timePreset === "custom" && filters.dateFrom && filters.dateTo) {
    return { from: new Date(filters.dateFrom), to: new Date(`${filters.dateTo}T23:59:59`) };
  }
  return null;
}

export function filterRecords(records: BacklinkRecord[], filters: DashboardFilters) {
  const dateRange = buildDateRange(filters);
  return records.filter((record) => {
    if (filters.projectId !== "all" && record.projectId !== filters.projectId) return false;
    if (filters.platformType !== "all" && record.platformType !== filters.platformType) return false;
    if (filters.executionStatus !== "all" && record.executionStatus !== filters.executionStatus) return false;
    if (filters.reviewStatus !== "all" && record.reviewStatus !== filters.reviewStatus) return false;
    if (filters.search) {
      const haystack = [
        record.projectName,
        record.platformDomain,
        record.sourcePageUrl,
        record.generatedContent,
        record.notes,
        record.indexedUrl,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(filters.search.toLowerCase())) return false;
    }
    if (dateRange) {
      const value = new Date(record.recordedAt);
      if (isBefore(value, dateRange.from)) return false;
      if (isAfter(value, dateRange.to)) return false;
    }
    return true;
  });
}

export function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  const map = new Map<string, number>();
  for (const item of items) {
    const value = String(item[key] ?? "未知");
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function computeStats(records: BacklinkRecord[]) {
  const now = new Date();
  const todayKey = format(now, "yyyy-MM-dd");
  const weekStart = subDays(startOfToday(), 6);
  const monthStart = startOfMonth(now);
  const total = records.length;
  const today = records.filter((r) => dateOnly(r.recordedAt) === todayKey).length;
  const week = records.filter((r) => !isBefore(new Date(r.recordedAt), weekStart)).length;
  const month = records.filter((r) => !isBefore(new Date(r.recordedAt), monthStart)).length;
  const submitted = records.filter((r) => ["已提交", "已提交待确认", "待审核"].includes(r.executionStatus)).length;
  const awaitingReview = records.filter((r) => r.reviewStatus === "审核中" || r.executionStatus === "待审核").length;
  const passed = records.filter((r) => r.reviewStatus === "通过").length;
  const failed = records.filter((r) => r.executionStatus === "失败" || r.reviewStatus === "拒绝").length;
  const checked = records.filter((r) => ["通过", "拒绝"].includes(r.reviewStatus)).length;
  const passRate = checked ? Math.round((passed / checked) * 1000) / 10 : 0;
  return { total, today, week, month, submitted, awaitingReview, passed, failed, passRate };
}

export function buildDailyTrend(records: BacklinkRecord[], days = 14) {
  const list: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(startOfToday(), i);
    const key = format(d, "yyyy-MM-dd");
    list.push({ date: key, value: records.filter((r) => dateOnly(r.recordedAt) === key).length });
  }
  return list;
}

export function buildProjectComparison(records: BacklinkRecord[], projects: Project[]) {
  return projects.map((project) => ({
    name: project.name,
    value: records.filter((record) => record.projectId === project.id).length,
  }));
}

export function buildRecent(records: BacklinkRecord[], limit = 8) {
  return [...records].sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt)).slice(0, limit);
}

export function buildTodayProjectSummary(records: BacklinkRecord[], projects: Project[]) {
  const today = startOfToday();
  const tomorrow = new Date(today.getTime() + 86400000);

  return projects
    .map((project) => {
      const todayRecords = records
        .filter((record) => record.projectId === project.id)
        .filter((record) => {
          const value = new Date(record.recordedAt);
          return !isBefore(value, today) && isBefore(value, tomorrow);
        })
        .sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt));

      const submitted = todayRecords.filter((record) => ["已提交", "已提交待确认", "待审核"].includes(record.executionStatus)).length;
      const awaitingReview = todayRecords.filter((record) => record.reviewStatus === "审核中" || record.executionStatus === "待审核").length;
      const failed = todayRecords.filter((record) => record.executionStatus === "失败" || record.reviewStatus === "拒绝").length;
      const latest = todayRecords[0];

      return {
        projectId: project.id,
        projectName: project.name,
        todayTotal: todayRecords.length,
        submitted,
        awaitingReview,
        failed,
        latestRecordedAt: latest?.recordedAt ?? "",
        latestExecutionStatus: latest?.executionStatus ?? "未更新",
        latestReviewStatus: latest?.reviewStatus ?? "未检查",
      };
    })
    .filter((item) => item.todayTotal > 0)
    .sort((a, b) => b.todayTotal - a.todayTotal || +new Date(b.latestRecordedAt || 0) - +new Date(a.latestRecordedAt || 0));
}

export function buildProjectPeriodSummary(records: BacklinkRecord[], projects: Project[], period: "7d" | "month") {
  const today = startOfToday();
  const from = period === "7d" ? subDays(today, 6) : startOfMonth(today);
  const to = new Date(today.getTime() + 86400000);

  return projects
    .map((project) => {
      const periodRecords = records
        .filter((record) => record.projectId === project.id)
        .filter((record) => {
          const value = new Date(record.recordedAt);
          return !isBefore(value, from) && isBefore(value, to);
        })
        .sort((a, b) => +new Date(b.recordedAt) - +new Date(a.recordedAt));

      const submitted = periodRecords.filter((record) => ["已提交", "已提交待确认", "待审核"].includes(record.executionStatus)).length;
      const awaitingReview = periodRecords.filter((record) => record.reviewStatus === "审核中" || record.executionStatus === "待审核").length;
      const failed = periodRecords.filter((record) => record.executionStatus === "失败" || record.reviewStatus === "拒绝").length;
      const latest = periodRecords[0];

      return {
        projectId: project.id,
        projectName: project.name,
        periodTotal: periodRecords.length,
        submitted,
        awaitingReview,
        failed,
        latestRecordedAt: latest?.recordedAt ?? "",
        latestExecutionStatus: latest?.executionStatus ?? "未更新",
        latestReviewStatus: latest?.reviewStatus ?? "未检查",
      };
    })
    .filter((item) => item.periodTotal > 0)
    .sort((a, b) => b.periodTotal - a.periodTotal || +new Date(b.latestRecordedAt || 0) - +new Date(a.latestRecordedAt || 0));
}
