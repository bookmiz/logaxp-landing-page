"use client";
import React, { useState } from "react";
import Header from "./Header";
import Navbar from "./Navbar";
import "./portal-console.css";
type PortalShellProps = {children?: React.ReactNode; theme: "light" | "dark"; toggleTheme: () => void; activeLink: string; setActiveLink: (link: string) => void;};
export default function PortalShell({children,activeLink,setActiveLink}:PortalShellProps) {
 const [sidebarOpen,setSidebarOpen]=useState(false);
 const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
 return <div className="portal-console">
 <a className="portal-skip-link" href="#workspace-content">Skip to content</a>
 <div className="hidden h-full shrink-0 md:block"><Navbar activeLink={activeLink} setActiveLink={setActiveLink} collapsed={sidebarCollapsed} onToggleCollapse={()=>setSidebarCollapsed(value=>!value)} onNavigate={()=>setSidebarOpen(false)}/></div>
 <div className="flex min-w-0 flex-1 flex-col"><Header title={activeLink || "Dashboard"} onOpenSidebar={()=>setSidebarOpen(true)}/><main id="workspace-content" className="portal-content">{children}</main></div>
 <Navbar mobileOpen={sidebarOpen} onMobileClose={()=>setSidebarOpen(false)} activeLink={activeLink} setActiveLink={setActiveLink} collapsed={false} onNavigate={()=>setSidebarOpen(false)}/>
 </div>;
}
