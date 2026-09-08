type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  text: string;
};

export default function SectionHeader({ eyebrow, title, text }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#5f8700]">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.03em] text-zinc-950 md:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-zinc-600 md:text-base">{text}</p>
    </div>
  );
}
