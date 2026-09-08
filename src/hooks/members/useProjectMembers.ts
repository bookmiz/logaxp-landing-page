// src/hooks/useProjectMembers.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import { projectManagementService } from "@/logaxp/lib/project-management/projectManagementService";
import type { AddProjectMemberDto, ProjectMember } from "@/logaxp/lib/project-management/projectManagement.types";

export function useProjectMembers(projectId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } }; message?: string } | Error;
      const msg = (error && 'response' in error ? error.response?.data?.message : undefined) || 
                  (error instanceof Error ? error.message : "Something went wrong");
      setError(String(msg));
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const listMembers = useCallback(async () => {
    if (!projectId) throw new Error("No project ID");
    return wrap(async () => {
      const response = await projectManagementService.projectMembers.list(projectId);
      return response.data; // The service wraps in ApiResponse, so we need .data
    });
  }, [wrap, projectId]);

  const addMember = useCallback(async (dto: AddProjectMemberDto) => {
    if (!projectId) throw new Error("No project ID");
    return wrap(async () => {
      const response = await projectManagementService.projectMembers.add(projectId, dto);
      return response.data;
    });
  }, [wrap, projectId]);

  const changeRole = useCallback(async (projectMemberId: string, role: string) => {
    return wrap(async () => {
      const response = await projectManagementService.projectMembers.changeRole(projectMemberId, { role });
      return response.data;
    });
  }, [wrap]);

  const removeMember = useCallback(async (projectMemberId: string) => {
    return wrap(async () => {
      const response = await projectManagementService.projectMembers.remove(projectMemberId);
      return response.data;
    });
  }, [wrap]);

  return useMemo(
    () => ({
      loading,
      error,
      listMembers,
      addMember,
      changeRole,
      removeMember,
    }),
    [loading, error, listMembers, addMember, changeRole, removeMember]
  );
}