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
  { icon: '⏱', title: 'Save 90% Time', desc: 'From 60 minutes down to 6. AI prioritises critical frames.' },
  { icon: '🏥', title: 'No New Equipment', desc: 'Works with Medtronic, Olympus, and Jinshan systems.' },
  { icon: '💰', title: 'From $135/Case', desc: 'Pay-per-case. Each case saves $200+ in physician time.' },
  { icon: '🔒', title: 'HIPAA Compliant', desc: 'PHI de-identified locally before AI processing.' },
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

function StatCard({ value, suffix, prefix, label, externalTrigger }: { value: number; suffix?: string; prefix?: string; label: string; externalTrigger?: boolean }) {
  // When externalTrigger is provided (from section IO), use it directly.
  // Otherwise fall back to own IntersectionObserver for standalone usage.
  const [selfTriggered, setSelfTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggered = externalTrigger !== undefined ? externalTrigger : selfTriggered;
  const count = useCountUp(value, 2000, triggered);

  useEffect(() => {
    // Only self-observe when no external trigger is provided
    if (externalTrigger !== undefined) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSelfTriggered(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [externalTrigger]);

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
// Scroll-triggered entrance animation: fade-up + scale-in (Aria Option A).
function StatsVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [statsTriggered, setStatsTriggered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      setStatsTriggered(true);
      setVideoLoaded(true);
      // Load Wistia immediately for reduced-motion users
      const s1 = document.createElement('script');
      s1.src = 'https://fast.wistia.com/embed/medias/3bhr3pi6rc.jsonp';
      s1.async = true;
      const s2 = document.createElement('script');
      s2.src = 'https://fast.wistia.com/assets/external/E-v1.js';
      s2.async = true;
      document.head.appendChild(s1);
      document.head.appendChild(s2);
      return;
    }

    // Intersection Observer — lazy-load Wistia only when scrolled into view
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Inject Wistia scripts only on first intersection
          if (!document.querySelector('script[src*="wistia"]')) {
            const s1 = document.createElement('script');
            s1.src = 'https://fast.wistia.com/embed/medias/3bhr3pi6rc.jsonp';
            s1.async = true;
            const s2 = document.createElement('script');
            s2.src = 'https://fast.wistia.com/assets/external/E-v1.js';
            s2.async = true;
            document.head.appendChild(s1);
            document.head.appendChild(s2);
          }
          setVideoLoaded(true);
          // Stats count-up: delay 400ms after container animation starts
          setTimeout(() => setStatsTriggered(true), 400);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Fix 5: mute toggle — click toggles mute only, never pauses/restarts video
  const handleVideoSectionClick = () => {
    setIsMuted(prev => {
      const next = !prev;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const W = (window as any).Wistia;
      if (W) {
        const video = W.api('3bhr3pi6rc');
        if (video) {
          if (next) video.mute(); else video.unmute();
          // Ensure video keeps playing after mute toggle
          setTimeout(() => { try { video.play(); } catch(_) {} }, 50);
        }
      }
      return next;
    });
  };

  // Remove will-change after animation completes
  const handleTransitionEnd = () => {
    if (containerRef.current) {
      containerRef.current.style.willChange = 'auto';
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full video-section-entrance"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
      }}
      onTransitionEnd={handleTransitionEnd}
      aria-label="Stats section with video background"
    >
      {/* Video container — maintains aspect ratio on all viewports */}
      <div
        className="relative w-full overflow-hidden min-h-[200px] md:min-h-[480px]"
        style={{ aspectRatio: '16/7' }}
      >
        {/* Wistia video background — lazy loaded on scroll */}
        {videoLoaded && (
          <div
            className="wistia_embed wistia_async_3bhr3pi6rc videoFoam=true autoPlay=true silentAutoPlay=true controlsVisibleOnLoad=false playbar=false smallPlayButton=false volumeControl=false fullscreenButton=false playbackRateControl=false endVideoBehavior=loop"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        )}

        {/* Deeper grey overlay — click here to toggle mute only */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.25)', cursor: 'pointer', zIndex: 5 }}
          onClick={handleVideoSectionClick}
          aria-label="Click to toggle mute"
        />

        {/* Fix 5 — mute indicator badge */}
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <span className="text-xs text-white/70 bg-black/40 px-2 py-1 rounded-full">
            {isMuted ? '🔇' : '🔊'}
          </span>
        </div>

        {/* Stats overlay — desktop only, centered over video */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
          <div className="grid grid-cols-3 gap-16 px-8 text-center w-full max-w-4xl mx-auto">
            {stats.map(({ value, suffix, prefix, label }) => (
              <StatCard key={label} value={value} suffix={suffix} prefix={prefix} label={label} externalTrigger={statsTriggered} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats — mobile only (≤768px), flows below video */}
      <div className="md:hidden grid grid-cols-1 gap-6 px-8 pt-4 pb-8 text-center bg-[var(--bg-page)]">
        {stats.map(({ value, suffix, prefix, label }, i) => (
          <div
            key={label}
            style={{
              opacity: statsTriggered ? 1 : 0,
              transform: statsTriggered ? 'translateY(0)' : 'translateY(16px)',
              transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`,
            }}
          >
            <StatCard value={value} suffix={suffix} prefix={prefix} label={label} externalTrigger={statsTriggered} />
          </div>
        ))}
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
      <section className="relative min-h-[60vh] md:min-h-screen flex items-center overflow-hidden pt-16">

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
        <HeroBackground type="hero" opacity={0.44} />

        {/* Layer 3 — Particle field (120 particles, purple-pink-amber palette) */}
        {/* Particles must remain unaffected — z-index and container unchanged */}
        <HeroParticles />

        {/* Layer 3 — text content */}
        <div className="relative z-10 container mx-auto px-[var(--px-page)] pt-16 pb-8 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--accent-purple)] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Now Available — NZ&amp;AU Healthcare
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

                {/* Fix 6B — "Explore TheraSeus →" button inside image, bottom-right */}
                <div className="absolute bottom-10 right-3 z-10">
                  <Link
                    href="/product"
                    className="text-sm px-3 py-1.5 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    Explore TheraSeus →
                  </Link>
                </div>
              </div>
            </SectionWrapper>
          </div>

          {/* Fix 6B — "Explore TheraSeus →" button moved inside image above */}
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
