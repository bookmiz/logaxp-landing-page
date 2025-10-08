import { Calendar } from "lucide-react";

export default function Project() {
  return (
    <main className="px-4 md:px-24">
      <section className="md:mt-24 mt-16 items-center gap-12 flex flex-col justify-center">
        <span className="border whitespace-nowrap text-xs font-bold text-[var(--foreground)] py-2 px-4 border-[var(--foreground)] rounded-full">
          Web Design
        </span>
        <div>
          <h1 className="text-center mango text-6xl md:text-8xl font-bold">
            Behind the Scenes: How We Judge DEV Challenge Submissions
          </h1>
          <p className="align-middle text-white/50 md:text-base text-sm mt-4 text-center">
            <Calendar className="inline" />
            10/23/2024
          </p>
        </div>
        <video
          className="w-full aspect-square  md:aspect-11/6 rounded-4xl object-cover"
          src="/videos/6.mp4"
          autoPlay
        ></video>
      </section>
      <section className="font-mango flex flex-col mt-12 items-center text-lg leading-loose">
        <p className="lg:max-w-4xl">
          This master class will look into the UX / UI design of the next
          award-winning website. You will know what we aimed at, how the design
          concept was created, and the difficulties we had during development.
          The task seemed quite trivial - client&apos;s site had become
          outdated, so agency’s main mission was to redesign it. But, not just a
          redesign was needed here, but a complete rebranding, a new corporate
          identity, and a fresh look at the Potion product. Potion is a simple
          but effective sales tool for increasing conversions from cold leads
          and emails. As for the development itself, it is based on the
          lightweight Bona library (ex Evolve.js). We have been using an
          excellent and productive solution from GreenSock as an animation
          platform for several years. This library covers almost all cases with
          animations on our projects. It allows you to easily and quickly
          describe any animation in the form of a timeline, and use the
          ScrollTrigger plugin to bind it to the scroll. To organise smooth
          scrolling in the browser window, we use the SmoothScrollbar library,
          and a special plugin is used to connect it with ScrollTrigger. When
          creating the cursor effect, we used our previously announced Mouse
          Follower library. The most difficult task was to make falling stickers
          with text in the testimonials section, which should have physical
          properties and respond to the user&apos;s mouse cursor. The 2D physics
          engine Matter.js was chosen to solve this problem. The engine itself
          calculated only the physical parameters. And getting the coordinates
          and angles of these blocks was done using HTML/CSS.
        </p>
      </section>
    </main>
  );
}
