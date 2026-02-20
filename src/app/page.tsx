import Hero, { Blog, Filler, Footer, HrSection, Projects, Services } from "../sections";

export default function Home() {
  return (
    <main>
      <Hero />
        <HrSection />
      <Services />
      <Filler />
      <Projects />
      <Blog />
      <Footer />
    </main>
  );
}
