"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/logaxp/components/ui/card";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Button } from "@/logaxp/components/ui/button";
import { Skeleton } from "@/logaxp/components/ui/skeleton";
import { Badge } from "@/logaxp/components/ui/badge";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";
import type { OrgUnitTreeNode } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { OrgUnitTreeView } from "@/logaxp/components/orgStructure/orgUnits/OrgUnitTreeView";
import { toast } from "@/logaxp/components/ui/toast";
import { RefreshCcw, Network, Building2, Layers3 } from "lucide-react";

function countNodes(list: OrgUnitTreeNode[]): number {
  return list.reduce(
    (acc, n) => acc + 1 + countNodes(Array.isArray(n.children) ? n.children : []),
    0
  );
}

function countRoots(list: OrgUnitTreeNode[]) {
  return Array.isArray(list) ? list.length : 0;
}

function countBranches(list: OrgUnitTreeNode[]): number {
  return list.reduce((acc, n) => {
    const children = Array.isArray(n.children) ? n.children : [];
    return acc + (children.length > 0 ? 1 : 0) + countBranches(children);
  }, 0);
}

export default function OrgUnitsTreePage() {
  const { orgUnits } = useOrgStructure();

  const [nodes, setNodes] = useState<OrgUnitTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orgUnits.treeAll();
      const arr = Array.isArray(res) ? res : ((res as { items?: unknown })?.items ?? []);
      setNodes(Array.isArray(arr) ? (arr as OrgUnitTreeNode[]) : []);
    } catch {
      toast.error("Failed to load org structure tree");
      setNodes([]);
    } finally {
      setLoading(false);
    }
  }, [orgUnits]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    return {
      total: countNodes(nodes),
      roots: countRoots(nodes),
      branches: countBranches(nodes),
    };
  }, [nodes]);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Network className="h-3.5 w-3.5" />
              Organization Structure
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Org Unit Tree
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600 md:text-base">
                Explore your organizational hierarchy with a cleaner, modern tree experience.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {loading ? "Loading..." : `${stats.total} total nodes`}
            </Badge>
            <Button variant="outline" onClick={load} disabled={loading} className="rounded-xl gap-2">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-white/70 p-4 md:grid-cols-3 md:p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-2.5">
                <Layers3 className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Total Nodes</div>
                <div className="text-xl font-semibold text-slate-900">{stats.total}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-2.5">
                <Building2 className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Root Units</div>
                <div className="text-xl font-semibold text-slate-900">{stats.roots}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-2.5">
                <Network className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Branches</div>
                <div className="text-xl font-semibold text-slate-900">{stats.branches}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/80">
          <div className="space-y-1">
            <CardTitle className="text-base md:text-lg">Hierarchy Explorer</CardTitle>
            <CardDescription>
              Search, expand, collapse, and inspect org units across the full structure.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-4 md:p-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-[95%] rounded-2xl" />
              <Skeleton className="h-20 w-[90%] rounded-2xl" />
            </div>
          ) : nodes.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-white p-8">
              <EmptyState
                title="No org structure yet"
                description="Create org units to start building your hierarchy."
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 md:p-4">
              <OrgUnitTreeView nodes={nodes} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}