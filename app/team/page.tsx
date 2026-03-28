import type { Metadata } from 'next';
import Image from 'next/image';
import SectionWrapper from '@/components/SectionWrapper';
import GradientText from '@/components/GradientText';

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
      {/* ─── HERO with background image ─────────────────── */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden pt-16">
        {/* Background image */}
        <Image
          src="/images/headers/t.jpg"
          alt=""
          fill
          priority
          quality={85}
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden="true"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(0, 0, 0, 0.52)' }} />
        {/* Bottom fade into page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 z-[2]"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-page))' }}
        />

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

    </>
  );
}
