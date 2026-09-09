"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
const links=[{label:'Product tour',href:'#workflows'},{label:'Who it’s for',href:'#coverage'},{label:'Plans',href:'#pricing'}];
export default function HRProductHeader(){
 const [open,setOpen]=useState(false); const trigger=useRef<HTMLButtonElement>(null);
 return <header className="hr-header" onKeyDown={e=>{if(e.key==='Escape'&&open){setOpen(false);trigger.current?.focus();}}}>
 <nav aria-label="HR navigation" className="hr-nav"><Link href="/" aria-label="LogaXP home"><Image src="/logo-light.png" alt="LogaXP" width={128} height={38} priority className="h-auto w-32"/></Link><div className="hr-desktop-links">{links.map(l=><Link key={l.href} href={l.href}>{l.label}</Link>)}</div><div className="hr-nav-actions"><Link href="/admin/login">Log in</Link><Link href="/contact" className="hr-primary hr-nav-demo">Request a demo</Link><button ref={trigger} type="button" className="hr-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="hr-mobile-menu" onClick={()=>setOpen(v=>!v)}>{open?<X size={20}/>:<Menu size={20}/>}</button></div></nav>
 {open&&<nav id="hr-mobile-menu" aria-label="HR mobile navigation" className="hr-mobile-links">{[...links,{label:'Request a demo',href:'/contact'}].map(l=><Link key={l.href} href={l.href} onClick={()=>setOpen(false)}>{l.label}</Link>)}</nav>}
 </header>;
}
