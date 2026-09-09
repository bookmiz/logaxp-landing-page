"use client";
import { useState } from 'react';
import { api } from '@/logaxp/lib/api/apiClient';
export function PrivateDocumentPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [busy, setBusy] = useState(false), [progress, setProgress] = useState(0), [error, setError] = useState('');
  return <div className="space-y-2"><label className="text-sm">Document file (PDF, PNG or JPEG; up to 10 MB)
    <input type="file" accept="application/pdf,image/png,image/jpeg" disabled={busy} className="mt-2 block w-full text-sm" onChange={async e => {
      const file = e.target.files?.[0]; if (!file) return;
      setError(''); setBusy(true); setProgress(0); onChange('');
      try {
        if (file.size > 10 * 1024 * 1024) throw new Error('Maximum file size is 10 MB.');
        const form = new FormData(); form.append('file', file);
        const res = await api.post('/files/private', form, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: event => setProgress(Math.round(100 * event.loaded / (event.total || file.size))) });
        onChange((res.data.data ?? res.data).id);
      } catch (failure: unknown) {
        const f = failure as { response?: { data?: { message?: string } }; message?: string };
        setError(f.response?.data?.message || f.message || 'Upload failed. Please retry.');
      } finally { setBusy(false); }
    }} /></label>
    <p role="status" className="text-xs">{busy ? `Uploading ${progress}%` : value ? 'Document uploaded privately.' : 'Choose a document to upload.'}</p>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
  </div>;
}

export async function downloadPrivateDocument(id: string) {
  const res = await api.get(`/files/${encodeURIComponent(id)}/content`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a'); link.href = url;
  const name = String(res.headers['content-disposition'] ?? '').match(/filename\*=UTF-8''(.+)$/)?.[1];
  const suffix = res.data.type === 'application/pdf' ? '.pdf' : res.data.type === 'image/png' ? '.png' : '.jpg';
  link.download = name ? decodeURIComponent(name) : 'document' + suffix; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
