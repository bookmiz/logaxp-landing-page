// // src/logaxp/hooks/uploads.hooks.ts

// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { uploadsService } from "@/logaxp/lib/uploads/uploads.service";
// import type {
//   RegisterUploadDto,
//   UploadListQuery,
//   UploadRecord,
//   Paginated,
// } from "@/logaxp/lib/uploads/uploads.types";
// import { toast } from "@/logaxp/components/ui/toast";

// // Query keys (stable + predictable)
// const uploadsKeys = {
//   all: ["uploads"] as const,
//   lists: () => [...uploadsKeys.all, "list"] as const,
//   list: (query?: UploadListQuery) => [...uploadsKeys.lists(), query ?? {}] as const,
//   details: () => [...uploadsKeys.all, "detail"] as const,
//   detail: (id: string) => [...uploadsKeys.details(), id] as const,
// };

// function getErrorMessage(err: any) {
//   // AxiosError shape commonly: err.response.data.message
//   const msg =
//     err?.response?.data?.message ||
//     err?.response?.data?.error ||
//     err?.message ||
//     "Something went wrong";
//   return Array.isArray(msg) ? msg.join(", ") : String(msg);
// }

// /**
//  * Read file metadata by id
//  */
// export function useUpload(id: string | null | undefined) {
//   return useQuery({
//     queryKey: id ? uploadsKeys.detail(id) : ["uploads", "detail", "nil"],
//     queryFn: () => uploadsService.getById(id as string),
//     enabled: Boolean(id),
//     staleTime: 30_000,
//   });
// }

// /**
//  * Optional: list uploads (only if backend supports GET /uploads)
//  */
// export function useUploads(query?: UploadListQuery) {
//   return useQuery<Paginated<UploadRecord>>({
//     queryKey: uploadsKeys.list(query),
//     queryFn: () => uploadsService.list(query),
//     staleTime: 15_000,
//   });
// }

// /**
//  * Register/upload metadata (POST /uploads)
//  */
// export function useRegisterUpload() {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: (dto: RegisterUploadDto) => uploadsService.register(dto),

//     onSuccess: (created) => {
//       toast.success("File saved.");

//       // update caches
//       qc.invalidateQueries({ queryKey: uploadsKeys.lists() });
//       if (created?.id) {
//         qc.setQueryData(uploadsKeys.detail(created.id), created);
//       }
//     },

//     onError: (err) => {
//       toast.error(getErrorMessage(err));
//     },
//   });
// }