"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, Check, LayoutDashboard, UsersRound, CalendarCheck2 } from "lucide-react";
const screens = [
  { key:"overview", label:"Workspace overview", title:"Start the day with the whole picture.", text:"See employee and attendance figures from your workspace records, with recent leave requests close at hand.", src:"/images/hr-dashboard-current.png", width:1280, height:580, icon:LayoutDashboard, points:["Employee totals", "Attendance status", "Recent leave requests"] },
  { key:"people", label:"Employee records", title:"Know your people. Keep the details together.", text:"Find an employee, review their employment status and open their profile from one searchable directory.", src:"/images/hr-employees-verified.png", width:1280, height:680, icon:UsersRound, points:["Searchable directory", "Employment status", "Employee profiles"] },
  { key:"leave", label:"Leave & approvals", title:"A clear path from request to decision.", text:"Review dates, request status and recorded decisions. Give managers and HR a shared view of leave activity.", src:"/images/hr-leave-verified.png", width:1280, height:640, icon:CalendarCheck2, points:["Date ranges", "Request status", "Decision history"] },
];
export default function WorkstreamsSection() {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const screen = screens[active];
  return <section id="workflows" className="hr-tour">
    <div className="hr-tour-toolbar">
      <h2>Explore the workspace</h2>
    <div className="hr-tour-tabs" role="tablist" aria-label="Product preview">{screens.map((s,i)=><button key={s.key} ref={el=>{tabs.current[i]=el;}} id={"hr-tab-"+s.key} role="tab" aria-selected={active===i} aria-controls={"hr-panel-"+s.key} tabIndex={active===i?0:-1} onClick={()=>setActive(i)} onKeyDown={e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%screens.length;else if(e.key==='ArrowLeft')next=(i+screens.length-1)%screens.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=screens.length-1;else return;e.preventDefault();setActive(next);tabs.current[next]?.focus();}}><s.icon size={17}/>{s.label}</button>)}</div>
    </div>
    <div className="hr-tour-panel" role="tabpanel" id={"hr-panel-"+screen.key} aria-labelledby={"hr-tab-"+screen.key} tabIndex={0}>
      <div className="hr-tour-copy"><span className="hr-tour-number">0{active+1} / THE PRODUCT TOUR</span><h3>{screen.title}</h3><p>{screen.text}</p><ul>{screen.points.map(p=><li key={p}><Check size={15}/>{p}</li>)}</ul><Link href="/contact">Talk through your workflow <ArrowUpRight size={16}/></Link></div>
      <figure className="hr-tour-screen"><div className="hr-preview-bar"><span className="hr-status-dot"/><strong>LogaXP</strong><span>{screen.label}</span></div><Link href={screen.src} target="_blank" rel="noopener noreferrer" aria-label={"View full-size "+screen.label+" screenshot"}><Image key={screen.src} src={screen.src} alt={screen.label+" in LogaXP, showing synthetic local demo records"} width={screen.width} height={screen.height} sizes="(min-width: 1024px) 850px, 100vw"/></Link><figcaption>Actual product screen · Synthetic demo records <ArrowUpRight size={13}/></figcaption></figure>
    </div>
  </section>;
}
