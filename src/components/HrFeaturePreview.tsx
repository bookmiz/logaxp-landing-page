import { ArrowUpRight, Check, Heart, MessageCircle, Target, Users } from "lucide-react";
import styles from "./HrFeaturePreview.module.css";

export type HrPreviewKind = "talent" | "engagement" | "performance";

/** Illustrative module previews, rather than screenshots or customer results. */
export default function HrFeaturePreview({ kind, tag }: { kind: HrPreviewKind; tag: string }) {
  return (
    <div className={styles.preview} role="img" aria-label={`${tag}: illustrative HR module preview`}>
      <div className={styles.topline} aria-hidden="true">
        <span><i />{tag}</span><span className={styles.example}>PREVIEW</span>
      </div>
      <div className={styles.panel} aria-hidden="true">
        {kind === "talent" && <>
          <div className={styles.heading}><Users size={15} /><strong>Your next great hire</strong><ArrowUpRight size={14} /></div>
          <div className={styles.pipeline}><span>Applied</span><span>Interview</span><span>Offer</span></div>
          <div className={styles.person}><span className={styles.avatar}>AO</span><div><strong>Alex O.</strong><small>Product designer</small></div><span className={styles.status}>Interview</span></div>
          <div className={styles.person}><span className={styles.avatar}>JM</span><div><strong>Jordan M.</strong><small>People operations</small></div><span className={styles.check}><Check size={13} /></span></div>
        </>}
        {kind === "engagement" && <>
          <div className={styles.heading}><Heart size={15} /><strong>A little check-in. A big impact.</strong></div>
          <p className={styles.question}>How is your week going?</p>
          <div className={styles.moods}>{["Tough", "Okay", "Good", "Great"].map((mood, index) => <div key={mood} className={index === 2 ? styles.selected : ""}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M8 9h.01M16 9h.01" strokeWidth="3" strokeLinecap="round" /><path d={index === 0 ? "M8 16q4-4 8 0" : index === 1 ? "M8 15h8" : "M8 14q4 5 8 0"} strokeLinecap="round" /></svg><span>{mood}</span></div>)}</div>
          <div className={styles.note}><MessageCircle size={13} /> Make space for every voice.</div>
        </>}
        {kind === "performance" && <>
          <div className={styles.heading}><Target size={15} /><strong>Small steps. Shared goals.</strong></div>
          <div className={styles.goal}><span>Build your skills</span><span>In progress</span></div>
          <div className={styles.track}><span /></div>
          <div className={styles.milestone}><span className={styles.check}><Check size={12} /></span><span>Set a learning goal</span></div>
          <div className={styles.milestone}><span className={styles.check}><Check size={12} /></span><span>Connect with your coach</span></div>
          <div className={styles.milestone}><span className={styles.pending} /><span>Put your learning into practice</span></div>
        </>}
      </div>
    </div>
  );
}
