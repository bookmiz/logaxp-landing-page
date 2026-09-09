import type { Metadata } from "next";
import Projects from "../../sections/Projects";
import { Footer } from "../../sections";

export const metadata: Metadata = {
  title: "Our products",
  description: "Explore Hearken, GatherPlux, BookMiz, HireAFixer, LogaDash, Flospay, Patvero and OmoFlow — products from LogaXP.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return <main><Projects showAll /><Footer /></main>;
}
