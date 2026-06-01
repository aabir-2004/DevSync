import Link from "next/link";
import { Globe, Shield } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Explore",
      links: [
        { href: "/resources", label: "Shared Resources" },
        { href: "/blogs", label: "Tech Blogs" },
        { href: "/forums", label: "Discussion Forums" },
        { href: "/dsa", label: "DSA Practice Sheets" },
      ],
    },
    {
      title: "Community",
      links: [
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/announcements", label: "Announcements" },
        { href: "/faq", label: "Frequently Asked" },
      ],
    },
    {
      title: "Legal & Support",
      links: [
        { href: "/rules", label: "Community Guidelines" },
        { href: "/admin", label: "Mod Portal" },
        { href: "/report", label: "Report Issue" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-white dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-900 py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-100 dark:border-zinc-900">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-1.5 text-lg font-bold">
              <span className="text-primary font-mono text-xl font-black">{`{`}</span>
              <span className="text-zinc-900 dark:text-white font-sans tracking-wide">DevSync</span>
              <span className="text-primary font-mono text-xl font-black">{`}`}</span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              A premium, collaborative, and gamified workspace tailored for developers and students to learn, share resources, and solve problems together.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3.5 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-zinc-400 hover:text-primary dark:text-zinc-500 dark:hover:text-primary transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-zinc-400 hover:text-primary dark:text-zinc-500 dark:hover:text-primary transition-colors"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a 
                href="https://google.com" 
                target="_blank" 
                rel="noreferrer" 
                className="text-zinc-400 hover:text-primary dark:text-zinc-500 dark:hover:text-primary transition-colors"
              >
                <Globe className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerSections.map((section, idx) => (
            <div key={idx} className="space-y-3.5">
              <h4 className="text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                {section.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href} 
                      className="text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-[11px] text-zinc-400">
          <p>© {currentYear} DevSync. Built with pride for collaborative growth.</p>
          <div className="flex items-center gap-4 mt-3 sm:mt-0">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-primary" />
              Secured by Supabase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
