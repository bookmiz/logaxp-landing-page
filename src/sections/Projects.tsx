"use client";

import Link from "next/link";
import ProjectMotion from "../components/ProjectMotion";
import { ProjectImage } from "../components";

import projects from "../utils/content/projects";
import { HashIcon } from "lucide-react";
import { useState } from "react";

export default function Projects({ showAll = false }: { showAll?: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const visibleProjects = showAll ? projects : projects.slice(0, 4);
  const Heading = showAll ? "h1" : "h2";
  return (
    <section id="projects" className="py-16 md:py-24 px-5 md:px-12 lg:px-24 min-h-screen">
      <div className="flex gap-6 lg:flex-row flex-col md:items-center md:justify-between">
        <div>
          <Heading className="mango align-baseline tracking-wide font-bold text-5xl md:text-6xl">
            {showAll ? "Our products" : "Showcases"}
          </Heading>
          {showAll ? <p className="mt-3 opacity-80">Explore the LogaXP product family.</p> :
            <Link href="/products" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">View all products <span aria-hidden="true">↗</span></Link>}
        </div>
        <div className="flex items-center flex-wrap md:justify-center lg:justify-start gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            aria-pressed={selectedCategory === null}
            className={
              "border text-xs font-bold text-[var(--foreground)] py-2 px-4 border-[var(--foreground)] rounded-full cursor-pointer transition-colors hover:text-[var(--background)] hover:bg-[var(--foreground)] hover:border-[var(--background)]"
            }
          >
            {showAll ? "All" : "Featured"}
          </button>
          {visibleProjects.map((service, index) => {
            return (
              <button
                key={index}
                onClick={() => setSelectedCategory(service.title)}
                aria-pressed={selectedCategory === service.title}
                className="border whitespace-nowrap text-xs font-bold text-[var(--foreground)] py-2 px-4 border-[var(--foreground)] rounded-full cursor-pointer transition-colors hover:text-[var(--background)] hover:bg-[var(--foreground)] hover:border-[var(--background)]"
              >
                {service.title}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-12 md:mt-20 flex items-start gap-16 md:gap-24 flex-col justify-between">
        {visibleProjects.filter(project=>!selectedCategory||project.title===selectedCategory).map((project, index) => {
          return (
            <Link
              className="cursor-pointer grid w-full grid-cols-1 xl:grid-cols-[minmax(0,1.28fr)_minmax(0,1fr)] xl:items-center gap-8"
              key={index}
              href={project.link || project.links || "/contact"}
              target={project.link || project.links ? "_blank" : undefined}
              rel={project.link || project.links ? "noopener noreferrer" : undefined}
            >
              {project.scenes.length ? (
                <ProjectMotion scenes={project.scenes} motionStyle={project.motionStyle ?? "delivery"} />
              ) : (
                <ProjectImage src={`/videos/${index + 1}.mp4`} />
              )}
              <div className="min-w-0">
                <p className="mango font-bold tracking-wide text-4xl md:text-5xl">
                  {project.title}
                </p>
                <p className="md:max-w-full opacity-85 mt-1">
                  {project.description}
                </p>
                <div className="flex items-center flex-wrap mt-4 gap-3">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="border flex items-center gap-1 capitalize whitespace-nowrap text-xs font-bold text-[var(--foreground)] py-2 px-4 border-[var(--foreground)] rounded-full"
                    >
                      <HashIcon className="bg-[#86BF00] p-1 rounded-lg stroke-black" />{" "}
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
