import Image from "next/image";
 
import Link from "next/link";


export default function Footer() {
  return (
    <footer className="py-4 geist md:py-8 px-4 md:px-24 bg-[var(--background)] text-gray-500">
      <div className="container mx-auto py-12">
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
              Experience elevated analytics and insights. Loga
              <span className="text-[#89E101]">XP</span> provides the tools you
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
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)] transition-colors duration-200"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)] transition-colors duration-200"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)] transition-colors duration-200"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)]  transition-colors duration-200"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)] transition-colors duration-200"
                >
                  Changelog
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
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)] transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)] transition-colors duration-200"
                >
                  API Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101] text-[var(--foreground)] transition-colors duration-200"
                >
                  System Status
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101]  text-[var(--foreground)] transition-colors duration-200"
                >
                  FAQ
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
                  className="hover:text-[#89E101]  text-[var(--foreground)] transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#89E101]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Press
                </a>
              </li>
              <li>
                <a
                  href="/contact-us"
                  className="hover:text-[#89E101]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
 <li>
  <a
              href="/admin/login"
              className="hover:text-[#89E101]  text-[var(--foreground)] transition-colors duration-200"
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
              &copy; 2025 Loga<span className="text-[#89E101]">XP</span>, Inc. All
              Rights Reserved.
            </p>
          
          </div>
          <div className="flex space-x-5 mt-4 sm:mt-0">
            {/* Social Icons */}
            <a
              href="#"
              className="hover:text-[#89E101] transition-colors duration-200"
            >
              <span className="sr-only">X (formerly Twitter)</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="hover:text-[#89E101] transition-colors duration-200"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
              </svg>
            </a>
            <a
              href="#"
              className="hover:text-[#89E101] transition-colors duration-200"
            >
              <span className="sr-only">GitHub</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}