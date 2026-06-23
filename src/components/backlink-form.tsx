"use client";

import { useMemo, useState } from "react";
import { BacklinkRecord, Project } from "@/lib/types";
import { createBacklinkId, EXECUTION_STATUSES, PLATFORM_TYPES, REVIEW_STATUSES } from "@/lib/mock-data";
import { Button, Card, Input, Select, Textarea } from "./ui";

export function BacklinkForm({ projects, onSave }: { projects: Project[]; onSave: (record: BacklinkRecord) => void }) {
  const firstProject = useMemo(() => projects.find((p) => p.isActive) ?? projects[0], [projects]);
  const [projectId, setProjectId] = useState(firstProject?.id ?? "");
  const selectedProject = projects.find((project) => project.id === projectId) ?? firstProject;
  const [form, setForm] = useState({
    platformDomain: "",
    sourcePageUrl: "",
    platformType: "Submit Tool" as (typeof PLATFORM_TYPES)[number],
    recommendedMethod: "",
    generatedContent: "",
    executionStatus: "待填写" as (typeof EXECUTION_STATUSES)[number],
    reviewStatus: "未检查" as (typeof REVIEW_STATUSES)[number],
    publishedAt: new Date().toISOString().slice(0, 16),
    indexedUrl: "",
    notes: "",
  });

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">登记工作记录</h2>
        <p className="mt-1 text-sm text-slate-400">这里只做内部登记，不会自动提交到任何平台。</p>
      </div>

      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!selectedProject) return;
          const now = new Date().toISOString();
          onSave({
            id: createBacklinkId(),
            projectId: selectedProject.id,
            projectName: selectedProject.name,
            promotionWebsite: selectedProject.websiteUrl,
            submitName: selectedProject.defaultSubmitName,
            submitEmail: selectedProject.defaultSubmitEmail,
            platformDomain: form.platformDomain,
            sourcePageUrl: form.sourcePageUrl,
            platformType: form.platformType,
            recommendedMethod: form.recommendedMethod,
            generatedContent: form.generatedContent,
            executionStatus: form.executionStatus,
            reviewStatus: form.reviewStatus,
            publishedAt: new Date(form.publishedAt).toISOString(),
            recordedAt: now,
            indexedUrl: form.indexedUrl,
            notes: form.notes,
            createdAt: now,
            updatedAt: now,
          });
          setForm((prev) => ({
            ...prev,
            platformDomain: "",
            sourcePageUrl: "",
            recommendedMethod: "",
            generatedContent: "",
            indexedUrl: "",
            notes: "",
          }));
        }}
      >
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-slate-300">项目名</span>
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">推广网站</span>
          <Input value={selectedProject?.websiteUrl ?? ""} readOnly />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Name</span>
          <Input value={selectedProject?.defaultSubmitName ?? ""} readOnly />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Email</span>
          <Input value={selectedProject?.defaultSubmitEmail ?? ""} readOnly />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">平台域名</span>
          <Input value={form.platformDomain} onChange={(e) => setForm({ ...form, platformDomain: e.target.value })} placeholder="example.com" required />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-slate-300">来源页面</span>
          <Input value={form.sourcePageUrl} onChange={(e) => setForm({ ...form, sourcePageUrl: e.target.value })} placeholder="https://example.com/page" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">平台类型</span>
          <Select value={form.platformType} onChange={(e) => setForm({ ...form, platformType: e.target.value as (typeof PLATFORM_TYPES)[number] })}>
            {PLATFORM_TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">推荐发布方式</span>
          <Input value={form.recommendedMethod} onChange={(e) => setForm({ ...form, recommendedMethod: e.target.value })} placeholder="例如：简短评论 + 场景化说明" />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-slate-300">生成文案</span>
          <Textarea value={form.generatedContent} onChange={(e) => setForm({ ...form, generatedContent: e.target.value })} placeholder="Paste / draft your copy here" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">执行状态</span>
          <Select value={form.executionStatus} onChange={(e) => setForm({ ...form, executionStatus: e.target.value as (typeof EXECUTION_STATUSES)[number] })}>
            {EXECUTION_STATUSES.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">审核状态</span>
          <Select value={form.reviewStatus} onChange={(e) => setForm({ ...form, reviewStatus: e.target.value as (typeof REVIEW_STATUSES)[number] })}>
            {REVIEW_STATUSES.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">发布时间</span>
          <Input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">实际收录页</span>
          <Input value={form.indexedUrl} onChange={(e) => setForm({ ...form, indexedUrl: e.target.value })} placeholder="https://..." />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm text-slate-300">备注</span>
          <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="记录审核、失败原因、复盘点等" />
        </label>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit">保存到本地记录</Button>
        </div>
      </form>
    </Card>
  );
}
