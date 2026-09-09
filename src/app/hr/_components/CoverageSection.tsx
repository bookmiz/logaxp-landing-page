import { ArrowUpRight, BriefcaseBusiness, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
const roles = [
 {icon:BriefcaseBusiness,title:"For HR teams",text:"Keep the people side of the business organized.",points:["Maintain employee files", "Coordinate onboarding tasks", "Review requests and records"]},
 {icon:UsersRound,title:"For managers",text:"Less chasing updates. More clarity for your team.",points:["Review team attendance", "Follow leave requests", "Check submitted timesheets"]},
 {icon:UserRound,title:"For employees",text:"Make everyday essentials easier to find.",points:["Record time and attendance", "Submit leave requests", "Follow request status"]},
];
export default function CoverageSection(){return <section id="coverage" className="hr-audiences"><div className="hr-section-heading"><p className="hr-eyebrow">DESIGNED AROUND YOUR PEOPLE</p><h2>A better workday.<br />For everyone in it.</h2><p>Each role has its own responsibilities. Your workspace brings them together.</p></div><div className="hr-audience-grid">{roles.map(r=><article key={r.title}><r.icon size={30} strokeWidth={1.5}/><h3>{r.title}</h3><p>{r.text}</p><ul>{r.points.map(p=><li key={p}>{p}</li>)}</ul><Link href="/contact">Explore with us <ArrowUpRight size={16}/></Link></article>)}</div></section>}
