import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/ScrollReveal';

export default function AboutPage() {
  return (
    <>
      {/* ════════════════════════════════════════
          HERO — Dark
          ════════════════════════════════════════ */}
      <section className="section-dark relative min-h-[60vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 70% 60%, rgba(123,32,112,0.10) 0%, transparent 70%)' }} />

        <div className="section-container px-6 py-24 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-label mb-5 animate-fade-up">About Nexture</p>
              <h1 className="font-display font-extrabold mb-6 animate-fade-up"
                style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-on-dark-primary)', animationDelay: '80ms' }}>
                AI That Respects the{' '}
                <span className="gradient-text">Doctor-Patient Relationship</span>
              </h1>
              <p className="text-lg leading-relaxed animate-fade-up"
                style={{ color: 'var(--text-on-dark-secondary)', maxWidth: '480px', animationDelay: '200ms' }}>
                Nexture builds clinical-grade AI software that empowers doctors to diagnose faster —
                with confidence and compliance.
              </p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="relative rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border-dark-strong)', boxShadow: '0 0 60px rgba(123,32,112,0.15)' }}>
                <Image
                  src="/assets/remnant-shell-3.png"
                  alt="Nexture abstract brand visual"
                  width={580}
                  height={400}
                  className="w-full h-auto"
                  quality={80}
                  style={{ opacity: 0.85, mixBlendMode: 'screen' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          MISSION — Light
          ════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <p className="font-display font-bold text-2xl md:text-3xl leading-snug mb-12"
              style={{ color: 'var(--text-on-light-primary)', letterSpacing: '-0.02em' }}>
              &ldquo;We don&apos;t build autonomous diagnostics.
              We build intelligent tools that respect the
              doctor-patient relationship.&rdquo;
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔬',
                title: 'R&D in Christchurch',
                desc: 'Developed at Te Ohaka — Centre for Growth & Innovation, in partnership with Ara Institute of Canterbury.',
              },
              {
                icon: '🌏',
                title: 'International Team',
                desc: 'A multidisciplinary team spanning medical informatics, computer vision, clinical gastroenterology, and regulatory affairs.',
              },
              {
                icon: '🔒',
                title: 'Proprietary Technology',
                desc: 'Purpose-built for capsule endoscopy — not a general medical AI repurposed for GI. Our dataset and model architecture are proprietary.',
              },
            ].map(({ icon, title, desc }, i) => (
              <ScrollReveal key={title} delay={(i + 1) as 1 | 2 | 3}>
                <div className="feature-card-light text-center py-8">
                  <div className="text-3xl mb-4" aria-hidden="true">{icon}</div>
                  <h3 className="font-display font-semibold text-xl mb-3" style={{ color: 'var(--text-on-light-primary)' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-on-light-secondary)' }}>{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TEAM — Dark
          ════════════════════════════════════════ */}
      <section className="section-dark section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4">The Team</p>
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-dark-primary)' }}>
              Led by Experienced Innovators
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Victor Shawn',
                title: 'CEO & Co-Founder',
                bio: 'Leading Nexture\'s vision to transform GI diagnostics with clinical-grade AI. Based in Christchurch, New Zealand.',
                initials: 'VS',
              },
              {
                name: 'Technical Team',
                title: 'AI & Engineering',
                bio: 'International team specialising in computer vision, deep learning, and medical image analysis.',
                initials: 'AI',
              },
              {
                name: 'Clinical Advisory',
                title: 'Gastroenterology',
                bio: 'Clinical advisors from leading gastroenterology practices ensuring TheraSeus meets real-world workflow needs.',
                initials: 'CA',
              },
            ].map(({ name, title, bio, initials }, i) => (
              <ScrollReveal key={name} delay={(i + 1) as 1 | 2 | 3}>
                <div className="feature-card-dark flex flex-col gap-4">
                  {/* Avatar placeholder */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-xl text-white"
                    style={{ background: 'var(--gradient-hero)' }}>
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--text-on-dark-primary)' }}>{name}</h3>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-cta)' }}>{title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-on-dark-secondary)' }}>{bio}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          MILESTONES — Light
          ════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4" style={{ color: 'var(--color-cta)' }}>Timeline</p>
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-light-primary)' }}>
              From Idea to Clinical AI Platform
            </h2>
          </ScrollReveal>

          {/* Timeline */}
          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 md:left-1/2"
              style={{ background: 'linear-gradient(to bottom, var(--color-cta), var(--color-accent-soft))', transform: 'translateX(-50%)' }} aria-hidden="true" />

            {[
              { year: '2024', title: 'Founded Nexture', desc: 'Established in Christchurch, NZ. Identified capsule endoscopy AI as an unaddressed clinical need.' },
              { year: '2025 Q1', title: 'NVIDIA Inception + First AI Prototype', desc: 'Accepted into NVIDIA Inception program. First prototype demonstrated 90% time reduction in internal testing.' },
              { year: '2025 Q3', title: 'Google Cloud + AWS Partnership', desc: 'Secured HIPAA-eligible cloud infrastructure partnerships. PHI security architecture completed.' },
              { year: '2026', title: 'TheraSeus Launch + Pilot Program', desc: 'Clinical pilot program launching with NZ and US gastroenterology practices.' },
              { year: '2027', title: 'FDA 510(k) Roadmap', desc: 'US regulatory pathway planning underway. Targeting FDA 510(k) clearance for expanded market.' },
            ].map(({ year, title, desc }, i) => (
              <ScrollReveal key={year} delay={(Math.min(i, 3) + 1) as 1 | 2 | 3 | 4}>
                <div className={`relative flex gap-8 pb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start`}>
                  {/* Content */}
                  <div className={`ml-16 md:ml-0 flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                    <div className="feature-card-light inline-block text-left" style={{ maxWidth: 300 }}>
                      <p className="text-label mb-2" style={{ color: 'var(--color-cta)' }}>{year}</p>
                      <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-on-light-primary)' }}>{title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-on-light-secondary)' }}>{desc}</p>
                    </div>
                  </div>
                  {/* Dot on line */}
                  <div className="absolute left-6 md:left-1/2 top-4 w-3 h-3 rounded-full border-2 border-white -translate-x-1/2 z-10"
                    style={{ background: 'var(--color-cta)' }} aria-hidden="true" />
                  {/* Spacer */}
                  <div className="hidden md:block flex-1" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ECOSYSTEM — Light
          ════════════════════════════════════════ */}
      <section className="section-light-surface section-py" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-10">
            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', letterSpacing: '-0.02em', color: 'var(--text-on-light-primary)' }}>
              Our Ecosystem
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'NVIDIA Inception', icon: '🏆' },
                { label: 'Google Cloud Partner', icon: '☁️' },
                { label: 'Ministry of Awesome', icon: '🚀' },
                { label: 'Ara Institute', icon: '🎓' },
                { label: 'University of Otago', icon: '🏛️' },
                { label: 'AWS Healthcare', icon: '⚡' },
              ].map(({ label, icon }) => (
                <span key={label} className="trust-badge" style={{ background: 'white', border: '1px solid var(--border-light)', color: 'var(--text-on-light-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
                  <span aria-hidden="true">{icon}</span> {label}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          INVESTOR CTA — Dark
          ════════════════════════════════════════ */}
      <section className="section-dark section-py relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(45,50,130,0.15) 0%, transparent 70%)' }} />
        <div className="section-container px-6 relative z-10 text-center">
          <ScrollReveal>
            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: 'var(--text-on-dark-primary)' }}>
              Interested in Partnering or Investing?
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-on-dark-secondary)' }}>
              We&apos;re at an early but decisive stage. Join us in building the future of GI diagnostics.
            </p>
            <Link href="/contact?type=investor" className="btn-primary text-base px-8 py-4">
              Schedule a Catchup with Victor →
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
