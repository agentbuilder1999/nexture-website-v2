import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SectionWrapper from '@/components/SectionWrapper';
import GradientText from '@/components/GradientText';
import HeroBackground from '@/components/HeroBackground';

export const metadata: Metadata = {
  title: 'Team — Nexture',
  description: 'Meet the team behind Nexture. Headquartered in Christchurch, New Zealand.',
};

const pillars = [
  { icon: '🔬', title: 'R&D Excellence', desc: 'Headquartered in Christchurch, Nexture leverages local research resources and exceptional talent to drive continuous, cutting-edge technological innovation.' },
  { icon: '🌍', title: 'International Expertise', desc: 'Our founders bring years of deep engagement and leadership in the digitalization of healthcare and advanced artificial intelligence across multiple markets.' },
  { icon: '⚡', title: 'Proprietary Technology', desc: 'Nexture develops its own proprietary core technologies, establishing a leading edge in specialized fields such as capsule robotics and deep learning.' },
];

const values = [
  { title: 'Intuitive Experience', desc: 'We pioneer intuitive AI solutions, crafting products that seamlessly integrate into daily clinical operations.' },
  { title: 'Operational Efficiency', desc: 'We empower users to optimize workflows, achieve substantial cost savings, and gain superior control over their practice.' },
];

export default function TeamPage() {
  return (
    <>
      {/* ─── HERO with Remnant_Shell background ─────────────────── */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden pt-16">
        {/* Remnant_Shell — right-anchored, left space for text */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/remnant-shell.png"
            alt=""
            fill
            priority
            quality={80}
            className="object-cover"
            style={{
              objectPosition: 'right center',
              opacity: 0.28,
              mixBlendMode: 'screen',
            }}
            sizes="100vw"
            aria-hidden="true"
          />
          {/* Left-side text-protection gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to right, rgba(12,5,36,0.95) 0%, rgba(12,5,36,0.6) 50%, rgba(12,5,36,0.1) 100%)',
            }}
          />
          {/* Bottom fade into page */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{
              background: 'linear-gradient(to bottom, transparent, var(--bg-page))',
            }}
          />
        </div>

        {/* ShaderGradient section overlay */}
        <HeroBackground type="section" opacity={0.2} />

        <div className="container mx-auto px-[var(--px-page)] py-24 relative z-10 max-w-2xl mr-auto">
          <SectionWrapper>
            <GradientText as="h1" className="text-5xl md:text-6xl font-extrabold mb-4">
              The Team Behind Nexture
            </GradientText>
            <p className="text-xl text-[var(--text-secondary)] leading-relaxed">
              Headquartered in Christchurch, New Zealand. Building AI for the future of healthcare.
            </p>
          </SectionWrapper>
        </div>
      </section>

      {/* ─── FOUNDER ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container mx-auto">
          <SectionWrapper>
            <div className="flex flex-col md:flex-row gap-8 items-center max-w-3xl mx-auto">
              {/* Victor photo: placeholder removed — supply photo asset to re-enable */}
              <div>
                <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-1">Founder &amp; CEO</p>
                <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-3">Victor Sun</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  Victor leads Nexture with a vision to make AI-powered diagnostics accessible to every gastroenterology practice.
                  With deep expertise in healthcare AI and product development, he is building the technology stack that enables
                  clinicians to focus on what matters most — patient care.
                </p>
                <div className="flex gap-3">
                  <Link href="/contact" className="btn-teal text-sm py-2 px-4">Get in Touch</Link>
                  <a href="#" className="btn-ghost text-sm py-2 px-4">LinkedIn ↗</a>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* ─── THREE PILLARS ────────────────────────────────────────── */}
      <section className="section bg-[var(--bg-section-alt)] relative overflow-hidden">
        {/* Subtle Remnant_Shell echo in background */}
        <div className="absolute right-0 top-0 w-1/2 h-full z-0 pointer-events-none">
          <Image
            src="/assets/remnant-shell.png"
            alt=""
            fill
            quality={50}
            className="object-cover object-right"
            style={{ opacity: 0.06, mixBlendMode: 'screen' }}
            sizes="50vw"
            aria-hidden="true"
          />
        </div>

        <div className="container mx-auto relative z-10">
          <SectionWrapper className="text-center mb-12">
            <GradientText as="h2" className="text-4xl font-extrabold mb-3">Why Nexture</GradientText>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">Three core strengths that define our approach.</p>
          </SectionWrapper>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map(({ icon, title, desc }, i) => (
              <SectionWrapper key={title} delay={i * 0.12}>
                <div className="card h-full text-center">
                  <span className="text-4xl mb-4 block">{icon}</span>
                  <h3 className="text-lg font-bold text-[var(--text-heading)] mb-3">{title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUES ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container mx-auto max-w-3xl">
          <SectionWrapper className="text-center mb-10">
            <GradientText as="h2" className="text-4xl font-extrabold mb-3">Our Values</GradientText>
          </SectionWrapper>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map(({ title, desc }, i) => (
              <SectionWrapper key={title} delay={i * 0.1}>
                <div className="card">
                  <h3 className="font-bold text-[var(--text-heading)] mb-2">{title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HIRING CTA ───────────────────────────────────────────── */}
      <section className="section bg-[var(--bg-section-alt)]">
        <div className="container mx-auto text-center">
          <SectionWrapper>
            <GradientText as="h2" className="text-3xl font-extrabold mb-3">We&apos;re Hiring</GradientText>
            <p className="text-[var(--text-secondary)] mb-6 max-w-lg mx-auto">
              Join a small, focused team building the future of healthcare AI in New Zealand.
            </p>
            <a href="mailto:hello@nexture.nz?subject=Careers at Nexture" className="btn-primary">
              View Open Roles →
            </a>
          </SectionWrapper>
        </div>
      </section>
    </>
  );
}
