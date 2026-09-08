// src/logaxp/hooks/uploads.hooks.ts

"use client";

import * as React from "react";
import { uploadsService } from "@/logaxp/lib/uploads/uploads.service";
import type { RegisterFileRequest, RegisterFileResponse } from "@/logaxp/lib/uploads/uploads.types";

export function useRegisterFile() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const register = React.useCallback(async (dto: RegisterFileRequest): Promise<RegisterFileResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await uploadsService.register(dto);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to register file";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loading, error };
}