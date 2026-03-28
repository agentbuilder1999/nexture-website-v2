'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/product', label: 'Product' },
  { href: '/team', label: 'Team' },
  { href: '/media', label: 'Media' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 nav-blur ${
        scrolled ? 'shadow-lg' : ''
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo — enlarged (item #1) */}
        <Link href="/" className="logo-link flex items-center gap-2 flex-shrink-0">
          <Image src="/assets/logo.png" alt="Nexture" width={140} height={140} className="h-14 w-auto object-contain" unoptimized />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link text-sm font-medium ${
                pathname === href ? 'active' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA removed (item #3) */}

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-[var(--text-secondary)]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-current transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-current transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu — no Request Demo button (item #3) */}
      {open && (
        <div className="md:hidden bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] px-6 py-4 space-y-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block text-sm font-medium py-1.5 px-3 rounded-lg transition-colors ${
                pathname === href
                  ? 'bg-[rgba(154,129,223,0.22)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
