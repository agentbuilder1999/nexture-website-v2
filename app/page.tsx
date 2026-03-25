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
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
        {prefix}{formatted}{suffix}
      </p>
      <p className="text-sm md:text-base text-white/80 font-medium">{label}</p>
    </div>
  );
}

// ── Stats + Video Section (item #5) ─────────────────────────
// Video plays full-width/height. Stats overlaid centered on top.
// Click to toggle mute; default muted.
function StatsVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (muted) {
      video.muted = false;
      video.volume = 0.6;
      setMuted(false);
    } else {
      video.muted = true;
      setMuted(true);
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden cursor-pointer"
      style={{ minHeight: '480px', aspectRatio: '16/7' }}
      onClick={handleVideoClick}
      aria-label="Stats section — click to toggle audio"
    >
      {/* Full-width background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-contain"
        style={{ background: 'var(--bg-section-alt)' }}
      >
        <source src="/assets/intro.mp4" type="video/mp4" />
      </video>

      {/* Semi-transparent overlay for legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(12,5,36,0.55) 0%, rgba(10,5,32,0.45) 100%)' }}
      />

      {/* Stats overlay — centered, pointer-events none so click passes through to video */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 px-8 text-center w-full max-w-4xl mx-auto">
          {stats.map(({ value, suffix, prefix, label }) => (
            <StatCard key={label} value={value} suffix={suffix} prefix={prefix} label={label} />
          ))}
        </div>
      </div>

      {/* Mute indicator */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-white/70">
          {muted ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
              Tap for sound
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
              Tap to mute
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Parallax hook for product image (item #6) ────────────────
function useParallax(strength = 30) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        // progress: -1 (above viewport) → 0 (centred) → 1 (below)
        const progress = ((rect.top + rect.height / 2) - viewH / 2) / viewH;
        const clampedProgress = Math.max(-1, Math.min(1, progress));
        el.style.transform = `translateY(${clampedProgress * strength}px)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [strength]);
  return ref;
}

export default function HomePage() {
  const parallaxRef = useParallax(24);

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
        {/* Particles must remain unaffected — z-index and container unchanged */}
        <HeroParticles />

        {/* Layer 3 — text content */}
        <div className="relative z-10 container mx-auto px-[var(--px-page)] py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--accent-purple)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Now Available — NZ &amp; US Healthcare
            </div>

            {/* item #4 — Hero H1: increased line-height to prevent overlap */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-10 hero-title" style={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              <span className="gradient-text word-reveal" style={{transitionDelay:'0ms'}}>Pushing</span>{' '}
              <span className="gradient-text word-reveal" style={{transitionDelay:'80ms'}}>the</span>{' '}
              <span className="gradient-text word-reveal" style={{transitionDelay:'160ms'}}>Boundaries</span>
              <br />
              <span className="gradient-text word-reveal" style={{transitionDelay:'240ms'}}>of AI</span>
            </h1>

            {/* item #4 — removed "Request a Demo" btn; keep only "Learn More" → /product */}
            <div className="flex flex-wrap gap-4">
              <Link href="/product" className="btn-ghost">Learn More →</Link>
            </div>
          </div>
        </div>

        {/* Bottom page-fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg-page)] to-transparent z-10 pointer-events-none" />
      </section>

      {/* ─── STATS + VIDEO (item #5 — major rework) ──────────────── */}
      <StatsVideoSection />

      {/* ─── PRODUCT INTRO (TheraSeus + Funnel_Collapse) ──────────── */}
      {/* item #6 — parallax reveal animation, image fills container, caption inside image */}
      <section className="section bg-texture relative overflow-hidden">
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
            {/* Feature cards — slide-in from left */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map(({ icon, title, desc }, i) => (
                <SectionWrapper key={title} delay={i * 0.12}>
                  <div className="card h-full" style={{ transform: 'none' }}>
                    <span className="text-3xl mb-3 block">{icon}</span>
                    <h3 className="text-base font-bold text-[var(--text-heading)] mb-2">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </SectionWrapper>
              ))}
            </div>

            {/* item #6 — image fills container; caption inside image as overlay */}
            {/* Parallax effect via scroll listener — subtle professional reveal */}
            <SectionWrapper delay={0.2}>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{ minHeight: 380 }}
              >
                {/* intro video behind — fills container, no gaps */}
                <video
                  autoPlay muted loop playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  aria-hidden="true"
                >
                  <source src="/assets/intro.mp4" type="video/mp4" />
                </video>

                {/* Funnel_Collapse AI image — parallax, fills container with object-cover */}
                <div ref={parallaxRef} className="relative w-full h-full product-parallax-image" style={{ minHeight: 380 }}>
                  <Image
                    src="/assets/funnel-collapse.png"
                    alt="TheraSeus AI filters 55,000 capsule endoscopy frames to the 1,250 most clinically relevant"
                    fill
                    quality={85}
                    className="object-cover object-center"
                    style={{ mixBlendMode: 'screen', opacity: 0.9, filter: 'brightness(1.2) contrast(1.1)' }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>

                {/* item #6 — caption INSIDE image as bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-4 py-3"
                     style={{ background: 'linear-gradient(to top, rgba(10,5,32,0.80) 0%, rgba(10,5,32,0.40) 60%, transparent 100%)' }}>
                  <p className="text-xs text-white/75 italic text-center">
                    TheraSeus — AI-assisted capsule endoscopy. Not for primary diagnosis.
                  </p>
                </div>
              </div>
            </SectionWrapper>
          </div>

          <SectionWrapper className="text-center mt-10">
            <Link href="/product" className="btn-secondary">Explore TheraSeus →</Link>
          </SectionWrapper>
        </div>
      </section>

      {/* ─── HOW IT WORKS — DELETED (item #7) ────────────────────── */}

      {/* ─── PARTNER LOGOS (item #8 — heading renamed to "Acknowledgment") */}
      <section className="section-sm bg-[var(--bg-page)]">
        <div className="container mx-auto">
          <SectionWrapper className="text-center">
            <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-8">
              Acknowledgment
            </p>
            <PartnerLogos />
          </SectionWrapper>
        </div>
      </section>

      {/* ─── A5: Remnant Shell brand-area — DELETED (item #9) ─────── */}

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
              <Link href="/contact" className="btn-teal">Request a Demo</Link>
              <Link href="/contact?type=pilot" className="btn-ghost">Join as a Pilot Partner</Link>
            </div>
          </SectionWrapper>
        </div>
      </section>
    </>
  );
}
