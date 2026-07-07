export type Project = {
  id: string;
  name: string;
  websiteUrl: string;
  projectType: string;
  defaultSubmitName: string;
  defaultSubmitEmail: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalBacklinks?: number;
  submittedCount?: number;
  approvedCount?: number;
  reviewingCount?: number;
  failedCount?: number;
  lastRecordedAt?: string;
};

export type PlatformType =
  | "博客评论"
  | "Contact"
  | "Submit Tool"
  | "Profile"
  | "论坛回复"
  | "资源页"
  | "其他";

export type ExecutionStatus =
  | "待填写"
  | "已填写待确认"
  | "已提交"
  | "已提交待确认"
  | "待审核"
  | "失败";

export type ReviewStatus =
  | "未检查"
  | "审核中"
  | "通过"
  | "拒绝"
  | "不确定";

export type TimePreset = "all" | "today" | "7d" | "30d" | "month" | "custom";

export type BacklinkRecord = {
  id: string;
  projectId: string;
  projectName: string;
  promotionWebsite: string;
  submitName: string;
  submitEmail: string;
  platformDomain: string;
  sourcePageUrl: string;
  platformType: PlatformType;
  recommendedMethod: string;
  generatedContent: string;
  executionStatus: ExecutionStatus;
  reviewStatus: ReviewStatus;
  publishedAt: string;
  recordedAt: string;
  indexedUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardFilters = {
  projectId: string;
  timePreset: TimePreset;
  dateFrom: string;
  dateTo: string;
  search: string;
  platformType: string;
  executionStatus: string;
  reviewStatus: string;
};
