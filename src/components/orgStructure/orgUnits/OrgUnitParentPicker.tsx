"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Button } from "@/logaxp/components/ui/button";
import { useOrgStructure } from "@/logaxp/hooks/useOrgStructure";
import type { OrgUnitTreeNode } from "@/logaxp/lib/orgStructure/orgStructure.types";
import {
  SelectField,
  type SelectOption,
} from "@/logaxp/components/orgStructure/shared/SelectField";
import { toast } from "@/logaxp/components/ui/toast";

function normalizeTreePayload(res: any): OrgUnitTreeNode[] {
  // supports:
  // - OrgUnitTreeNode[]
  // - OrgUnitTreeNode
  // - { items: OrgUnitTreeNode[] }
  // - AxiosResponse<{...}> or AxiosResponse<OrgUnitTreeNode[]>
  const data = res?.data ?? res;

  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (typeof data === "object") return [data as OrgUnitTreeNode];

  return [];
}

function collectSubtreeIds(node: OrgUnitTreeNode | null): Set<string> {
  const ids = new Set<string>();
  if (!node) return ids;

  const stack: OrgUnitTreeNode[] = [node];
  while (stack.length) {
    const cur = stack.pop()!;
    ids.add(cur.id);
    if (Array.isArray(cur.children)) {
      for (const c of cur.children) stack.push(c);
    }
  }
  return ids;
}

function findNodeById(nodes: OrgUnitTreeNode[], id: string): OrgUnitTreeNode | null {
  const stack = [...nodes];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur.id === id) return cur;
    if (Array.isArray(cur.children)) {
      for (const c of cur.children) stack.push(c);
    }
  }
  return null;
}

function flattenTree(
  nodes: OrgUnitTreeNode[] = [],
  blocked: Set<string>,
  depth = 0,
  out: Array<{ id: string; label: string }> = []
) {
  for (const n of nodes) {
    if (!blocked.has(n.id)) {
      out.push({
        id: n.id,
        label: `${"—".repeat(depth)} ${n.name ?? "(unnamed)"}`.trim(),
      });
      if (Array.isArray(n.children) && n.children.length) {
        flattenTree(n.children, blocked, depth + 1, out);
      }
    } else {
      // if the node is blocked, also block its children display
      // (they are included in blocked set anyway if we built it from subtree)
      continue;
    }
  }
  return out;
}

export function OrgUnitParentPicker({
  value,
  onChange,
  excludeId,
  label = "Parent (optional)",
}: {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  excludeId?: string; // avoid selecting self (and its descendants)
  label?: string;
}) {
  const { orgUnits } = useOrgStructure();

  const [tree, setTree] = useState<OrgUnitTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orgUnits.treeAll();
      const nodes = normalizeTreePayload(res);
      setTree(nodes);
    } catch {
      toast.error("Failed to load org units (parent picker)");
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, [orgUnits]);

  // ✅ auto-load once, but without useEffect dependency drama
  // (runs once per mount)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await orgUnits.treeAll();
        if (!alive) return;
        setTree(normalizeTreePayload(res));
      } catch {
        if (!alive) return;
        toast.error("Failed to load org units (parent picker)");
        setTree([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blockedIds = useMemo(() => {
    if (!excludeId) return new Set<string>();
    const selfNode = findNodeById(tree, excludeId);
    return collectSubtreeIds(selfNode); // self + descendants
  }, [tree, excludeId]);

  const options: SelectOption[] = useMemo(() => {
    const flat = flattenTree(tree, blockedIds);

    // ✅ include an explicit "root" option so users can clear parent easily
    const base: SelectOption[] = [{ value: "", label: "No parent (root)" }];

    for (const x of flat) base.push({ value: x.id, label: x.label });

    return base;
  }, [tree, blockedIds]);

  const selected = value ?? "";

  return (
    <div className="space-y-2">
      <SelectField
        label={label}
        value={selected}
        onChange={(v) => onChange(v ? v : null)}
        options={options}
        placeholder={loading ? "Loading org units..." : "Select a parent"}
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {loading
            ? "Loading..."
            : options.length <= 1
            ? "No org units available to select as parent."
            : `Available parents: ${options.length - 1}`}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={load}
          disabled={loading}
          className="h-7 px-2"
        >
          Reload
        </Button>
      </div>
    </div>
  );
}