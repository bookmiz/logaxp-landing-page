"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ChevronRight, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/logaxp/components/ui/dialog";
import { useAuthStore } from "@/logaxp/stores/useAuthStore";
import { adminNavigation } from "./SiteAdminSidebar";
export default function SiteAdminHeader({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
 const pathname = usePathname();
 const email = useAuthStore(s => s.user?.email) || "Administrator";
 const [open, setOpen] = useState(false);
 const [search, setSearch] = useState("");
 const pages = adminNavigation.flatMap(group => group.items);
 const page = pages.find(item => item.href === pathname) || pages.find(item => item.href !== "/site-admin" && pathname.startsWith(item.href + "/"));
 return <header className="admin-topbar">
  <button id="admin-navigation-trigger" className="admin-mobile-toggle" aria-label="Open navigation" onClick={onOpenSidebar}><Menu size={20} /></button>
  <div className="admin-breadcrumb"><span>Administration</span><ChevronRight size={14} /><strong>{page?.name || "Details"}</strong></div>
  <div className="admin-topbar-actions">
   {process.env.NODE_ENV === "development" && <span className="admin-preview-tag">Local preview</span>}
   <button id="admin-page-finder-trigger" className="admin-search-trigger" onClick={() => setOpen(true)} aria-label="Find an admin page"><Search size={16} /><span>Find a page</span></button>
   <Link href="/site-admin/security" className="admin-profile" title={`Account security for ${email}`}><span className="admin-avatar">{email.charAt(0).toUpperCase()}</span><span className="admin-profile-copy"><strong>{email}</strong><small>Site administrator</small></span></Link>
  </div>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent onCloseAutoFocus={event => { event.preventDefault(); document.getElementById("admin-page-finder-trigger")?.focus(); }}><DialogTitle>Go to a page</DialogTitle><DialogDescription>Find a section of your admin console.</DialogDescription><input autoFocus className="mt-4 h-10 w-full rounded-lg border px-3" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search pages…" aria-label="Search admin pages" /><div className="mt-3 space-y-1">{pages.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map(({name, href, icon: Icon}) => <Link key={href} href={href} onClick={() => {setOpen(false); setSearch("");}} className="flex items-center gap-3 rounded-lg p-3 text-sm hover:bg-slate-100"><Icon size={16} />{name}<ArrowUpRight size={14} className="ml-auto" /></Link>)}{!pages.some(item => item.name.toLowerCase().includes(search.toLowerCase())) && <p className="p-3 text-sm text-slate-500">No matching pages.</p>}</div></DialogContent></Dialog>
 </header>;
}
