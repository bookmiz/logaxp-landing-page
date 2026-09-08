// src/app/portal/boards/[id]/mapping/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RefreshCcw, ArrowRight, Sparkles, Shuffle, LayoutGrid } from "lucide-react";

import { Button } from "@/logaxp/components/ui/button";
import { EmptyState } from "@/logaxp/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/logaxp/components/ui/card";
import { Badge } from "@/logaxp/components/ui/badge";

import { ProjectShell } from "@/logaxp/components/projects/ProjectShell";
import { ProjectCrumbs } from "@/logaxp/components/projects/ProjectCrumbs";
import { normalizeProjectId, withProjectId } from "@/logaxp/lib/project-management/projectContext";

import { unwrapApi, unwrapList } from "@/logaxp/lib/api/unwrap";

import type { Board, BoardColumn, Workflow } from "@/logaxp/lib/project-management/projectManagement.types";

import { useBoard } from "@/logaxp/hooks/boards/useBoard";
import { useBoardColumns } from "@/logaxp/hooks/boards/useBoardColumns";
import { useUpdateBoard } from "@/logaxp/hooks/boards/useBoardMutations";
import { useWorkflows } from "@/logaxp/hooks/workflows/useWorkflows";

import { StatusColumnMappingPanel } from "@/logaxp/components/projects/boards/mapping/StatusColumnMappingPanel";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function BoardMappingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const boardId = typeof params.id === "string" ? params.id : "";

  const boardQuery = useBoard(boardId);
  const board = unwrapApi<Board>(boardQuery.data); // ✅ raw Board OR ApiResponse<Board>

  const projectId = normalizeProjectId(board?.projectId);

  const columnsQuery = useBoardColumns(boardId);
  const columns = React.useMemo(
    () => unwrapList<BoardColumn>(columnsQuery.data).items,
    [columnsQuery.data]
  );

  const workflowsQuery = useWorkflows();
  const workflows = React.useMemo(
    () => unwrapList<Workflow>(workflowsQuery.data).items,
    [workflowsQuery.data]
  );

  const updateBoard = useUpdateBoard(projectId);

  const busy =
    boardQuery.isLoading ||
    columnsQuery.isLoading ||
    workflowsQuery.isLoading ||
    updateBoard.isPending;

  const title = board?.name ? `Mapping • ${String(board.name)}` : "Mapping";

  // Loading shell
  if (boardQuery.isLoading || columnsQuery.isLoading || workflowsQuery.isLoading) {
    return (
      <ProjectShell
        title="Loading…"
        subtitle="Preparing mapping configuration"
        pill="Work • Board • Mapping"
      >
        <div className="space-y-5">
          <ProjectCrumbs
            items={[
              { label: "Work", href: "/portal/work" },
              { label: "Boards", href: "/portal/boards" },
              { label: "Loading…" },
            ]}
          />

          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardContent className="p-10">
              <div className="flex items-center justify-center">
                <RefreshCcw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </ProjectShell>
    );
  }

  return (
    <ProjectShell
      projectId={projectId}
      title={title}
      subtitle="Map workflow statuses to board columns so status changes and Kanban movement stay consistent."
      pill="Work • Board • Mapping"
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => {
              boardQuery.refetch();
              columnsQuery.refetch();
              workflowsQuery.refetch();
            }}
            disabled={busy}
            title="Refresh mapping data"
          >
            <RefreshCcw className={cn("h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>

          <Link href={withProjectId(`/portal/boards/${encodeURIComponent(boardId)}`, projectId)}>
            <Button variant="outline" disabled={busy}>
              Back to board
            </Button>
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <ProjectCrumbs
          items={[
            { label: "Work", href: "/portal/work" },
            {
              label: "Boards",
              href: projectId
                ? `/portal/boards?projectId=${encodeURIComponent(projectId)}`
                : "/portal/boards",
            },
            {
              label: board?.name ? String(board.name) : "Board",
              href: withProjectId(`/portal/boards/${encodeURIComponent(boardId)}`, projectId),
            },
            { label: "Mapping" },
          ]}
        />

        {/* Hero */}
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/15" />
          <div className="pointer-events-none absolute -left-10 -bottom-16 h-52 w-52 rounded-full bg-sky-200/50 blur-3xl dark:bg-sky-500/10" />

          <CardHeader className="relative">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  Board Mapping
                </div>

                <CardTitle className="mt-2 flex items-center gap-2 text-xl">
                  <Shuffle className="h-5 w-5" />
                  Status → Column mapping
                </CardTitle>

                <CardDescription className="mt-1">
                  Keep workflow transitions aligned with how items move across your Kanban columns.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="muted" className="rounded-full">
                  <LayoutGrid className="mr-1 h-3.5 w-3.5" />
                  Columns: {columns.length}
                </Badge>

                <Badge variant="muted" className="rounded-full">
                  Workflows: {workflows.length}
                </Badge>

                <Button
                  variant="outline"
                  onClick={() => router.push(withProjectId(`/portal/boards/${encodeURIComponent(boardId)}`, projectId))}
                  disabled={busy}
                  title="Open board"
                >
                  Open board
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative pt-0">
            <div className="mt-1 h-px w-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
              Tip: Map your{" "}
              <span className="font-medium text-slate-700 dark:text-slate-200">Done</span>{" "}
              status to a terminal column to avoid completed work items appearing in active lanes.
            </div>
          </CardContent>
        </Card>

        {/* Not found */}
        {!board ? (
          <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
            <EmptyState
              title="Board not found"
              description="This board may not exist or you don't have access."
            />
          </div>
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mapping Configuration</CardTitle>
              <CardDescription>
                Board:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {String(board.name ?? board.id)}
                </span>{" "}
                • Project:{" "}
                <span className="font-mono text-xs text-slate-700 dark:text-slate-200">
                  {projectId || "—"}
                </span>
              </CardDescription>
            </CardHeader>

           <CardContent
            className={cn(
                "space-y-4 mb-10", // add bottom margin to account for absolute-positioned save button
                // ✅ make this card independently scrollable & accessible
                "max-h-[calc(100vh-260px)] overflow-auto pr-1"
            )}
            >
            <StatusColumnMappingPanel
                board={board}
                columns={columns}
                workflows={workflows}
                busy={updateBoard.isPending}
                onSaveBoardMetadata={async (metadata) => {
                await updateBoard.mutateAsync({ id: boardId, dto: { metadata } as any });
                }}
            />
            </CardContent>
          </Card>
        )}
      </div>
    </ProjectShell>
  );
}
