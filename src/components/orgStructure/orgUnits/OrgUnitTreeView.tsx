"use client";

import React, { useMemo, useState } from "react";
import type { OrgUnitTreeNode } from "@/logaxp/lib/orgStructure/orgStructure.types";
import { cn } from "@/logaxp/lib/cn";
import { Button } from "@/logaxp/components/ui/button";
import { Badge } from "@/logaxp/components/ui/badge";
import { Input } from "@/logaxp/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Search,
  UnfoldVertical,
  FoldVertical,
  RotateCcw,
  Building2,
  Layers3,
  Network,
} from "lucide-react";
import { OrgUnitTypeBadge } from "./OrgUnitTypeBadge";
import { toast } from "@/logaxp/components/ui/toast";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getNodeCode(node: OrgUnitTreeNode) {
  return typeof node.code === "string" ? node.code : "";
}

function getChildren(node: OrgUnitTreeNode) {
  return Array.isArray(node.children) ? node.children : [];
}

function hasMatch(node: OrgUnitTreeNode, q: string): boolean {
  if (!q) return true;

  const name = normalize(node.name ?? "");
  const code = normalize(getNodeCode(node));
  const id = normalize(node.id ?? "");

  if (name.includes(q) || code.includes(q) || id.includes(q)) return true;

  return getChildren(node).some((child) => hasMatch(child, q));
}

function countAllNodes(nodes: OrgUnitTreeNode[]): number {
  return nodes.reduce((acc, node) => acc + 1 + countAllNodes(getChildren(node)), 0);
}

function countVisibleMatches(nodes: OrgUnitTreeNode[], q: string): number {
  return nodes.reduce((acc, node) => {
    const self = hasMatch(node, q) ? 1 : 0;
    return acc + self + countVisibleMatches(getChildren(node), q);
  }, 0);
}

function highlightText(text: string, query: string) {
  if (!query) return text;

  const source = text ?? "";
  const lower = source.toLowerCase();
  const q = query.toLowerCase();
  const index = lower.indexOf(q);

  if (index === -1) return source;

  const before = source.slice(0, index);
  const match = source.slice(index, index + q.length);
  const after = source.slice(index + q.length);

  return (
    <>
      {before}
      <mark className="rounded bg-yellow-200/70 px-0.5 text-inherit">{match}</mark>
      {after}
    </>
  );
}

function depthPadding(depth: number) {
  return Math.min(depth * 22, 132);
}

function NodeCard({
  node,
  depth,
  query,
  forceOpen,
}: {
  node: OrgUnitTreeNode;
  depth: number;
  query: string;
  forceOpen: boolean | null;
}) {
  const children = getChildren(node);
  const hasChildren = children.length > 0;

  const [open, setOpen] = useState(depth < 1);
  const effectiveOpen = forceOpen === null ? (query ? true : open) : forceOpen;

  const visible = useMemo(() => hasMatch(node, query), [node, query]);
  if (!visible) return null;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(node.id);
      toast.success("Org unit ID copied");
    } catch {
      toast.error("Unable to copy ID");
    }
  };

  const name = node.name ?? "Unnamed org unit";
  const code = getNodeCode(node);

  return (
    <div className="relative">
      {depth > 0 ? (
        <div
          className="absolute left-0 top-0 bottom-0 w-px bg-slate-200/80"
          style={{ marginLeft: depthPadding(depth) - 12 }}
        />
      ) : null}

      <div className="space-y-2">
        <div
          className="relative rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 transition-all hover:shadow-md hover:border-slate-300"
          style={{ marginLeft: depthPadding(depth) }}
        >
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700">
              {hasChildren ? <Network className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="h-8 w-8 rounded-xl"
                    aria-label={effectiveOpen ? "Collapse node" : "Expand node"}
                  >
                    {effectiveOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Layers3 className="h-4 w-4" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {highlightText(name, query)}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="truncate">ID: {highlightText(node.id, query)}</span>
                    {code ? <span>Code: {highlightText(code, query)}</span> : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {hasChildren ? (
                    <Badge variant="secondary" className="rounded-full px-2.5">
                      {children.length} child{children.length === 1 ? "" : "ren"}
                    </Badge>
                  ) : null}

                  <OrgUnitTypeBadge type={node.type} />

                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={copyId}
                    className="h-8 w-8 rounded-xl text-slate-500 hover:text-slate-900"
                    aria-label="Copy org unit ID"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && effectiveOpen ? (
          <div className="space-y-2">
            {children.map((child) => (
              <NodeCard
                key={child.id}
                node={child}
                depth={depth + 1}
                query={query}
                forceOpen={forceOpen}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function OrgUnitTreeView({ nodes }: { nodes: OrgUnitTreeNode[] }) {
  const safeNodes = useMemo(() => (Array.isArray(nodes) ? nodes : []), [nodes]);

  const [query, setQuery] = useState("");
  const [forceOpen, setForceOpen] = useState<boolean | null>(null);

  const normalizedQuery = useMemo(() => normalize(query), [query]);

  const totalNodes = useMemo(() => countAllNodes(safeNodes), [safeNodes]);
  const visibleMatches = useMemo(
    () => countVisibleMatches(safeNodes, normalizedQuery),
    [safeNodes, normalizedQuery]
  );

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by org unit name, code, or ID..."
              className="h-11 rounded-xl pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {totalNodes} total
            </Badge>

            <Badge variant="secondary" className="rounded-full">
              {visibleMatches} match{visibleMatches === 1 ? "" : "es"}
            </Badge>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setForceOpen(true)}
              className="gap-2 rounded-xl"
            >
              <UnfoldVertical className="h-4 w-4" />
              Expand all
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setForceOpen(false)}
              className="gap-2 rounded-xl"
            >
              <FoldVertical className="h-4 w-4" />
              Collapse all
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setForceOpen(null);
              }}
              className="gap-2 rounded-xl"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {safeNodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            depth={0}
            query={normalizedQuery}
            forceOpen={forceOpen}
          />
        ))}
      </div>
    </div>
  );
}