"use client";

import Link from "next/link";
import * as React from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Globe,
  Hash,
  Image as ImageIcon,
  Link2,
  Loader2,
  PlayCircle,
  Sparkles,
  Video,
} from "lucide-react";

import { usePublicShowcase, usePublicShowcases } from "@/logaxp/hooks/useShowcase";
import type {
  ShowcaseProject,
  ShowcaseProjectMedia,
} from "@/logaxp/lib/showcase/showcase.types";


function isVideoUrl(url?: string | null) {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function getLinkEntries(project: ShowcaseProject) {
  const links = asRecord(project.links);
  if (!links) return [];

  return Object.entries(links)
    .filter(([, value]) => typeof value === "string" && value.trim())
    .map(([key, value]) => ({
      key,
      url: String(value),
      label: key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").trim(),
    }));
}

function getContentRecord(project: ShowcaseProject) {
  return asRecord(project.content) ?? {};
}

function getContentBlocks(project: ShowcaseProject) {
  const content = getContentRecord(project);
  return asArray<Record<string, unknown>>(content.blocks);
}

function getHeroSources(project: ShowcaseProject) {
  const content = getContentRecord(project);

  const heroUrl = project.heroUrl ?? project.heroFile?.url ?? null;
  const contentVideo = typeof content.video === "string" ? content.video : null;
  const fallbackImage =
    (typeof content.fallbackImage === "string" && content.fallbackImage) ||
    project.media?.find((m) => {
      const src = m.url || m.file?.url;
      return src && !isVideoUrl(src);
    })?.url ||
    project.media?.find((m) => {
      const src = m.url || m.file?.url;
      return src && !isVideoUrl(src);
    })?.file?.url ||
    null;

  const mediaVideo =
    project.media?.find((m) => {
      const src = m.url || m.file?.url;
      return src && isVideoUrl(src);
    })?.url ||
    project.media?.find((m) => {
      const src = m.url || m.file?.url;
      return src && isVideoUrl(src);
    })?.file?.url ||
    null;

  const primaryVideo = heroUrl && isVideoUrl(heroUrl) ? heroUrl : contentVideo || mediaVideo;
  const primaryImage = heroUrl && !isVideoUrl(heroUrl) ? heroUrl : fallbackImage;

  return {
    video: primaryVideo,
    image: primaryImage,
  };
}

function getSortedMedia(project: ShowcaseProject) {
  return [...(project.media ?? [])].sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
}

function getMediaSource(media: ShowcaseProjectMedia) {
  return media.url || media.file?.url || null;
}

function renderBlock(block: Record<string, unknown>, index: number) {
  const type = String(block.type ?? "").toLowerCase();
  const title = typeof block.title === "string" ? block.title : `Section ${index + 1}`;
  const body =
    typeof block.body === "string"
      ? block.body
      : typeof block.description === "string"
        ? block.description
        : typeof block.text === "string"
          ? block.text
          : "";

  if (type === "features" || type === "cards") {
    const items = asArray<any>(block.items ?? block.cards);
    return (
      <section key={index} className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          {body ? <p className="mt-2 text-slate-600 dark:text-slate-300">{body}</p> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => {
            const record = asRecord(item) ?? {};
            const itemTitle = typeof record.title === "string" ? record.title : `Item ${i + 1}`;
            const itemBody =
              typeof record.description === "string"
                ? record.description
                : typeof record.body === "string"
                  ? record.body
                  : typeof item === "string"
                    ? item
                    : "";
            return (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="inline-flex rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold text-lime-800 dark:bg-lime-950/40 dark:text-lime-200">
                  Feature
                </div>
                <div className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {itemTitle}
                </div>
                {itemBody ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {itemBody}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (type === "stats") {
    const items = asArray<any>(block.items);
    return (
      <section key={index} className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          {body ? <p className="mt-2 text-slate-600 dark:text-slate-300">{body}</p> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, i) => {
            const record = asRecord(item) ?? {};
            const label =
              typeof record.label === "string"
                ? record.label
                : typeof record.title === "string"
                  ? record.title
                  : `Metric ${i + 1}`;
            const value =
              typeof record.value === "string" || typeof record.value === "number"
                ? record.value
                : "—";
            return (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {label}
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                  {String(value)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (type === "faq" || type === "faqs") {
    const items = asArray<any>(block.items ?? block.faqs);
    return (
      <section key={index} className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          {body ? <p className="mt-2 text-slate-600 dark:text-slate-300">{body}</p> : null}
        </div>
        <div className="space-y-3">
          {items.map((item, i) => {
            const record = asRecord(item) ?? {};
            const q =
              typeof record.question === "string"
                ? record.question
                : typeof record.title === "string"
                  ? record.title
                  : `Question ${i + 1}`;
            const a =
              typeof record.answer === "string"
                ? record.answer
                : typeof record.body === "string"
                  ? record.body
                  : "";
            return (
              <details
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm open:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:open:bg-slate-900/40"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-slate-900 dark:text-slate-50">
                  {q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{a}</p>
              </details>
            );
          })}
        </div>
      </section>
    );
  }

  const rawItems = asArray<any>(block.items);

  return (
    <section key={index} className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
        {body ? <p className="mt-2 whitespace-pre-line text-slate-600 dark:text-slate-300">{body}</p> : null}
      </div>

      {rawItems.length ? (
        <div className="grid gap-3">
          {rawItems.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              {typeof item === "string" ? item : JSON.stringify(item)}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function HeroMedia({ project }: { project: ShowcaseProject }) {
  const media = React.useMemo(() => getHeroSources(project), [project]);
  const [videoFailed, setVideoFailed] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);

  if (media.video && !videoFailed) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-black dark:border-white/10">
        <video
          src={media.video}
          className="aspect-[16/9] w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls
          onError={() => setVideoFailed(true)}
        />
      </div>
    );
  }

  if (media.image && !imageFailed) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white dark:border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.image}
          alt={project.title}
          className="aspect-[16/9] w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className="grid aspect-[16/9] place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
      <div className="text-center">
        <ImageIcon className="mx-auto h-10 w-10" />
        <div className="mt-3 text-sm font-medium">Media preview unavailable</div>
      </div>
    </div>
  );
}

function MediaGallery({ project }: { project: ShowcaseProject }) {
  const media = getSortedMedia(project);
  if (!media.length) return null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Gallery & Media</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Rich project media pulled directly from the showcase record.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {media.map((item) => {
          const src = getMediaSource(item);
          const isVideo = isVideoUrl(src);
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
                {src ? (
                  isVideo ? (
                    <video
                      src={src}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={item.alt || item.title || project.title} className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-400">
                    {isVideo ? <Video className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
                  </div>
                )}

                <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/85 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                  {item.type}
                </div>
              </div>

              <div className="space-y-2 p-4">
                <div className="font-semibold text-slate-900 dark:text-slate-50">
                  {item.title || item.alt || item.type}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {item.alt || src || "No additional description"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ShowcaseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const detailQ = usePublicShowcase(slug);
  const project = detailQ.data;

  const relatedQ = usePublicShowcases({ page: 1, pageSize: 6 });

  const categories = React.useMemo(
    () => (project?.categories ?? []).map((c) => c.category?.title).filter(Boolean) as string[],
    [project]
  );
  const tags = React.useMemo(
    () => (project?.tags ?? []).map((t) => t.tag?.title).filter(Boolean) as string[],
    [project]
  );
  const links = React.useMemo(() => (project ? getLinkEntries(project) : []), [project]);
  const blocks = React.useMemo(() => (project ? getContentBlocks(project) : []), [project]);

  const related = React.useMemo(() => {
    const items = relatedQ.data?.items ?? [];
    return items.filter((item) => item.slug !== project?.slug).slice(0, 3);
  }, [relatedQ.data, project?.slug]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-[#f8fdea] px-4 py-12 dark:from-neutral-950 dark:via-neutral-900 dark:to-[#122000] md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-black/10 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-white/10">
          <Link
            href="/showcases"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to showcases
          </Link>

          {project?.status ? (
            <span className="inline-flex rounded-full border border-lime-200 bg-lime-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-lime-900 dark:border-lime-900/40 dark:bg-lime-950/30 dark:text-lime-200">
              {project.status}
            </span>
          ) : null}
        </div>

        {detailQ.isLoading ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/70 p-10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading showcase...
            </div>
          </div>
        ) : detailQ.isError || !project ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 dark:border-red-900/40 dark:bg-red-950/20">
            <div className="text-3xl font-black text-red-700 dark:text-red-300">Showcase not found</div>
            <p className="mt-2 text-sm text-red-600/80 dark:text-red-300/80">
              The requested showcase could not be loaded.
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
              <HeroMedia project={project} />

              <div className="flex flex-col justify-between rounded-[2rem] border border-black/10 bg-white/75 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Showcase Project
                  </div>

                  <h1 className="mango mt-5 text-4xl font-black leading-[1.02] tracking-wide text-slate-900 dark:text-white md:text-6xl">
                    {project.title}
                  </h1>

                  <p className="geist mt-5 text-base leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg">
                    {project.shortDescription || project.description || "No summary available."}
                  </p>

                  {categories.length ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full border border-black/10 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {tags.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-lime-50 px-3 py-1.5 text-xs font-semibold text-lime-800 dark:border-lime-900/40 dark:bg-lime-950/30 dark:text-lime-200"
                        >
                          <Hash className="h-3.5 w-3.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="mt-8 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Published
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-50">
                        <CalendarDays className="h-4 w-4" />
                        {formatDateTime(project.publishedAt)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Featured
                      </div>
                      <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-50">
                        <CheckCircle2 className="h-4 w-4" />
                        {project.featured ? "Highlighted showcase" : "Standard showcase"}
                      </div>
                    </div>
                  </div>

                  {links.length ? (
                    <div className="flex flex-wrap gap-3">
                      {links.map((link) => (
                        <a
                          key={link.key}
                          href={link.url}
                          target={link.url.startsWith("http") ? "_blank" : undefined}
                          rel={link.url.startsWith("http") ? "noreferrer" : undefined}
                          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-lime-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15"
                        >
                          {link.key.toLowerCase().includes("demo") ? (
                            <Globe className="h-4 w-4" />
                          ) : (
                            <Link2 className="h-4 w-4" />
                          )}
                          {link.label}
                          <ArrowUpRight className="h-4 w-4 opacity-70" />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-10">
                <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-8">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Overview</h2>
                  <div className="mt-4 whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {project.description || project.shortDescription || "No extended description available yet."}
                  </div>
                </div>

                {blocks.map((block, index) => renderBlock(block, index))}

                <MediaGallery project={project} />
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Project Snapshot</h3>
                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Slug</div>
                      <div className="mt-1 font-medium text-slate-900 dark:text-slate-50">/{project.slug}</div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Created</div>
                      <div className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                        {formatDateTime(project.createdAt)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Updated</div>
                      <div className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                        {formatDateTime(project.updatedAt)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Sort order</div>
                      <div className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                        {project.sortOrder ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                {project.seoTitle || project.seoDescription ? (
                  <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">SEO</h3>
                    <div className="mt-4 space-y-4 text-sm">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          SEO Title
                        </div>
                        <div className="mt-1 font-medium text-slate-900 dark:text-slate-50">
                          {project.seoTitle || "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          SEO Description
                        </div>
                        <div className="mt-1 text-slate-700 dark:text-slate-300">
                          {project.seoDescription || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {related.length ? (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    More showcases
                  </h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Explore other products and platforms from the same ecosystem.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/showcases/${item.slug}`}
                      className="group rounded-[1.75rem] border border-black/10 bg-white/70 p-5 backdrop-blur-xl transition hover:bg-green-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <div className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-[#89E101] dark:text-slate-50">
                        {item.title}
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.shortDescription || "No summary available yet."}
                      </p>

                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                        View showcase <ArrowUpRight className="h-4 w-4 opacity-70" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}