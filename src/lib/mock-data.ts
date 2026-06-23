import { BacklinkRecord, ExecutionStatus, PlatformType, Project, ReviewStatus } from "./types";

export const PLATFORM_TYPES: PlatformType[] = [
  "博客评论",
  "Contact",
  "Submit Tool",
  "Profile",
  "论坛回复",
  "资源页",
  "其他",
];

export const EXECUTION_STATUSES: ExecutionStatus[] = [
  "待填写",
  "已填写待确认",
  "已提交",
  "已提交待确认",
  "待审核",
  "失败",
];

export const REVIEW_STATUSES: ReviewStatus[] = [
  "未检查",
  "审核中",
  "通过",
  "拒绝",
  "不确定",
];

const now = new Date();
const iso = (daysAgo: number, hour = 10, minute = 30) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj_omnigemini",
    name: "omnigemini",
    websiteUrl: "https://omnigemini.io/",
    projectType: "AI Gemini / AI Content Tool",
    defaultSubmitName: "Iria",
    defaultSubmitEmail: "meimei9961@126.com",
    notes: "主站项目，优先投博客评论、Profile、资源页。",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "proj_omnivideo",
    name: "OmniVideo",
    websiteUrl: "https://omnivideo.studio/",
    projectType: "AI Video Studio / AI Video Generator",
    defaultSubmitName: "Jake",
    defaultSubmitEmail: "jakebaby98@126.com",
    notes: "视频生成工具方向，适合资源页和 Submit Tool。",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "proj_banana",
    name: "banana",
    websiteUrl: "",
    projectType: "AI Image / AI Creative Tool",
    defaultSubmitName: "",
    defaultSubmitEmail: "",
    notes: "待补充官网和常用提交信息。",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "proj_seedance",
    name: "seedance2video.ai",
    websiteUrl: "https://seedance2video.ai/",
    projectType: "AI Video Generator / Seedance AI Video Tool",
    defaultSubmitName: "",
    defaultSubmitEmail: "",
    notes: "新项目，先沉淀平台库和外链模板。",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];

export const DEFAULT_BACKLINKS: BacklinkRecord[] = [
  {
    id: "bk_001",
    projectId: "proj_omnigemini",
    projectName: "omnigemini",
    promotionWebsite: "https://omnigemini.io/",
    submitName: "Iria",
    submitEmail: "meimei9961@126.com",
    platformDomain: "producthunt.com",
    sourcePageUrl: "https://www.producthunt.com/products/omnigemini",
    platformType: "Submit Tool",
    recommendedMethod: "提交产品页并补充一句核心卖点，适合 AI 内容工具。",
    generatedContent: "OmniGemini is an AI Gemini content assistant for faster writing and idea generation.",
    executionStatus: "已提交",
    reviewStatus: "审核中",
    publishedAt: iso(0, 9, 15),
    recordedAt: iso(0, 9, 20),
    indexedUrl: "",
    notes: "等待审核结果。",
    createdAt: iso(0, 9, 20),
    updatedAt: iso(0, 9, 20),
  },
  {
    id: "bk_002",
    projectId: "proj_omnigemini",
    projectName: "omnigemini",
    promotionWebsite: "https://omnigemini.io/",
    submitName: "Iria",
    submitEmail: "meimei9961@126.com",
    platformDomain: "medium.com",
    sourcePageUrl: "https://medium.com/@author/ai-content-tools-roundup",
    platformType: "博客评论",
    recommendedMethod: "在相关文章下留言，附带场景化痛点，不要直接堆链接。",
    generatedContent: "Great list — OmniGemini also helps me turn rough ideas into polished content quickly.",
    executionStatus: "已提交待确认",
    reviewStatus: "未检查",
    publishedAt: iso(1, 15, 40),
    recordedAt: iso(1, 15, 45),
    indexedUrl: "",
    notes: "已留痕，后续补查。",
    createdAt: iso(1, 15, 45),
    updatedAt: iso(1, 15, 45),
  },
  {
    id: "bk_003",
    projectId: "proj_omnigemini",
    projectName: "omnigemini",
    promotionWebsite: "https://omnigemini.io/",
    submitName: "Iria",
    submitEmail: "meimei9961@126.com",
    platformDomain: "indiehackers.com",
    sourcePageUrl: "https://www.indiehackers.com/product/omnigemini",
    platformType: "Profile",
    recommendedMethod: "在 profile/产品页中补齐官网与简介。",
    generatedContent: "Building OmniGemini, an AI Gemini content tool for faster drafts and content ideation.",
    executionStatus: "已提交",
    reviewStatus: "通过",
    publishedAt: iso(3, 12, 0),
    recordedAt: iso(3, 12, 5),
    indexedUrl: "https://www.indiehackers.com/product/omnigemini",
    notes: "已通过，可复盘。",
    createdAt: iso(3, 12, 5),
    updatedAt: iso(3, 12, 5),
  },
  {
    id: "bk_004",
    projectId: "proj_omnivideo",
    projectName: "OmniVideo",
    promotionWebsite: "https://omnivideo.studio/",
    submitName: "Jake",
    submitEmail: "jakebaby98@126.com",
    platformDomain: "saashub.com",
    sourcePageUrl: "https://saashub.com/ai-video-tools",
    platformType: "Submit Tool",
    recommendedMethod: "工具目录提交通常需要短简介和分类准确。",
    generatedContent: "OmniVideo is an AI video studio that helps creators generate videos faster.",
    executionStatus: "已提交",
    reviewStatus: "通过",
    publishedAt: iso(2, 10, 10),
    recordedAt: iso(2, 10, 12),
    indexedUrl: "https://saashub.com/omnivideo",
    notes: "目录页已收录。",
    createdAt: iso(2, 10, 12),
    updatedAt: iso(2, 10, 12),
  },
  {
    id: "bk_005",
    projectId: "proj_omnivideo",
    projectName: "OmniVideo",
    promotionWebsite: "https://omnivideo.studio/",
    submitName: "Jake",
    submitEmail: "jakebaby98@126.com",
    platformDomain: "x.com",
    sourcePageUrl: "https://x.com/search?q=ai%20video%20tool",
    platformType: "其他",
    recommendedMethod: "适合做话题互动或回复，不适合硬广。",
    generatedContent: "OmniVideo makes AI video creation much easier for quick concept tests.",
    executionStatus: "失败",
    reviewStatus: "拒绝",
    publishedAt: iso(4, 18, 5),
    recordedAt: iso(4, 18, 12),
    indexedUrl: "",
    notes: "平台内容限制较强。",
    createdAt: iso(4, 18, 12),
    updatedAt: iso(4, 18, 12),
  },
  {
    id: "bk_006",
    projectId: "proj_banana",
    projectName: "banana",
    promotionWebsite: "",
    submitName: "",
    submitEmail: "",
    platformDomain: "designernews.co",
    sourcePageUrl: "https://www.designernews.co/stories/ai-image-tools",
    platformType: "论坛回复",
    recommendedMethod: "先观察帖子的语气，回答经验再带产品。",
    generatedContent: "I have been testing a few AI image tools recently and will share one that works well for quick mockups.",
    executionStatus: "已填写待确认",
    reviewStatus: "不确定",
    publishedAt: iso(2, 16, 50),
    recordedAt: iso(2, 16, 55),
    indexedUrl: "",
    notes: "banana 信息待补全。",
    createdAt: iso(2, 16, 55),
    updatedAt: iso(2, 16, 55),
  },
  {
    id: "bk_007",
    projectId: "proj_seedance",
    projectName: "seedance2video.ai",
    promotionWebsite: "https://seedance2video.ai/",
    submitName: "",
    submitEmail: "",
    platformDomain: "awesometool.com",
    sourcePageUrl: "https://awesometool.com/ai-video-tools",
    platformType: "资源页",
    recommendedMethod: "资源页偏向短描述 + 类别标签 + 关键字。",
    generatedContent: "Seedance2Video helps turn text and images into polished videos quickly.",
    executionStatus: "待审核",
    reviewStatus: "审核中",
    publishedAt: iso(0, 14, 10),
    recordedAt: iso(0, 14, 20),
    indexedUrl: "",
    notes: "新项目样本记录。",
    createdAt: iso(0, 14, 20),
    updatedAt: iso(0, 14, 20),
  },
  {
    id: "bk_008",
    projectId: "proj_seedance",
    projectName: "seedance2video.ai",
    promotionWebsite: "https://seedance2video.ai/",
    submitName: "",
    submitEmail: "",
    platformDomain: "reddit.com",
    sourcePageUrl: "https://www.reddit.com/r/aitools/comments/example",
    platformType: "论坛回复",
    recommendedMethod: "回复时先解决问题，再提及工具，不要只贴链接。",
    generatedContent: "If you're comparing AI video generators, Seedance2Video is worth a look for quick experiments.",
    executionStatus: "已提交待确认",
    reviewStatus: "未检查",
    publishedAt: iso(5, 11, 40),
    recordedAt: iso(5, 11, 45),
    indexedUrl: "",
    notes: "等待观察展示情况。",
    createdAt: iso(5, 11, 45),
    updatedAt: iso(5, 11, 45),
  },
  {
    id: "bk_009",
    projectId: "proj_seedance",
    projectName: "seedance2video.ai",
    promotionWebsite: "https://seedance2video.ai/",
    submitName: "",
    submitEmail: "",
    platformDomain: "capterra.com",
    sourcePageUrl: "https://www.capterra.com/p/ai-video-generator/",
    platformType: "Submit Tool",
    recommendedMethod: "目录类提交需要更正式的描述和分类。",
    generatedContent: "Seedance2Video is an AI video generator for converting scripts into marketing-ready videos.",
    executionStatus: "失败",
    reviewStatus: "拒绝",
    publishedAt: iso(7, 9, 5),
    recordedAt: iso(7, 9, 10),
    indexedUrl: "",
    notes: "信息不完整导致拒绝。",
    createdAt: iso(7, 9, 10),
    updatedAt: iso(7, 9, 10),
  },
];

export const STORAGE_KEYS = {
  projects: "backlink-dashboard-projects-v1",
  backlinks: "backlink-dashboard-backlinks-v1",
};

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return DEFAULT_PROJECTS;
  const raw = window.localStorage.getItem(STORAGE_KEYS.projects);
  if (!raw) return DEFAULT_PROJECTS;
  try {
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_PROJECTS;
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
}

export function loadBacklinks(): BacklinkRecord[] {
  if (typeof window === "undefined") return DEFAULT_BACKLINKS;
  const raw = window.localStorage.getItem(STORAGE_KEYS.backlinks);
  if (!raw) return DEFAULT_BACKLINKS;
  try {
    const parsed = JSON.parse(raw) as BacklinkRecord[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_BACKLINKS;
  } catch {
    return DEFAULT_BACKLINKS;
  }
}

export function saveBacklinks(records: BacklinkRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.backlinks, JSON.stringify(records));
}

export function createProjectId() {
  return `proj_${Math.random().toString(36).slice(2, 10)}`;
}

export function createBacklinkId() {
  return `bk_${Math.random().toString(36).slice(2, 10)}`;
}
