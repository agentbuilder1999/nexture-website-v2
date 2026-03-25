import Link from 'next/link';
import Image from 'next/image';

const links = [
  { href: '/product', label: 'Product' },
  { href: '/team', label: 'Team' },
  { href: '/media', label: 'Media' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-section-alt)] border-t border-[var(--border-subtle)] px-[var(--px-page)] py-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div className="max-w-xs">
            <Image src="/assets/logo.png" alt="Nexture" height={24} width={100} className="h-6 w-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Pushing the boundaries of AI in healthcare. Headquartered in Christchurch, New Zealand.
            </p>
          </div>

          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Navigation</p>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-3">Contact</p>
              <ul className="space-y-2">
                {/* item #10 — email replaced with Contact Us link */}
                <li>
                  <Link href="/contact" className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li><p className="text-sm text-[var(--text-tertiary)]">Christchurch, New Zealand</p></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Nexture Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {/* LinkedIn company page */}
            <a
              href="https://www.linkedin.com/company/nexture-limited"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nexture on LinkedIn"
              className="hover:text-[var(--accent-purple)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <p className="italic">TheraSeus is a CADe tool. Not for primary diagnosis.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
