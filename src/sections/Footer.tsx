import Image from "next/image";
 
import Link from "next/link";
import { OFFICES } from "@/logaxp/config/offices";


export default function Footer() {
  return (
    <footer className="py-4 geist md:py-8 px-4 md:px-24 bg-[var(--background)] text-gray-500">
      <div className="container mx-auto py-12">
        <section aria-label="Our offices" className="mb-10 grid gap-6 border-b border-gray-200 pb-8 dark:border-gray-700 md:grid-cols-2">
          {OFFICES.map((office) => (
            <div key={office.name}>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">{office.name}</h3>
              <address className="mt-3 text-sm not-italic leading-6 text-gray-600 dark:text-gray-400">
                {office.lines.map((line) => <span key={line} className="block">{line}</span>)}
              </address>
            </div>
          ))}
        </section>
        {/* Footer Content: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              {/* SVG Logo */}
      <Link href="/">
  <Image
    src="/logo-light.png"
    alt="LogaXp logo"
    width={140}
    height={40}
    priority
    className="block dark:hidden" // shows only in light mode
  />
  <Image
    src="/logo-dark.png"
    alt="LogaXp logo"
    width={140}
    height={40}
    priority
    className="hidden dark:block" // shows only in dark mode
  />
</Link>

            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Custom software and products for people and business. Loga
              <span className="text-[#86BF00]">XP</span> provides the tools you
              need to grow your business with confidence.
            </p>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <h3 className="text-sm font-semibold  text-[var(--foreground)] tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="/hr"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Discuss integrations
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-[#86BF00] text-[var(--foreground)]  transition-colors duration-200"
                >Privacy information</a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Articles
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources Links */}
          <div>
            <h3 className="text-sm font-semibold  text-[var(--foreground)] tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="/blog"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Contact support
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Technical enquiries
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="/demo"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Request a demo
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="/about"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Work with us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Media enquiries
                </a>
              </li>
              <li>
                <a
                  href="/contact-us"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
 <li>
  <a
              href="/admin/login"
              className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
            >
              
              Portal
            </a>
</li>

            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Social Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} Loga<span className="text-[#86BF00]">XP</span>. All
              Rights Reserved.
            </p>
          
          </div>
          <div className="flex flex-wrap gap-4 mt-4 sm:mt-0 text-sm">
            <Link href="/privacy" className="hover:text-[#86BF00]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#86BF00]">Terms</Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
