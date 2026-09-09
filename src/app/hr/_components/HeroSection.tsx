import Link from "next/link";
import { ArrowDown, ArrowUpRight, CalendarDays, Clock3, FolderKanban, UsersRound } from "lucide-react";
const areas = [
  { name: "People", description: "A place for every employee detail.", icon: UsersRound },
  { name: "Time", description: "Attendance you can follow through.", icon: Clock3 },
  { name: "Leave", description: "Clear requests. Visible decisions.", icon: CalendarDays },
  { name: "Work", description: "Bring tasks and teams together.", icon: FolderKanban },
];
export default function HeroSection() {
  return (
    <section id="overview" className="hr-hero">
      <div className="hr-hero-orbit" aria-hidden="true" />
      <div className="hr-hero-copy">
        <p className="hr-eyebrow"><span className="hr-status-dot" /> THE CONNECTED HR WORKSPACE</p>
        <h1>People. Time. Work.<br /><span>Finally, in sync.</span></h1>
        <p className="hr-intro">Good work starts with connected people. Bring employee records, everyday requests and team operations into one shared workspace.</p>
        <div className="hr-actions"><Link className="hr-primary" href="/contact">Request a demo <ArrowUpRight size={17} /></Link><Link className="hr-secondary" href="#workflows">Explore the platform <ArrowDown size={16} /></Link></div>
        <p className="hr-hero-note">Built for HR teams. Connected to the way everyone works.</p>
      </div>
      <div className="hr-product-areas">{areas.map((area, i) => <Link key={area.name} href="#workflows" className="hr-area"><div className="hr-area-top"><area.icon size={25} strokeWidth={1.5}/><span>0{i + 1}</span></div><h2>{area.name}<ArrowUpRight size={20}/></h2><p>{area.description}</p></Link>)}</div>
    </section>
  );
}
