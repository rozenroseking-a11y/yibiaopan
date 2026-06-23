"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "../app-shell";
import { BacklinkTable } from "../backlink-table";
import { Button, SectionTitle } from "../ui";
import { useStoredBacklinks, useStoredProjects } from "../use-local-storage-data";

export function BacklinksView() {
  const router = useRouter();
  const [projects] = useStoredProjects();
  const [records, setRecords] = useStoredBacklinks();

  return (
    <AppShell>
      <div className="space-y-5">
        <SectionTitle
          title="外链总记录"
          description="搜索、筛选、编辑、删除、复制记录都在这里。"
          action={<Button onClick={() => router.push("/backlinks/new")}>+ 录入外链</Button>}
        />
        <BacklinkTable
          records={records}
          projects={projects}
          onUpdate={(next) => setRecords(records.map((item) => (item.id === next.id ? next : item)))}
          onDelete={(id) => setRecords(records.filter((item) => item.id !== id))}
          onDuplicate={(record) =>
            setRecords([
              { ...record, id: `bk_${Math.random().toString(36).slice(2, 10)}`, recordedAt: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
              ...records,
            ])
          }
        />
      </div>
    </AppShell>
  );
}
