'use client';
import Link from 'next/link';
import Image from 'next/image';

const navLinks = [
  { href: '/product', label: 'Product' },
  { href: '/about',   label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const complianceItems = [
  'HIPAA-Ready',
  'NZ Privacy Act',
  'Medsafe SaMD (In Progress)',
];

export default function Footer() {
  return (
    <footer className="section-dark" style={{ borderTop: '1px solid var(--border-dark)' }}>
      <div className="section-container px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand column */}
          <div className="col-span-1">
            <Link href="/" aria-label="Nexture home">
              <Image src="/assets/logo.png" alt="Nexture" height={28} width={110} className="h-7 w-auto mb-4" />
            </Link>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-on-dark-secondary)' }}>
              Clinical-grade AI for capsule endoscopy. Empowering gastroenterologists to diagnose faster, with confidence.
            </p>
            <address className="not-italic text-sm" style={{ color: 'var(--text-on-dark-muted)' }}>
              Te Ohaka — Centre for Growth &amp; Innovation<br />
              KBlock, Ara Institute<br />
              Christchurch 8011, New Zealand
            </address>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-label mb-4">Navigation</p>
            <ul className="space-y-2.5">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors"
                    style={{ color: 'var(--text-on-dark-secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-on-dark-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-on-dark-secondary)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Compliance */}
          <div>
            <p className="text-label mb-4">Contact</p>
            <ul className="space-y-2.5 mb-6">
              <li>
                <a
                  href="mailto:hello@nexture.nz"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-on-dark-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-cta)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-on-dark-secondary)')}
                >
                  hello@nexture.nz
                </a>
              </li>
              <li>
                <a
                  href="mailto:shawn@nexture.nz"
                  className="text-sm transition-colors"
                  style={{ color: 'var(--text-on-dark-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-cta)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-on-dark-secondary)')}
                >
                  shawn@nexture.nz
                </a>
              </li>
            </ul>
            <p className="text-label mb-3">Compliance</p>
            <ul className="space-y-1.5">
              {complianceItems.map(item => (
                <li key={item} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-on-dark-muted)' }}>
                  <span style={{ color: 'var(--color-data-positive)' }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-8" style={{ borderTop: '1px solid var(--border-dark)' }}>
          <p className="text-xs" style={{ color: 'var(--text-on-dark-muted)' }}>
            © {new Date().getFullYear()} Nexture Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/nexture-limited"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nexture on LinkedIn"
              className="transition-colors"
              style={{ color: 'var(--text-on-dark-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-on-dark-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-on-dark-muted)')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <p className="text-xs italic" style={{ color: 'var(--text-on-dark-muted)' }}>
              TheraSeus is a CADe tool. Not for primary diagnosis.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
