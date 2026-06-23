"use client";

import { useRouter } from "next/navigation";
import { useStoredBacklinks, useStoredProjects } from "../use-local-storage-data";
import { AppShell } from "../app-shell";
import { BacklinkForm } from "../backlink-form";
import { Button, SectionTitle } from "../ui";

export function NewBacklinkView() {
  const router = useRouter();
  const [projects] = useStoredProjects();
  const [records, setRecords] = useStoredBacklinks();

  return (
    <AppShell>
      <div className="space-y-5">
        <SectionTitle
          title="录入外链"
          description="填写后会加入浏览器 localStorage，方便你做本地演示和复盘。"
          action={<Button variant="secondary" onClick={() => router.push("/backlinks")}>查看总记录</Button>}
        />
        <BacklinkForm
          projects={projects}
          onSave={(record) => {
            setRecords([record, ...records]);
            router.push("/backlinks");
          }}
        />
      </div>
    </AppShell>
  );
}
