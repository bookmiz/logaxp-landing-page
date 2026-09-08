"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, HashIcon, Loader2, PlayCircle } from "lucide-react";

import { usePublicShowcases } from "@/logaxp/hooks/useShowcase";
import type { ShowcaseProjectListItem } from "@/logaxp/lib/showcase/showcase.types";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function getListTags(project: ShowcaseProjectListItem) {
  return (project.tags ?? []).map((t) => t.tag?.title).filter(Boolean) as string[];
}

function getListCategories(project: ShowcaseProjectListItem) {
  return (project.categories ?? [])
    .map((c) => ({
      title: c.category?.title ?? "",
      slug: c.category?.slug ?? "",
    }))
    .filter((c) => c.title || c.slug);
}

function fallbackVideoForIndex(index: number) {
  const n = (index % 4) + 1;
  return `/videos/${n}.mp4`;
}

function fallbackImageForIndex(index: number) {
  const n = (index % 4) + 1;
  return `/images/showcase-${n}.jpg`;
}

function getShowcaseVisual(project: ShowcaseProjectListItem, index: number) {
  const hero = project.heroUrl ?? null;

  return {
    video: hero && isVideoUrl(hero) ? hero : fallbackVideoForIndex(index),
    image: hero && !isVideoUrl(hero) ? hero : fallbackImageForIndex(index),
    prefersVideo: Boolean(hero ? isVideoUrl(hero) : true),
  };
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-colors",
        "border-[var(--foreground)] text-[var(--foreground)]",
        "hover:border-[var(--background)] hover:bg-[var(--foreground)] hover:text-[var(--background)]",
        active && "border-[var(--background)] bg-[var(--foreground)] text-[var(--background)]"
      )}
    >
      {children}
    </button>
  );
}

function ShowcaseMediaCard({
  project,
  index,
}: {
  project: ShowcaseProjectListItem;
  index: number;
}) {
  const visual = React.useMemo(() => getShowcaseVisual(project, index), [project, index]);
  const [videoFailed, setVideoFailed] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);

  const shouldShowVideo = visual.prefersVideo && !videoFailed;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/10">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-neutral-100 via-white to-lime-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-lime-950/30">
        {shouldShowVideo ? (
          <video
            key={visual.video}
            src={visual.video}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoFailed(true)}
          />
        ) : !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={visual.image}
            alt={project.title}
            className="h-full w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-lime-50 text-neutral-500 dark:from-neutral-900 dark:via-neutral-950 dark:to-lime-950/30 dark:text-neutral-300">
            <div className="text-center">
              <PlayCircle className="mx-auto h-10 w-10 opacity-70" />
              <div className="mt-3 text-sm font-medium">Preview unavailable</div>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
      </div>
    </div>
  );
}

export default function ShowcasesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  const itemRefs = React.useRef<Array<HTMLAnchorElement | null>>([]);

  const publicQ = usePublicShowcases({
    page: 1,
    pageSize: 100,
  });

  const projects = React.useMemo(() => publicQ.data?.items ?? [], [publicQ.data]);

  const categories = React.useMemo(() => {
    const map = new Map<string, string>();

    for (const project of projects) {
      for (const cat of getListCategories(project)) {
        const slug = cat.slug || cat.title.toLowerCase().replace(/\s+/g, "-");
        const title = cat.title || slug;
        if (!map.has(slug)) map.set(slug, title);
      }
    }

    return [{ slug: "all", title: "All" }, ...Array.from(map.entries()).map(([slug, title]) => ({ slug, title }))];
  }, [projects]);

  const filtered = React.useMemo(() => {
    if (selectedCategory === "all") return projects;

    return projects.filter((project) =>
      getListCategories(project).some((cat) => cat.slug === selectedCategory)
    );
  }, [projects, selectedCategory]);

  React.useEffect(() => {
    setActiveIndex(0);
    itemRefs.current = [];
  }, [selectedCategory]);

  React.useEffect(() => {
    const els = itemRefs.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (!visible) return;

        const idx = els.findIndex((el) => el === visible.target);
        if (idx >= 0) setActiveIndex(idx);
      },
      {
        root: null,
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filtered.length]);

  const sectionBg = React.useMemo(() => {
    const even = activeIndex % 2 === 0;

    if (even) {
      return cx(
        "bg-gradient-to-br from-neutral-50 via-white to-[#f8fdea]",
        "dark:from-neutral-950 dark:via-neutral-900 dark:to-[#122000]"
      );
    }

    return cx(
      "bg-gradient-to-br from-white via-neutral-50 to-[#eef7ff]",
      "dark:from-black dark:via-neutral-950 dark:to-[#0a1424]"
    );
  }, [activeIndex]);

  return (
    <main className={cx("min-h-screen transition-colors duration-700", sectionBg)}>
      <div className="px-4 pt-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </div>

      <section id="showcases" className="min-h-screen px-4 py-20 md:px-24 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mango text-5xl font-bold tracking-wide md:text-6xl">Showcases</h1>
              <p className="geist mt-3 max-w-3xl text-base leading-relaxed opacity-75 md:text-lg">
                Explore our live showcase collection powered directly from the API. Click any project to open a full, detailed product story page.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              {categories.map((cat) => (
                <FilterPill
                  key={cat.slug}
                  active={selectedCategory === cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.title}
                </FilterPill>
              ))}
            </div>
          </div>

          <div className="mt-16 md:mt-24">
            {publicQ.isLoading ? (
              <div className="rounded-[2rem] border border-black/10 bg-white/70 p-10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading showcases...
                </div>
              </div>
            ) : publicQ.isError ? (
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 dark:border-red-900/40 dark:bg-red-950/20">
                <p className="mango text-3xl font-black text-red-700 dark:text-red-300">
                  Unable to load showcases
                </p>
                <p className="geist mt-2 text-sm text-red-600/80 dark:text-red-300/80">
                  Please check the public showcase endpoint and try again.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[2rem] border border-black/10 bg-white/70 p-10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <p className="mango text-3xl font-black">No projects found</p>
                <p className="geist mt-2 opacity-75">
                  Try another category or reset to <span className="font-bold">All</span>.
                </p>
                <div className="mt-5">
                  <FilterPill active onClick={() => setSelectedCategory("all")}>
                    Reset to All
                  </FilterPill>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-16 md:gap-24">
                {filtered.map((project, index) => {
                  const href = `/showcases/${project.slug}`;
                  const tags = getListTags(project);
                  const isReversed = index % 2 === 1;
                  const isOdd = index % 2 === 1;

                  return (
                    <Link
                      key={project.id}
                      href={href}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      className={cx(
                        "group block rounded-[2.2rem] p-6 backdrop-blur-xl transition-all duration-500 md:p-10",
                        "border border-black/10 dark:border-white/10",
                        isOdd ? "bg-pink-50 dark:bg-amber-50/10" : "bg-white/50 dark:bg-white/5",
                        "hover:bg-green-50 dark:hover:bg-white/10"
                      )}
                    >
                      <div
                        className={cx(
                          "flex flex-col gap-10 xl:flex-row xl:items-center xl:gap-14",
                          isReversed && "xl:flex-row-reverse"
                        )}
                      >
                        <div className="w-full xl:max-w-[620px] 2xl:max-w-[820px]">
                          <ShowcaseMediaCard project={project} index={index} />
                        </div>

                        <div className={cx("xl:flex-1", isReversed ? "xl:text-right" : "xl:text-left")}>
                          <p className="mango text-4xl font-black leading-[1.05] tracking-wide transition-colors group-hover:text-[#89E101] md:text-6xl">
                            {project.title}
                          </p>

                          <p className="geist mt-4 max-w-3xl text-base leading-relaxed opacity-80 md:text-lg xl:max-w-none">
                            {project.shortDescription || "No summary available yet."}
                          </p>

                          {tags.length ? (
                            <div
                              className={cx(
                                "mt-6 flex flex-wrap items-center gap-3",
                                isReversed ? "xl:justify-end" : "xl:justify-start"
                              )}
                            >
                              {tags.map((tag, i) => (
                                <span
                                  key={`${tag}-${i}`}
                                  className="flex items-center gap-2 whitespace-nowrap rounded-full border border-[var(--foreground)]/60 px-4 py-2 text-xs font-bold capitalize text-[var(--foreground)]"
                                >
                                  <span className="grid h-6 w-6 place-items-center rounded-xl bg-[#89E101]">
                                    <HashIcon className="h-4 w-4 stroke-black" />
                                  </span>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          <div
                            className={cx(
                              "geist mt-8 inline-flex items-center gap-2 text-base font-bold opacity-80 transition-opacity group-hover:opacity-100",
                              isReversed ? "xl:justify-end" : "xl:justify-start"
                            )}
                          >
                            View details <ArrowUpRight className="h-4 w-4 opacity-70" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}