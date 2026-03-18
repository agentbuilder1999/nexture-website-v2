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
                <li><a href="mailto:hello@nexture.nz" className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">hello@nexture.nz</a></li>
                <li><p className="text-sm text-[var(--text-tertiary)]">Christchurch, New Zealand</p></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Nexture Limited. All rights reserved.</p>
          <p className="italic">TheraSeus is a CADe tool. Not for primary diagnosis.</p>
        </div>
      </div>
    </footer>
  );
}
