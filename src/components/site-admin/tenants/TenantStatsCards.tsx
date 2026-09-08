import * as React from "react";
import { Building2, CheckCircle2, PauseCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import type { Tenant } from "@/logaxp/lib/tenants/tenant.types";

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {title}
        </CardTitle>
        <div className="text-slate-400">{icon}</div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export function TenantStatsCards({ tenants }: { tenants: Tenant[] }) {
  const stats = React.useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter((t) => t.status === "ACTIVE").length;
    const suspended = tenants.filter((t) => t.status === "SUSPENDED").length;
    const deleted = tenants.filter((t) => t.status === "DELETED").length;
    return { total, active, suspended, deleted };
  }, [tenants]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total Tenants" value={stats.total} icon={<Building2 className="h-5 w-5" />} />
      <StatCard title="Active" value={stats.active} icon={<CheckCircle2 className="h-5 w-5" />} />
      <StatCard title="Suspended" value={stats.suspended} icon={<PauseCircle className="h-5 w-5" />} />
      <StatCard title="Deleted" value={stats.deleted} icon={<Trash2 className="h-5 w-5" />} />
    </div>
  );
}