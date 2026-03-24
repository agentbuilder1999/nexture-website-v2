'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/product', label: 'Product' },
  { href: '/about',   label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`nav-blur fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'scrolled' : ''}`}>
      <div className="section-container flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="Nexture home">
          <Image
            src="/assets/logo.png"
            alt="Nexture"
            width={120}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href || pathname?.startsWith(href + '/') ? 'active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link href="/contact" className="btn-primary text-sm py-2.5 px-5">
            Book Demo
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[var(--text-on-dark-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cta)] rounded"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-80' : 'max-h-0'}`}
        style={{ background: 'rgba(6, 10, 20, 0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-dark)' }}
      >
        <nav className="px-6 py-4 space-y-1" aria-label="Mobile navigation">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block py-3 px-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'text-[var(--text-on-dark-primary)] bg-[rgba(232,0,90,0.08)]'
                  : 'text-[var(--text-on-dark-secondary)] hover:text-[var(--text-on-dark-primary)]'
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            <Link href="/contact" className="btn-primary text-sm py-2.5 w-full justify-center">
              Book Demo
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
