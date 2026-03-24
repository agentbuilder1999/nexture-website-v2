'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

/* ── CountUp hook ───────────────────────────────────────── */
function useCountUp(target: number, duration = 1400, triggered = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, triggered]);
  return count;
}

function StatCard({
  value, suffix, prefix, label, desc
}: { value: number; suffix?: string; prefix?: string; label: string; desc: string }) {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 1400, triggered);
  const formatted = count >= 1000 ? count.toLocaleString() : count.toString();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTriggered(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="stat-card">
      <span className="stat-number">{prefix}{formatted}{suffix}</span>
      <span className="stat-label">{label}</span>
      <span className="stat-desc">{desc}</span>
    </div>
  );
}

/* ── Audience card ──────────────────────────────────────── */
function AudienceCard({ emoji, role, quote, cta, href }: {
  emoji: string; role: string; quote: string; cta: string; href: string;
}) {
  return (
    <div className="feature-card-light flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">{emoji}</span>
        <span className="text-label" style={{ color: 'var(--color-accent-soft)' }}>{role}</span>
      </div>
      <p className="text-lg font-semibold leading-snug flex-1" style={{ color: 'var(--text-on-light-primary)', fontFamily: 'var(--font-display)' }}>
        &ldquo;{quote}&rdquo;
      </p>
      <Link href={href} className="btn-ghost-light text-sm py-2.5 px-5 self-start">
        {cta} →
      </Link>
    </div>
  );
}

/* ── Partner logo row ───────────────────────────────────── */
function PartnerLogos() {
  const logos = [
    { src: '/assets/logo-google-cloud.png',      alt: 'Google Cloud Partner' },
    { src: '/assets/logo-ministry-awesome.png',  alt: 'Ministry of Awesome' },
    { src: '/assets/logo-nvidia.png',            alt: 'NVIDIA Inception' },
  ];
  return (
    <div className="partner-row">
      {logos.map(({ src, alt }) => (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img key={src} src={src} alt={alt} className="partner-logo" style={{ height: 36 }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ))}
      {/* Text fallbacks for missing logos */}
      <span className="trust-badge">AWS Healthcare</span>
      <span className="trust-badge">Ministry of Awesome</span>
      <span className="trust-badge">University of Otago</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ════════════════════════════════════════════════════
          HERO — Dark, full-viewport
          ════════════════════════════════════════════════════ */}
      <section className="section-dark relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Atmospheric bg — Purple-bfg at low opacity */}
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <Image
            src="/assets/Purple-bfg.avif"
            alt=""
            fill
            priority
            quality={60}
            className="object-cover object-center"
            style={{ opacity: 0.12 }}
            sizes="100vw"
          />
        </div>
        {/* Subtle bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-[2]" aria-hidden="true"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-dark-deep))' }} />

        <div className="section-container px-6 py-24 md:py-32 relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div>
              {/* NVIDIA badge */}
              <div className="flex flex-wrap gap-2 mb-7 animate-fade-up" style={{ animationDelay: '0ms' }}>
                <span className="trust-badge">🏆 NVIDIA Inception Member</span>
                <span className="trust-badge">🔒 HIPAA-Ready</span>
                <span className="trust-badge">🇳🇿 Medsafe SaMD</span>
              </div>

              {/* Headline */}
              <h1
                className="font-display font-extrabold leading-tight mb-6 animate-fade-up"
                style={{
                  fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  animationDelay: '80ms',
                  color: 'var(--text-on-dark-primary)',
                }}
              >
                Capsule Endoscopy AI That{' '}
                <span className="gradient-text">Cuts Review Time by 90%</span>
              </h1>

              {/* Subheadline */}
              <p
                className="text-lg leading-relaxed mb-8 animate-fade-up"
                style={{ color: 'var(--text-on-dark-secondary)', maxWidth: '520px', animationDelay: '200ms' }}
              >
                From 60-minute physician burden to 6-minute precision review.
                TheraSeus filters 50,000 images down to what matters — automatically.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-12 animate-fade-up" style={{ animationDelay: '320ms' }}>
                <Link href="/contact" className="btn-primary">
                  Book a Demo →
                </Link>
                <Link href="/product" className="btn-secondary">
                  See How It Works
                </Link>
              </div>

              {/* Micro-stat row */}
              <div
                className="flex flex-wrap gap-x-6 gap-y-2 text-sm animate-fade-up"
                style={{ animationDelay: '440ms', color: 'var(--text-on-dark-muted)', borderTop: '1px solid var(--border-dark)', paddingTop: '1.5rem' }}
              >
                {[
                  '90% time saved',
                  '$200 net savings/case',
                  'No hardware changes',
                  '50 cases FREE pilot',
                ].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--color-data-primary)' }}>—</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Neural_Sieve UI mockup */}
            <div className="relative animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: '1px solid var(--border-dark-strong)',
                  boxShadow: '0 0 80px rgba(74, 92, 232, 0.15), 0 40px 80px rgba(0,0,0,0.5)',
                  background: 'var(--bg-dark-surface)',
                }}
              >
                <Image
                  src="/assets/neural-sieve.png"
                  alt="TheraSeus AI interface showing capsule endoscopy analysis"
                  width={620}
                  height={420}
                  className="w-full h-auto"
                  priority
                  quality={90}
                />
                {/* Annotation callouts */}
                <div className="absolute top-4 left-4 trust-badge" style={{ fontSize: '10px' }}>
                  AI-filtered 4,800 frames
                </div>
                <div className="absolute bottom-6 right-4 trust-badge" style={{ fontSize: '10px', borderColor: 'rgba(16,185,129,0.4)', color: 'var(--color-data-positive)' }}>
                  95% confidence — Active Bleeding
                </div>
              </div>
              {/* Floating glow effect */}
              <div className="absolute -inset-10 pointer-events-none z-[-1]" aria-hidden="true"
                style={{ background: 'radial-gradient(ellipse at center, rgba(74,92,232,0.10) 0%, transparent 70%)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SOCIAL PROOF BAR — Light
          ════════════════════════════════════════════════════ */}
      <section className="section-light py-10">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-7">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-on-light-muted)', letterSpacing: '0.08em' }}>
              Backed by and built with
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <div className="partner-row">
              {[
                { src: '/assets/logo-google-cloud.png', alt: 'Google Cloud Partner', fallback: 'Google Cloud' },
                { src: '/assets/logo-ministry-awesome.png', alt: 'Ministry of Awesome', fallback: 'Ministry of Awesome' },
              ].map(({ src, alt, fallback }) => (
                <div key={src} className="flex items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={alt}
                    style={{ height: 36, objectFit: 'contain', filter: 'grayscale(100%) brightness(0.25)', opacity: 0.7 }}
                    onError={e => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      const span = document.createElement('span');
                      span.textContent = fallback;
                      span.style.cssText = 'font-size:0.875rem;font-weight:600;color:var(--text-on-light-muted);';
                      el.parentNode?.appendChild(span);
                    }}
                  />
                </div>
              ))}
              <span className="trust-badge" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.12)', color: 'var(--text-on-light-secondary)' }}>NVIDIA Inception</span>
              <span className="trust-badge" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.12)', color: 'var(--text-on-light-secondary)' }}>AWS Healthcare</span>
              <span className="trust-badge" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.12)', color: 'var(--text-on-light-secondary)' }}>University of Otago</span>
              <span className="trust-badge" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.12)', color: 'var(--text-on-light-secondary)' }}>Ara Institute</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          PROBLEM SECTION — Dark
          ════════════════════════════════════════════════════ */}
      <section className="section-dark-surface section-py">
        <div className="section-container px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <ScrollReveal>
                <p className="text-label mb-4">The Challenge</p>
                <h2 className="font-display font-bold mb-6" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-dark-primary)' }}>
                  Gastroenterologists Spend 1 Hour Per Case on Non-Diagnostic Work
                </h2>
                <p className="text-lg leading-relaxed mb-10" style={{ color: 'var(--text-on-dark-secondary)' }}>
                  Each capsule endoscopy study floods the physician with 50,000+ images.
                  Manual review burns 45–60 minutes per case — time taken from patients, from life.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { num: '50,000+', label: 'Images Per Case', desc: 'Manual review required' },
                  { num: '33%',     label: 'Cite Review As Burnout', desc: 'Among gastroenterologists' },
                  { num: '60 min',  label: 'Per Case Wasted', desc: 'Non-diagnostic time' },
                ].map(({ num, label, desc }, i) => (
                  <ScrollReveal key={label} delay={(i + 1) as 1 | 2 | 3}>
                    <div style={{ borderTop: '2px solid var(--color-cta)', paddingTop: '0.75rem' }}>
                      <p className="font-mono font-bold text-2xl mb-1" style={{ color: 'var(--text-on-dark-primary)' }}>{num}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-on-dark-secondary)', letterSpacing: '0.06em' }}>{label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-on-dark-muted)' }}>{desc}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Right: Funnel_Collapse image */}
            <ScrollReveal delay={2}>
              <div className="relative rounded-xl overflow-hidden" style={{ background: 'var(--bg-dark-elevated)', border: '1px solid var(--border-dark)' }}>
                <Image
                  src="/assets/funnel-collapse.png"
                  alt="TheraSeus filters 50,000 capsule endoscopy frames down to clinically relevant findings"
                  width={560}
                  height={420}
                  className="w-full h-auto"
                  style={{ mixBlendMode: 'screen', opacity: 0.85, filter: 'brightness(1.1)' }}
                  quality={85}
                />
                <p className="text-xs text-center py-3" style={{ color: 'var(--text-on-dark-muted)' }}>
                  50,000 images → 5,000 prioritised frames
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SOLUTION SECTION — Light
          ════════════════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4" style={{ color: 'var(--color-cta)' }}>TheraSeus by Nexture</p>
            <h2 className="font-display font-bold mb-5" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-light-primary)' }}>
              Three Steps to a Complete GI Report
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-on-light-secondary)' }}>
              Works with PillCam, EndoCapsule, NaviCam, and all major systems. No hardware changes required.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-[42px] left-[calc(33.33%+8px)] right-[calc(33.33%+8px)] h-0.5"
              style={{ background: 'linear-gradient(to right, var(--border-light-accent), var(--color-cta), var(--border-light-accent))', zIndex: 0 }} aria-hidden="true" />

            {[
              {
                step: '01',
                title: 'Upload Study',
                time: '~2 minutes',
                desc: 'Drag-and-drop MP4, AVI, DICOM, or JPEG series. Any major capsule endoscope supported.',
                icon: '📤',
              },
              {
                step: '02',
                title: 'AI Analysis',
                time: '~5 minutes automated',
                desc: 'Quality filtering, YOLOv8-x lesion detection, SAM2 segmentation, and structured report auto-draft.',
                icon: '🤖',
              },
              {
                step: '03',
                title: 'Doctor Review',
                time: '8–20 minutes',
                desc: 'Review AI-filtered frames (~5,000). Confirm, edit, or override AI findings. Sign report → Export to EMR/PACS.',
                icon: '🩺',
              },
            ].map(({ step, title, time, desc, icon }, i) => (
              <ScrollReveal key={step} delay={(i + 1) as 1 | 2 | 3} className="relative z-10">
                <div className="feature-card-light flex flex-col gap-4 text-center items-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-lg text-white"
                    style={{ background: 'var(--color-cta)' }}>
                    {step}
                  </div>
                  <span className="text-2xl" aria-hidden="true">{icon}</span>
                  <div>
                    <h3 className="font-display font-semibold text-xl mb-1" style={{ color: 'var(--text-on-light-primary)' }}>{title}</h3>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-cta)' }}>{time}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-on-light-secondary)' }}>{desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          STATS TRIPTYCH — Dark
          ════════════════════════════════════════════════════ */}
      <section className="section-dark section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4">Validated Performance</p>
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-dark-primary)' }}>
              Numbers That Matter to Clinicians
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            <ScrollReveal delay={1}>
              <StatCard
                value={90}
                suffix="%"
                label="Time Reduction"
                desc="Filters &gt;85% of redundant images. Internal validation dataset."
              />
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <StatCard
                value={6}
                suffix=" min"
                label="Avg. Review Time"
                desc="Down from 60 minutes. Physician reviews AI-prioritised frames only."
              />
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <StatCard
                value={200}
                prefix="$"
                label="Net Savings Per Case"
                desc="$135 software cost vs $300+ physician time. Immediate ROI from day one."
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          AUDIENCE SPLIT — Light
          ════════════════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4" style={{ color: 'var(--color-cta)' }}>Who It&apos;s For</p>
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-light-primary)' }}>
              TheraSeus Works for Your Role
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={1}>
              <AudienceCard
                emoji="🩺"
                role="Gastroenterologist"
                quote="Spend 6 minutes diagnosing instead of 60 scanning 50,000+ images."
                cta="For Clinicians"
                href="/product"
              />
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <AudienceCard
                emoji="📊"
                role="Practice Administrator"
                quote="$135 software saves $300+ in physician time per case — immediate ROI from day one."
                cta="ROI Calculator"
                href="/product#roi"
              />
            </ScrollReveal>
            <ScrollReveal delay={3} className="md:col-span-2 lg:col-span-1">
              <AudienceCard
                emoji="🏥"
                role="Health Systems"
                quote="Scale capsule endoscopy procedures 10x with the staff and equipment you already have."
                cta="For Enterprise"
                href="/contact"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          PRODUCT PREVIEW — Dark
          ════════════════════════════════════════════════════ */}
      <section className="section-dark-surface section-py">
        <div className="section-container px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: product mockup */}
            <ScrollReveal>
              <div className="relative rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--border-dark-strong)', boxShadow: '0 0 60px rgba(74,92,232,0.12)' }}>
                <Image
                  src="/assets/neural-sieve-2.png"
                  alt="TheraSeus clinical AI interface — capsule endoscopy review platform"
                  width={620}
                  height={440}
                  className="w-full h-auto"
                  quality={88}
                />
              </div>
            </ScrollReveal>

            {/* Right: copy */}
            <div>
              <ScrollReveal>
                <p className="text-label mb-4">The Platform</p>
                <h2 className="font-display font-bold mb-6" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-dark-primary)' }}>
                  Clinical-Grade AI. Doctor in Control.
                </h2>
              </ScrollReveal>
              <div className="space-y-5">
                {[
                  { icon: '✓', text: 'AI highlights findings — doctor confirms every call' },
                  { icon: '✓', text: 'Confidence scores always visible on every annotation' },
                  { icon: '✓', text: 'One-click structured report generation' },
                  { icon: '✓', text: 'PACS / EMR integration via DICOM + HL7 FHIR' },
                  { icon: '✓', text: 'Works with all major capsule endoscopy systems' },
                ].map(({ icon, text }, i) => (
                  <ScrollReveal key={text} delay={(Math.min(i + 1, 4)) as 1 | 2 | 3 | 4}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5 flex-shrink-0" style={{ color: 'var(--color-data-positive)' }}>{icon}</span>
                      <p style={{ color: 'var(--text-on-dark-secondary)' }}>{text}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
              <ScrollReveal className="mt-8">
                <Link href="/product" className="btn-primary">
                  Explore TheraSeus →
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TRUST DEEP-DIVE — Light
          ════════════════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4" style={{ color: 'var(--color-cta)' }}>Trust Architecture</p>
            <h2 className="font-display font-bold mb-5" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-light-primary)' }}>
              Built to Clinical Standard
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-on-light-secondary)' }}>
              Headquartered at Te Ohaka — Centre for Growth &amp; Innovation, Christchurch, New Zealand.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '☁️',  title: 'Google Cloud Partner', desc: 'HIPAA-eligible infrastructure on GCP' },
              { icon: '🏆', title: 'NVIDIA Inception Member', desc: 'Accelerated AI development program' },
              { icon: '🔒', title: 'HIPAA-Ready', desc: 'AWS BAA, PHI de-identified at source' },
              { icon: '📋', title: 'Medsafe SaMD', desc: 'NZ Classification — In Progress' },
            ].map(({ icon, title, desc }, i) => (
              <ScrollReveal key={title} delay={(i + 1) as 1 | 2 | 3 | 4}>
                <div className="feature-card-light text-center py-8 px-5">
                  <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                  <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-on-light-primary)' }}>{title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-on-light-secondary)' }}>{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FINAL CTA — Dark
          ════════════════════════════════════════════════════ */}
      <section className="section-dark section-py relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(232,0,90,0.08) 0%, transparent 70%)' }} />

        <div className="section-container px-6 relative z-10">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 3rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-dark-primary)' }}>
              Ready to Transform Your Practice?
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-on-dark-secondary)' }}>
              Two paths to start. Zero commitment required.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <ScrollReveal delay={1}>
              <div className="feature-card-dark flex flex-col gap-4 text-center py-10 px-8">
                <span className="text-3xl" aria-hidden="true">🏥</span>
                <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-on-dark-primary)' }}>
                  For Clinics &amp; Hospitals
                </h3>
                <p style={{ color: 'var(--text-on-dark-secondary)' }}>
                  Start with 50 cases FREE — no commitment, no credit card.
                </p>
                <Link href="/contact?type=pilot" className="btn-primary">
                  Join Pilot Program →
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className="feature-card-dark flex flex-col gap-4 text-center py-10 px-8">
                <span className="text-3xl" aria-hidden="true">💼</span>
                <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-on-dark-primary)' }}>
                  For Investors &amp; Partners
                </h3>
                <p style={{ color: 'var(--text-on-dark-secondary)' }}>
                  Learn about our technology, market position, and roadmap.
                </p>
                <Link href="/contact?type=investor" className="btn-secondary">
                  Schedule a Catchup →
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
