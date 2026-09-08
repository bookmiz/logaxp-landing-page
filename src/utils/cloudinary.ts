export type CloudinaryUploadOptions = {
  folder?: string;
  tags?: string | string[];
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
      "Cloudinary is not configured."
    );
  }
  return { cloudName, uploadPreset };
}

export async function uploadImage(file: File, options?: CloudinaryUploadOptions): Promise<string> {
  const { cloudName, uploadPreset } = assertCloudinaryConfigured();

  const { folder, tags } = options || {};

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  if (folder) formData.append("folder", folder);
  if (tags) formData.append("tags", Array.isArray(tags) ? tags.join(",") : tags);

  const apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const res = await fetch(apiUrl, { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Failed to upload image");
  }

  return data.secure_url as string;
}

export async function uploadMultipleImages(files: File[], options?: CloudinaryUploadOptions) {
  return Promise.all(files.map((f) => uploadImage(f, options)));
}