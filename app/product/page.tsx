'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SectionWrapper from '@/components/SectionWrapper';
import GradientText from '@/components/GradientText';

// TODO: replace with real Formspree form ID — register at https://formspree.io
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgonqqdn';

const personas = [
  { emoji: '👨‍⚕️', role: 'Gastroenterologist', headline: '6 minutes instead of 60', desc: 'Spend your cognitive energy on diagnosis, not scanning through 55,000 frames. AI surfaces the top 1,250 priority frames — you confirm the findings.' },
  { emoji: '🏢', role: 'Practice Administrator', headline: '$135 saves $300+ per case', desc: 'Immediate ROI from day one. Software cost is $135/case; physician time saved per case is valued at $300+. Scale procedures without adding staff.' },
  { emoji: '🏥', role: 'Health Systems', headline: 'Scale 10× with existing staff', desc: 'Increase your capsule endoscopy throughput tenfold using the equipment and personnel you already have. No capital investment required.' },
];

const technology = [
  { title: 'Capsule Dataset', desc: 'Trained on a proprietary dataset of gastrointestinal capsule endoscopy images, purpose-built for the task.' },
  { title: 'Recognition Algorithms', desc: 'Fast, accurate detection of bleeding, vascular lesions, and 21 categories of abnormal findings.' },
  { title: 'Image Management', desc: 'Integrated workflow — from study upload to signed report, streamlined for clinical efficiency.' },
  { title: 'Multimodal Model', desc: 'Integrates video frames, image annotations, and report generation into a unified clinical AI platform.' },
];

export default function ProductPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [toast, setToast] = useState('');

  const showToast = (msg: string, isError = false) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
    setStatus(isError ? 'error' : 'success');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.reset();
        showToast('✅ Request received! We\'ll be in touch shortly.');
      } else {
        showToast('❌ Failed to send. Please email us directly.', true);
      }
    } catch {
      showToast('❌ Network error. Please email us directly.', true);
    }
  };

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            status === 'success' ? 'bg-[var(--primary)] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast}
        </div>
      )}

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden pt-16">
        {/* Background image */}
        <Image
          src="/images/headers/p.jpg"
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
        <div className="container mx-auto px-[var(--px-page)] py-20 relative z-10">
          <SectionWrapper>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--accent-rose)] mb-6">
              ⚕️ CADe Tool — Not for Primary Diagnosis
            </div>
            {/* Primary product CTA uses btn-teal (highest weight) */}
            <GradientText as="h1" className="text-5xl md:text-6xl font-extrabold mb-4">TheraSeus</GradientText>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
              AI-powered capsule endoscopy assistant. Filters 55,000 frames to the 1,250 that matter most, enabling review in 6 minutes.
            </p>
            <div className="mt-6">
              <Link href="#demo" className="btn-teal">Request a Demo →</Link>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Personas */}
      <section className="section">
        <div className="container mx-auto">
          <SectionWrapper className="text-center mb-12">
            <GradientText as="h2" className="text-4xl font-extrabold mb-3">Built for Your Role</GradientText>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">TheraSeus delivers measurable value at every level of your practice.</p>
          </SectionWrapper>
          <div className="grid md:grid-cols-3 gap-6">
            {personas.map(({ emoji, role, headline, desc }, i) => (
              <SectionWrapper key={role} delay={i * 0.12}>
                <div className="card h-full">
                  <span className="text-4xl mb-4 block">{emoji}</span>
                  <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-1">{role}</p>
                  <h3 className="text-xl font-bold text-[var(--text-heading)] mb-3">&ldquo;{headline}&rdquo;</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="section bg-[var(--bg-section-alt)]">
        <div className="container mx-auto">
          <SectionWrapper className="text-center mb-10">
            <GradientText as="h2" className="text-4xl font-extrabold mb-3">Clear ROI from Day One</GradientText>
          </SectionWrapper>
          <SectionWrapper>
            <div className="max-w-lg mx-auto card-gradient-border">
              <div className="card-gradient-border-inner">
                <div className="space-y-4">
                  {[
                    { label: 'Software Cost', value: '$135 / case' },
                    { label: 'Physician Time Saved', value: '54 minutes' },
                    { label: 'Value of Time Saved', value: '~$300 / case' },
                    { label: 'Net Savings', value: '~$200 / case' },
                  ].map(({ label, value }, i) => (
                    <div key={label} className={`flex justify-between items-center py-3 ${i < 3 ? 'border-b border-[var(--border-subtle)]' : ''}`}>
                      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                      <span className={`text-sm font-bold ${i === 3 ? 'gradient-text text-lg' : 'text-[var(--text-heading)]'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Technology */}
      <section className="section">
        <div className="container mx-auto">
          <SectionWrapper className="text-center mb-12">
            <GradientText as="h2" className="text-4xl font-extrabold mb-3">Proprietary Technology</GradientText>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">Purpose-built for capsule endoscopy — not a generic AI retrofit.</p>
          </SectionWrapper>
          <div className="grid sm:grid-cols-2 gap-5">
            {technology.map(({ title, desc }, i) => (
              <SectionWrapper key={title} delay={i * 0.1}>
                <div className="card flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary-bg)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🧠</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-heading)] mb-1">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Demo Form — #2 Formspree */}
      <section id="demo" className="section bg-[var(--bg-section-alt)]">
        <div className="container mx-auto max-w-2xl">
          <SectionWrapper className="text-center mb-10">
            <GradientText as="h2" className="text-4xl font-extrabold mb-3">Request a Demo</GradientText>
            <p className="text-[var(--text-secondary)]">See TheraSeus in action with your own study data.</p>
          </SectionWrapper>
          <SectionWrapper>
            <form onSubmit={handleSubmit} className="card space-y-4">
              <input type="hidden" name="_replyto" value="victor@nexture.nz" />
              <div className="grid sm:grid-cols-2 gap-4">
                {[['Name','name','Your name'],['Email','email','you@hospital.com'],['Organization','org','Hospital or practice'],['Role','role','e.g. Gastroenterologist']].map(([label,name,placeholder]) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">{label}</label>
                    <input name={name} placeholder={placeholder} required={name === 'name' || name === 'email'} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Message</label>
                <textarea name="message" rows={3} placeholder="Tell us about your practice and what you're looking for..." className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors resize-none" />
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-teal w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Sending…' : 'Send Request →'}
              </button>
              <p className="text-xs text-[var(--text-muted)] text-center">TheraSeus is a CADe device. Not intended for primary diagnosis.</p>
            </form>
          </SectionWrapper>
        </div>
      </section>
    </>
  );
}
