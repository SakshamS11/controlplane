"use client";

import { ShieldCheck } from "lucide-react";
import { Card, PageHeader, Section, StatusBadge, useAppState } from "@/components/ui";
import { departments, permissionModels } from "@/lib/mock-data";

export default function DepartmentsPage() {
  const { permissions, togglePermission } = useAppState();
  return (
    <>
      <PageHeader eyebrow="Governance" title="Departments and model access" description="Model permissions are enforced consistently across chat interfaces, APIs, workflows, and applications." />
      <Section>
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <ShieldCheck size={18} className="text-cyan-700" />
            <div className="font-semibold">Permission matrix</div>
          </div>
          <div className="overflow-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Department</th>
                  {permissionModels.map((model) => <th key={model} className="px-4 py-3">{model}</th>)}
                  <th className="px-4 py-3">Policy state</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((department) => (
                  <tr key={department}>
                    <td className="px-4 py-4 font-semibold">{department}</td>
                    {permissionModels.map((model) => (
                      <td key={model} className="px-4 py-4">
                        <button onClick={() => togglePermission(department, model)} className={`h-6 w-11 rounded-full p-1 transition ${permissions[department][model] ? "bg-cyan-600" : "bg-slate-300"}`}>
                          <span className={`block h-4 w-4 rounded-full bg-white transition ${permissions[department][model] ? "translate-x-5" : ""}`} />
                        </button>
                      </td>
                    ))}
                    <td className="px-4 py-4"><StatusBadge value="Enforced" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>
    </>
  );
}
