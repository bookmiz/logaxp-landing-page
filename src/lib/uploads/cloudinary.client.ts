export type CloudinaryResourceType = "auto" | "image" | "raw" | "video";

export type CloudinaryUploadOptions = {
  folder?: string;
  tags?: string | string[];
  resourceType?: CloudinaryResourceType;
};

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  asset_id?: string;
  version?: string | number;
  original_filename?: string;
  bytes?: number;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
};

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";
  return { cloudName, uploadPreset };
}

function assertCloudinaryConfigured() {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "File uploads are not available in this workspace yet. Contact your administrator.",
    );
  }
  return { cloudName, uploadPreset };
}

function uploadWithProgress(
  file: File,
  resourceType: CloudinaryResourceType,
  options?: Omit<CloudinaryUploadOptions, "resourceType">,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = assertCloudinaryConfigured();
  const { folder, tags } = options || {};
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      if (signal) {
        signal.removeEventListener("abort", abortHandler);
      }
      callback();
    };

    const abortHandler = () => {
      try {
        xhr.abort();
      } catch {}
      finish(() => reject(new Error("Upload aborted")));
    };

    xhr.open("POST", url);

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const pct = Math.round((evt.loaded / evt.total) * 100);
      onProgress?.(pct);
    };

    xhr.onerror = () =>
      finish(() => reject(new Error("Upload failed (network error).")));
    xhr.onload = () => {
      finish(() => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data as CloudinaryUploadResult);
          } else {
            reject(new Error(data?.error?.message || "Failed to upload file"));
          }
        } catch {
          reject(new Error("Upload failed (invalid response)."));
        }
      });
    };

    if (signal) {
      if (signal.aborted) return abortHandler();
      signal.addEventListener("abort", abortHandler, { once: true });
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    if (folder) formData.append("folder", folder);
    if (tags)
      formData.append("tags", Array.isArray(tags) ? tags.join(",") : tags);

    xhr.send(formData);
  });
}

/**
 * Upload any supported asset type via XHR so we can track progress and support abort.
 */
export function uploadFileWithProgress(
  file: File,
  options?: CloudinaryUploadOptions,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<CloudinaryUploadResult> {
  const resourceType =
    options?.resourceType ??
    (file.type.startsWith("image/") ? "image" : "auto");

  return uploadWithProgress(
    file,
    resourceType,
    {
      folder: options?.folder,
      tags: options?.tags,
    },
    onProgress,
    signal,
  );
}

/**
 * Upload images via the Cloudinary image endpoint.
 */
export function uploadImageWithProgress(
  file: File,
  options?: CloudinaryUploadOptions,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<CloudinaryUploadResult> {
  return uploadWithProgress(
    file,
    "image",
    {
      folder: options?.folder,
      tags: options?.tags,
    },
    onProgress,
    signal,
  );
}
