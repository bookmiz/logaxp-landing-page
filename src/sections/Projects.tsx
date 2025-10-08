"use client";

import Link from "next/link";
import { ProjectImage } from "../components";
import { services } from "../utils/content";
import projects from "../utils/content/projects";
import { HashIcon } from "lucide-react";
import { useState } from "react";

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  return (
    <section id="projects" className="py-32 px-4 md:px-24 min-h-screen">
      <div className="flex gap-6 lg:flex-row flex-col md:items-center md:justify-between">
        <h2 className="mango align-baseline tracking-wide font-bold text-6xl">
          Showcases
        </h2>
        <div className="flex items-center flex-wrap md:justify-center lg:justify-start gap-3">
          <button
            className={
              "border text-xs font-bold text-[var(--foreground)] py-2 px-4 border-[var(--foreground)] rounded-full cursor-pointer transition-colors hover:text-[var(--background)] hover:bg-[var(--foreground)] hover:border-[var(--background)]"
            }
          >
            All
          </button>
          {services.map((service, index) => {
            return (
              <button
                key={index}
                className="border whitespace-nowrap text-xs font-bold text-[var(--foreground)] py-2 px-4 border-[var(--foreground)] rounded-full cursor-pointer transition-colors hover:text-[var(--background)] hover:bg-[var(--foreground)] hover:border-[var(--background)]"
              >
                {service.title}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-24 md:mt-34 flex items-start gap-24 flex-col justify-between">
        {projects.map((project, index) => {
          return (
            <Link
              className="cursor-pointer flex flex-col xl:flex-row xl:items-center gap-8"
              key={index}
              href={"#"}
            >
              <ProjectImage src={`/videos/${index + 1}.mp4`} />
              <div className="md:basis-3xl">
                <p className="mango font-bold mt-8 tracking-wide text-5xl">
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
                      <HashIcon className="bg-[#89E101] p-1 rounded-lg stroke-black" />{" "}
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
