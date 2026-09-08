"use client";

import * as React from "react";
import { Search, Plus, RefreshCcw } from "lucide-react";
import { Input } from "@/logaxp/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/logaxp/components/ui/select";
import { Button } from "@/logaxp/components/ui/button";

export type TenantStatusFilter = "ALL" | "ACTIVE" | "SUSPENDED" | "DELETED";

export function TenantFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  pageSize,
  onPageSizeChange,
  onRefresh,
  onCreate,
  loading,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: TenantStatusFilter;
  onStatusChange: (value: TenantStatusFilter) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onRefresh: () => void;
  onCreate: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, slug, plan, timezone..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-[170px]">
            <Select value={status} onValueChange={(v) => onStatusChange(v as TenantStatusFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="DELETED">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[130px]">
            <Select
              value={String(pageSize)}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={onRefresh} loading={loading}>
            {!loading ? <RefreshCcw className="h-4 w-4" /> : null}
            Refresh
          </Button>

          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New Tenant
          </Button>
        </div>
      </div>
    </div>
  );
}