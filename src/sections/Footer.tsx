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
                <Link 
                  href="/hr"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Discuss integrations
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy"
                  className="hover:text-[#86BF00] text-[var(--foreground)]  transition-colors duration-200"
                >Privacy information</Link>
              </li>
              <li>
                <Link 
                  href="/blog"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Articles
                </Link>
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
                <Link 
                  href="/blog"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Contact support
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Technical enquiries
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="hover:text-[#86BF00] text-[var(--foreground)] transition-colors duration-200"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link 
                  href="/demo"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Request a demo
                </Link>
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
                <Link 
                  href="/about"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Work with us
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Media enquiries
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact-us"
                  className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
 <li>
  <Link 
              href="/admin/login"
              className="hover:text-[#86BF00]  text-[var(--foreground)] transition-colors duration-200"
            >
              
              Portal
            </Link>
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
