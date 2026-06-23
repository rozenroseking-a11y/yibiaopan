"use client";

import { useRef, useState } from "react";
import { AppShell } from "../app-shell";
import { ProjectTable } from "../project-table";
import { Button, SectionTitle } from "../ui";
import { useStoredBacklinks, useStoredProjects } from "../use-local-storage-data";
import { DEFAULT_PROJECTS, DEFAULT_BACKLINKS } from "@/lib/mock-data";
import { buildBackup, downloadJson, isAppBackup, readJsonFile } from "@/lib/backup";

export function ProjectsView() {
  const [projects, setProjects] = useStoredProjects();
  const [records, setRecords] = useStoredBacklinks();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadJson(`backlink-dashboard-backup-${new Date().toISOString().slice(0, 10)}.json`, buildBackup(projects, records));
  };

  const openImport = () => fileInputRef.current?.click();

  return (
    <AppShell>
      <div className="space-y-5">
        <SectionTitle
          title="项目资料管理"
          description="维护项目官网、类型、默认 Name、Email 和备注，后续可以快速复制使用。"
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleExport}>
                导出备份
              </Button>
              <Button variant="secondary" onClick={openImport} disabled={importing}>
                导入备份
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setProjects(DEFAULT_PROJECTS);
                  setRecords(DEFAULT_BACKLINKS);
                  alert("已恢复示例数据");
                }}
              >
                恢复初始模板
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImporting(true);
                  try {
                    const payload = await readJsonFile(file);
                    if (!isAppBackup(payload)) {
                      alert("这个文件不是有效的备份文件");
                      return;
                    }
                    setProjects(payload.projects);
                    setRecords(payload.backlinks);
                    alert(`已导入备份：${payload.projects.length} 个项目，${payload.backlinks.length} 条记录`);
                  } catch {
                    alert("导入失败：文件格式不正确或无法读取");
                  } finally {
                    setImporting(false);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          }
        />
        <ProjectTable
          projects={projects}
          backlinks={records}
          onSave={(next) => {
            const exists = projects.some((item) => item.id === next.id);
            const updated = exists ? projects.map((item) => (item.id === next.id ? next : item)) : [next, ...projects];
            setProjects(updated);
          }}
          onDelete={(id) => setProjects(projects.filter((item) => item.id !== id))}
        />
      </div>
    </AppShell>
  );
}
