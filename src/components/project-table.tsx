"use client";

import { useMemo, useState } from "react";
import { BacklinkRecord, Project } from "@/lib/types";
import { createProjectId } from "@/lib/mock-data";
import { Button, Card, Input, Pill, Textarea } from "./ui";

export function ProjectTable({
  projects,
  backlinks,
  onSave,
  onDelete,
}: {
  projects: Project[];
  backlinks: BacklinkRecord[];
  onSave: (project: Project) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [adding, setAdding] = useState(false);
  const statsByProject = useMemo(() => {
    return projects.map((project) => {
      const list = backlinks.filter((item) => item.projectId === project.id);
      return {
        id: project.id,
        count: list.length,
        passed: list.filter((item) => item.reviewStatus === "通过").length,
        failed: list.filter((item) => item.reviewStatus === "拒绝" || item.executionStatus === "失败").length,
      };
    });
  }, [projects, backlinks]);

  const emptyProject: Project = {
    id: createProjectId(),
    name: "",
    websiteUrl: "",
    projectType: "",
    defaultSubmitName: "",
    defaultSubmitEmail: "",
    notes: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const projectForm = editing ?? (adding ? emptyProject : null);

  return (
    <>
      <Card>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">项目资料库</h2>
            <p className="mt-1 text-sm text-slate-400">维护项目官网、类型、默认 Name、Email 和备注，便于内部提交和复盘。</p>
          </div>
          <Button onClick={() => setAdding(true)}>新增项目</Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {statsByProject.map((stat) => (
            <div key={stat.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm text-slate-300">{projects.find((p) => p.id === stat.id)?.name}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{stat.count}</div>
              <div className="mt-2 flex gap-2 text-xs text-slate-400">
                <Pill tone="emerald">通过 {stat.passed}</Pill>
                <Pill tone="rose">失败 {stat.failed}</Pill>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {projects.map((project) => {
          const stat = statsByProject.find((item) => item.id === project.id)!;
          return (
            <Card key={project.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">{project.name}</div>
                  <div className="mt-1 text-sm text-slate-400">{project.projectType}</div>
                </div>
                <Pill tone={project.isActive ? "emerald" : "slate"}>{project.isActive ? "启用" : "停用"}</Pill>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div><span className="text-slate-500">官网：</span>{project.websiteUrl || "未填写"}</div>
                <div><span className="text-slate-500">Name：</span>{project.defaultSubmitName || "未填写"}</div>
                <div><span className="text-slate-500">Email：</span>{project.defaultSubmitEmail || "未填写"}</div>
                <div><span className="text-slate-500">备注：</span>{project.notes || "无"}</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone="cyan">总记录 {stat.count}</Pill>
                <Pill tone="emerald">通过 {stat.passed}</Pill>
                <Pill tone="rose">失败 {stat.failed}</Pill>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => setEditing(project)}>编辑</Button>
                <Button variant="danger" onClick={() => onDelete(project.id)}>删除</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {projectForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{adding ? "新增项目" : "编辑项目"}</h3>
                <p className="text-sm text-slate-400">保存后会同步到浏览器 localStorage。</p>
              </div>
              <Button variant="ghost" onClick={() => { setAdding(false); setEditing(null); }}>关闭</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">项目名</span>
                <Input value={projectForm.name} onChange={(e) => {
                  const next = { ...projectForm, name: e.target.value, updatedAt: new Date().toISOString() };
                  setEditing(next);
                }} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">官网</span>
                <Input value={projectForm.websiteUrl} onChange={(e) => setEditing({ ...projectForm, websiteUrl: e.target.value, updatedAt: new Date().toISOString() })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">项目类型</span>
                <Input value={projectForm.projectType} onChange={(e) => setEditing({ ...projectForm, projectType: e.target.value, updatedAt: new Date().toISOString() })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">默认 Name</span>
                <Input value={projectForm.defaultSubmitName} onChange={(e) => setEditing({ ...projectForm, defaultSubmitName: e.target.value, updatedAt: new Date().toISOString() })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">默认 Email</span>
                <Input value={projectForm.defaultSubmitEmail} onChange={(e) => setEditing({ ...projectForm, defaultSubmitEmail: e.target.value, updatedAt: new Date().toISOString() })} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm text-slate-300">是否启用</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
                  value={String(projectForm.isActive)}
                  onChange={(e) => setEditing({ ...projectForm, isActive: e.target.value === "true", updatedAt: new Date().toISOString() })}
                >
                  <option value="true">启用</option>
                  <option value="false">停用</option>
                </select>
              </label>
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm text-slate-300">备注</span>
                <Textarea value={projectForm.notes} onChange={(e) => setEditing({ ...projectForm, notes: e.target.value, updatedAt: new Date().toISOString() })} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setAdding(false); setEditing(null); }}>取消</Button>
              <Button
                onClick={() => {
                  const next = { ...(projectForm as Project), updatedAt: new Date().toISOString() };
                  if (!next.name) return;
                  onSave(next);
                  setAdding(false);
                  setEditing(null);
                }}
              >
                保存项目
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
