"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Users, LayoutDashboard, CreditCard, Newspaper, Layers3, Inbox, ShieldCheck, History, LogOut, PanelLeftClose, PanelLeftOpen, ArrowUpRight, Command } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/logaxp/hooks/useAuth";

export const adminNavigation = [
 { label: "Workspace", items: [
  { name: "Overview", href: "/site-admin", icon: LayoutDashboard },
  { name: "Tenants", href: "/site-admin/tenants", icon: Building2 },
  { name: "People", href: "/site-admin/users", icon: Users },
  { name: "Billing", href: "/site-admin/billings", icon: CreditCard }] },
 { label: "Website", items: [
  { name: "Sales enquiries", href: "/site-admin/enquiries", icon: Inbox },
  { name: "Article studio", href: "/site-admin/articles", icon: Newspaper },
  { name: "Publishing", href: "/site-admin/showcases", icon: Layers3 }] },
 { label: "Administration", items: [
  { name: "Security", href: "/site-admin/security", icon: ShieldCheck },
  { name: "Audit trail", href: "/site-admin/audit", icon: History }] },
];
type Props = { activeLink: string; setActiveLink: (value: string) => void; collapsed?: boolean; onToggleCollapse?: () => void; mobileOpen?: boolean; onMobileClose?: () => void; onNavigate?: () => void };
export default function SiteAdminSidebar({ collapsed = false, onToggleCollapse, mobileOpen, onMobileClose, onNavigate }: Props) {
 const pathname = usePathname();
 const router = useRouter();
 const { logout, loading } = useAuth();
 const content = <div className={`admin-rail ${collapsed ? "is-collapsed" : ""}`}>
  <Link href="/site-admin" className="admin-brand" onClick={onNavigate} aria-label="LogaXP administration home"><span className="admin-brand-mark"><Command size={20} /></span>{!collapsed && <span>Loga<span className="admin-brand-accent">XP</span><small>ADMIN CONSOLE</small></span>}</Link>
  <nav aria-label="Administration" className="admin-nav">{adminNavigation.map(group => <div key={group.label} className="admin-nav-group">
   {!collapsed && <p className="admin-nav-label">{group.label}</p>}
   {group.items.map(({ name, href, icon: Icon }) => {
    const active = pathname === href || (href !== "/site-admin" && pathname.startsWith(href + "/"));
    return <Link key={href} href={href} className={`admin-nav-link ${active ? "is-active" : ""}`} aria-current={active ? "page" : undefined} title={collapsed ? name : undefined} aria-label={collapsed ? name : undefined} onClick={() => { onNavigate?.(); onMobileClose?.(); }}><Icon size={17} />{!collapsed && <span>{name}</span>}</Link>;
   })}</div>)}</nav>
  <div className="admin-rail-bottom">
   <Link href="/" className="admin-nav-link" title="View website"><ArrowUpRight size={17} />{!collapsed && "View website"}</Link>
   <button className="admin-nav-link" disabled={loading} title="Sign out" onClick={async () => { await logout(); router.replace("/admin/login"); }}><LogOut size={17} />{!collapsed && (loading ? "Signing out…" : "Sign out")}</button>
   {onToggleCollapse && <button className="admin-nav-link" onClick={onToggleCollapse} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}{!collapsed && "Collapse sidebar"}</button>}
  </div>
 </div>;
 if (mobileOpen === undefined) return content;
 return <Dialog.Root open={mobileOpen} onOpenChange={open => { if (!open) onMobileClose?.(); }}><Dialog.Portal><Dialog.Overlay className="admin-drawer-overlay" /><Dialog.Content onCloseAutoFocus={event => { event.preventDefault(); document.getElementById("admin-navigation-trigger")?.focus(); }} className="admin-mobile-drawer" aria-describedby={undefined}><Dialog.Title className="sr-only">Administration navigation</Dialog.Title><Dialog.Close className="admin-drawer-close" aria-label="Close navigation">×</Dialog.Close>{content}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
