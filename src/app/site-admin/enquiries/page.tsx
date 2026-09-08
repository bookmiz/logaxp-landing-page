"use client";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/logaxp/lib/api/apiClient';
type Enquiry={id:string;name:string;email:string;company:string;teamSize:string;interest:string;message:string;createdAt:string};
export default function Enquiries(){
 const query=useQuery({queryKey:['sales-enquiries'],queryFn:async()=>(await api.get<Enquiry[]>('/sales-enquiries')).data});
 return <main className="p-6"><h1 className="text-3xl font-bold">Sales enquiries</h1><p className="my-3">Latest 100 website enquiries. Contact details are visible only to site administrators.</p><button onClick={()=>query.refetch()} className="rounded border px-4 py-2">Refresh inbox</button>{query.isPending?<p role="status">Loading enquiries…</p>:query.isError?<p role="alert">Could not load enquiries. Please retry.</p>:query.data?.length?query.data.map(e=><article key={e.id} className="my-4 rounded-xl border p-5"><h2 className="text-xl font-bold">{e.company} — {e.interest}</h2><p>{e.name} · <a className="underline" href={`mailto:${e.email}`}>{e.email}</a> · {e.teamSize}</p><time>{new Date(e.createdAt).toLocaleString()}</time><p className="mt-3 whitespace-pre-wrap">{e.message}</p></article>):<p className="my-5">No enquiries yet.</p>}</main>;
}
