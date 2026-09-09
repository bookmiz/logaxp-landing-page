"use client";
import { useRef, useState } from 'react';
import { api } from '@/logaxp/lib/api/apiClient';
import { Button } from '@/logaxp/components/ui/button';
import { PermissionGate } from '@/logaxp/components/auth/PermissionGate';

const header = 'employeeNumber,firstName,lastName,workEmail,employmentType';
function download(csv: string, name: string) {
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function EmployeeCsvActions({ onImported }: { onImported: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function perform(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (e: unknown) {
      const failure = e as { response?: { data?: { message?: string | string[] } }; message?: string };
      const value = failure.response?.data?.message ?? failure.message ?? 'The request failed. Please retry.';
      setError(Array.isArray(value) ? value.join(' ') : value);
    } finally { setBusy(false); }
  }
  return <div className="my-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" disabled={busy} onClick={() => void perform(async () => {
        const response = await api.get('/employees/export-csv');
        const result = response.data.data ?? response.data;
        download(result.csv, 'employees.csv'); setMessage(`Exported ${result.count} employees.`);
      })}>Export employee CSV</Button>
      <PermissionGate permission="employee.write">
        <Button variant="outline" disabled={busy} onClick={() => download(header + '\r\nEMP-001,Amara,Okafor,amara@example.com,FULL_TIME', 'employee-template.csv')}>Download import template</Button>
        <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}>Choose CSV to import</Button>
        <input ref={input} type="file" accept=".csv,text/csv" aria-label="Employee import CSV" className="sr-only" onChange={e => { setFile(e.target.files?.[0] ?? null); setError(''); setMessage(''); }} />
        {file && <><span className="text-sm">{file.name}</span><Button disabled={busy} onClick={() => void perform(async () => {
          if (file.size > 500000) throw new Error('Choose a CSV smaller than 500 KB.');
          const response = await api.post('/employees/import-csv', { csv: await file.text() });
          const result = response.data.data ?? response.data;
          setMessage(`Created ${result.created}; skipped ${result.skipped} existing employees. No existing records were changed.`);
          setFile(null); if (input.current) input.current.value = ''; onImported();
        })}>{busy ? 'Processing…' : 'Import employees'}</Button></>}
      </PermissionGate>
    </div>
    <p className="mt-2 text-xs text-slate-500">CSV covers employee number, names, work email and employment type. Import up to 500 rows. New employees start in onboarding; existing employee numbers or emails are skipped. This does not import accounts, assignments or payroll details.</p>
    {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>}
    {message && <p role="status" className="mt-2 text-sm">{message}</p>}
  </div>;
}
