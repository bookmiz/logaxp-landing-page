import Hero, { Blog, Filler, Footer, Projects, Services } from "../sections";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Filler />
      <Projects />
      <Blog />
      <Footer />
    </main>
  );
}
