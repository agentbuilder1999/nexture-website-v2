'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import HeroBackground from '@/components/HeroBackground';
import SectionWrapper from '@/components/SectionWrapper';
import GradientText from '@/components/GradientText';
import PartnerLogos from '@/components/PartnerLogos';
import HeroParticles from '@/components/HeroParticles';
// WaveLayer removed per Victor request (2026-03-16)

const stats = [
  { value: 90, suffix: '%', label: 'Review Time Saved' },
  { value: 135, prefix: '$', label: 'Per Case — No Upfront Cost' },
  { value: 55000, suffix: '+', label: 'Frames Analysed Per Study' },
];

const features = [
  { icon: '⏱', title: 'Save 90% Time', desc: 'From 60 minutes down to 6. AI prioritises the most critical frames for your review.' },
  { icon: '🏥', title: 'No New Equipment', desc: 'Works with your existing Medtronic, Olympus, and Jinshan capsule endoscopy systems.' },
  { icon: '💰', title: 'From $135/Case', desc: 'Pay-per-case pricing. Immediate ROI — each case saves $200+ in physician time.' },
  { icon: '🔒', title: 'HIPAA Compliant', desc: 'Cloud or on-premise deployment. PHI de-identified locally before AI processing.' },
];

const steps = [
  { num: '01', title: 'Upload Study', desc: 'Upload your capsule endoscopy study directly or connect your workstation.' },
  { num: '02', title: 'AI Filters 55,000 Frames', desc: 'TheraSeus AI analyses every frame and surfaces the 1,250 most clinically relevant.' },
  { num: '03', title: 'Review & Report in 6 Min', desc: 'Doctor reviews AI-prioritised findings, confirms, and generates a signed report.' },
];

// ── CountUp hook using IntersectionObserver ──────────────────
function useCountUp(target: number, duration = 2000, triggered = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, triggered]);
  return count;
}

function StatCard({ value, suffix, prefix, label }: { value: number; suffix?: string; prefix?: string; label: string }) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 2000, triggered);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Format large numbers with commas
  const formatted = count >= 1000 ? count.toLocaleString() : count.toString();

  return (
    <div ref={ref}>
      <p className="text-4xl font-extrabold gradient-text mb-1">
        {prefix}{formatted}{suffix}
      </p>
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}

// ── Wistia embed block (replaces local introhome.mp4) ────────
// media-id: 3bhr3pi6rc | aspect: 16:9
function WistiaBlock({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-in-document */}
      <script src="https://fast.wistia.com/player.js" async />
      <script src="https://fast.wistia.com/embed/3bhr3pi6rc.js" async type="module" />
      {/* @ts-expect-error — wistia-player is a custom element */}
      <wistia-player
        media-id="3bhr3pi6rc"
        aspect="1.7777777777777777"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default function HomePage() {
  useEffect(() => {
    const els = document.querySelectorAll('.word-reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">

        {/* Layer 0 — Neural_Sieve base illustration */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/neural-sieve-2.png"
            alt=""
            fill
            priority
            quality={85}
            className="object-cover object-center"
            style={{ opacity: 0.35 }}
            sizes="100vw"
            aria-hidden="true"
          />
        </div>

        {/* Layer 1 — WaveLayer removed per Victor request (2026-03-16) */}

        {/* Layer 2 — hero-web.mp4 video (subtle motion) */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover z-[2]"
          style={{ opacity: 0.5 }}
          aria-hidden="true"
        >
          <source src="/assets/hero-web.mp4" type="video/mp4" />
        </video>

        {/* Layer 2 — ShaderGradient (opacity 0.55, per spec) */}
        <HeroBackground type="hero" opacity={0.55} />

        {/* Layer 3 — Particle field (120 particles, purple-pink-amber palette) */}
        <HeroParticles />

        {/* Layer 3 — text content */}
        <div className="relative z-10 container mx-auto px-[var(--px-page)] py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--accent-purple)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Now Available — NZ &amp; US Healthcare
            </div>

            {/* #9 — Hero H1 gradient: both lines use gradient-text */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-10 hero-title">
              <span className="gradient-text word-reveal" style={{transitionDelay:'0ms'}}>Pushing</span>{' '}
              <span className="gradient-text word-reveal" style={{transitionDelay:'80ms'}}>the</span>{' '}
              <span className="gradient-text word-reveal" style={{transitionDelay:'160ms'}}>Boundaries</span>
              <br />
              <span className="gradient-text word-reveal" style={{transitionDelay:'240ms'}}>of AI</span>
            </h1>

            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-teal">Request a Demo</Link>
              <Link href="/product" className="btn-ghost">Learn More →</Link>
            </div>
          </div>
        </div>

        {/* Bottom page-fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg-page)] to-transparent z-10 pointer-events-none" />
      </section>

      {/* ─── STATS BAR ────────────────────────────────────────────── */}
      {/* #7 — CountUp animation on scroll */}
      <section className="bg-[var(--bg-card)] border-y border-[var(--border-subtle)] px-[var(--px-page)] py-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {stats.map(({ value, suffix, prefix, label }) => (
              <StatCard key={label} value={value} suffix={suffix} prefix={prefix} label={label} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTRO VIDEO (below Hero) ─────────────────────────────── */}
      {/* #15 — Wistia embed replaces local introhome.mp4 (was 53MB, exceeded Vercel limit) */}
      <section className="w-full overflow-hidden bg-[var(--bg-section-alt)]" style={{ maxHeight: '60vh' }}>
        <WistiaBlock className="w-full" />
      </section>

      {/* ─── PRODUCT INTRO (TheraSeus + Funnel_Collapse) ──────────── */}
      <section className="section bg-texture relative">
        <div className="container mx-auto relative z-10">
          <SectionWrapper className="text-center mb-12">
            <p className="text-sm font-semibold text-[var(--primary)] uppercase tracking-widest mb-3">Our Product</p>
            <GradientText as="h2" className="text-4xl md:text-5xl font-extrabold mb-4 text-center">Meet TheraSeus</GradientText>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              AI-powered capsule endoscopy workflow. From 60 minutes to 6.
              More patients. Better outcomes. Same equipment.
            </p>
          </SectionWrapper>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map(({ icon, title, desc }, i) => (
                <SectionWrapper key={title} delay={i * 0.1}>
                  <div className="card h-full">
                    <span className="text-3xl mb-3 block">{icon}</span>
                    <h3 className="text-base font-bold text-[var(--text-heading)] mb-2">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </SectionWrapper>
              ))}
            </div>

            {/* Funnel_Collapse illustration — mix-blend-mode: screen */}
            <SectionWrapper delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-section-alt)]"
                   style={{ minHeight: 320 }}>
                {/* intro video behind */}
                <video
                  autoPlay muted loop playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  aria-hidden="true"
                >
                  <source src="/assets/intro.mp4" type="video/mp4" />
                </video>

                {/* Funnel_Collapse AI image with screen blend */}
                <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                  <Image
                    src="/assets/funnel-collapse.png"
                    alt="TheraSeus AI filters 55,000 capsule endoscopy frames to the 1,250 most clinically relevant"
                    fill
                    quality={85}
                    className="object-contain object-center"
                    style={{ mixBlendMode: 'screen', opacity: 0.9, filter: 'brightness(1.2) contrast(1.1)' }}
                    sizes="100vw"
                    priority
                  />
                </div>

                {/* Caption overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg-section-alt)] to-transparent">
                  <p className="text-xs text-[var(--text-muted)] italic text-center">
                    TheraSeus — AI-assisted capsule endoscopy. Not for primary diagnosis.
                  </p>
                </div>
              </div>
            </SectionWrapper>
          </div>

          <SectionWrapper className="text-center mt-10">
            {/* #8 — Secondary CTA uses btn-secondary */}
            <Link href="/product" className="btn-secondary">Explore TheraSeus →</Link>
          </SectionWrapper>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="section bg-[var(--bg-section-alt)]">
        <div className="container mx-auto">
          <SectionWrapper className="text-center mb-12">
            <GradientText as="h2" className="text-4xl md:text-5xl font-extrabold mb-4">How It Works</GradientText>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Three steps from study upload to signed report.
            </p>
          </SectionWrapper>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ num, title, desc }, i) => (
              <SectionWrapper key={num} delay={i * 0.15}>
                <div className="card relative overflow-hidden">
                  <div className="text-6xl font-extrabold text-[var(--border-subtle)] absolute top-4 right-4 select-none font-mono">
                    {num}
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-2">Step {num}</p>
                    <h3 className="text-lg font-bold text-[var(--text-heading)] mb-3">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNER LOGOS ────────────────────────────────────────── */}
      <section className="section-sm bg-[var(--bg-page)]">
        <div className="container mx-auto">
          <SectionWrapper className="text-center">
            <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-8">
              Trusted &amp; Supported By
            </p>
            <PartnerLogos />
          </SectionWrapper>
        </div>
      </section>

      {/* ─── A5: Remnant Shell brand-area — #3 video overlay ─────── */}
      {/* #3 — Wistia embed replaces local introhome.mp4 */}
      <div className="relative w-full h-[480px] overflow-hidden bg-[var(--bg-section-alt)]">
        {/* Wistia embed layer */}
        <WistiaBlock className="absolute inset-0 w-full h-full" />

        {/* Remnant Shell image on top */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/assets/remnant-shell-3.png"
            alt=""
            fill
            quality={75}
            className="object-cover object-center"
            style={{ opacity: 0.5, mixBlendMode: 'screen' }}
            sizes="100vw"
            aria-hidden="true"
          />
        </div>
        {/* Left + right edge fades */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-section-alt)] via-transparent to-[var(--bg-section-alt)] opacity-70 pointer-events-none" />
        {/* Top + bottom fades */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-section-alt)] via-transparent to-[var(--bg-section-alt)] opacity-60 pointer-events-none" />
      </div>

      {/* ─── FINAL CTA ────────────────────────────────────────────── */}
      <section className="section bg-[var(--bg-section-alt)] relative overflow-hidden">
        <HeroBackground type="section" opacity={0.2} />
        <div className="container mx-auto relative z-10 text-center">
          <SectionWrapper>
            <GradientText as="h2" className="text-4xl md:text-5xl font-extrabold mb-4">
              Ready to Transform Your Practice?
            </GradientText>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Join gastroenterologists across New Zealand and the US already saving time with TheraSeus.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {/* Primary CTAs use btn-teal (highest visual weight) */}
              <Link href="/contact" className="btn-teal">Request a Demo</Link>
              <Link href="/contact?type=pilot" className="btn-ghost">Join as a Pilot Partner</Link>
            </div>
          </SectionWrapper>
        </div>
      </section>
    </>
  );
}
