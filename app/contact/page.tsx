'use client';
import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

const faqs = [
  {
    q: 'Is TheraSeus FDA-approved?',
    a: 'TheraSeus is pursuing Medsafe SaMD classification in New Zealand. FDA 510(k) pathway is planned for 2026–2027. TheraSeus is a CADe tool — all findings are reviewed and confirmed by the physician.',
  },
  {
    q: 'Does AI replace the doctor?',
    a: 'No. TheraSeus filters and prioritises frames for physician review. The doctor confirms every diagnostic decision.',
  },
  {
    q: 'How accurate is the AI?',
    a: '95% sensitivity for active bleeding, 90% for polyps (internal validation). External clinical trial in progress.',
  },
  {
    q: 'Is patient data secure?',
    a: 'PHI is de-identified locally before upload. Cloud deployment uses HIPAA-eligible AWS infrastructure with BAA.',
  },
  {
    q: 'What systems does TheraSeus integrate with?',
    a: 'Medtronic PillCam, Olympus EndoCapsule, Ankon NaviCam, Jinshan OMOM. Accepts DICOM, JPEG, MP4, AVI.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="accordion-item">
      <button className="accordion-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <span style={{ color: 'var(--color-cta)', transition: 'transform 0.3s ease', display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      <div className={`accordion-content ${open ? 'open' : ''}`}>
        <p>{a}</p>
      </div>
    </div>
  );
}

function ContactForm() {
  const searchParams = useSearchParams();
  const type = searchParams?.get('type') ?? '';

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (type === 'pilot')    setSubject('Pilot Program Application');
    if (type === 'investor') setSubject('Investor / Partnership Enquiry');
    if (type === 'quote')    setSubject('Custom Pricing Quote');
  }, [type]);

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
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="form-label">Full Name *</label>
          <input id="name" name="name" type="text" required className="form-field" placeholder="Dr. Jane Smith" />
        </div>
        <div>
          <label htmlFor="email" className="form-label">Email Address *</label>
          <input id="email" name="email" type="email" required className="form-field" placeholder="jane@clinic.nz" />
        </div>
      </div>
      <div>
        <label htmlFor="org" className="form-label">Organisation</label>
        <input id="org" name="org" type="text" className="form-field" placeholder="Auckland Hospital / Nexture Investor" />
      </div>
      <div>
        <label htmlFor="role" className="form-label">Your Role</label>
        <select id="role" name="role" className="form-field">
          <option value="">Select role...</option>
          <option>Gastroenterologist</option>
          <option>Practice Administrator</option>
          <option>Hospital / Health System</option>
          <option>Investor / VC</option>
          <option>Partner / Reseller</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="subject" className="form-label">Subject</label>
        <input
          id="subject" name="subject" type="text"
          className="form-field"
          placeholder="Book a demo / Pilot application / Investment enquiry"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="message" className="form-label">Message *</label>
        <textarea id="message" name="message" required rows={5} className="form-field" placeholder="Tell us about your practice and what you&apos;re hoping to achieve..." />
      </div>

      {status === 'success' && (
        <div className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--color-data-positive)' }}>
          ✅ Message sent! We&apos;ll respond within 1 business day.
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: 'rgba(232,0,90,0.08)', border: '1px solid rgba(232,0,90,0.25)', color: 'var(--color-cta)' }}>
          ❌ Failed to send. Please email us directly at <a href="mailto:hello@nexture.nz" className="underline">hello@nexture.nz</a>
        </div>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full justify-center py-3.5">
        {status === 'sending' ? 'Sending...' : 'Send Message →'}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <>
      {/* ════════════════════════════════════════
          HERO — Dark
          ════════════════════════════════════════ */}
      <section className="section-dark relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(232,0,90,0.06) 0%, transparent 70%)' }} />
        <div className="section-container px-6 pt-16 relative z-10 text-center">
          <p className="text-label mb-5 animate-fade-up">Get in Touch</p>
          <h1 className="font-display font-extrabold mb-5 animate-fade-up"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-on-dark-primary)', animationDelay: '80ms' }}>
            Start Your Pilot or Book a Demo
          </h1>
          <p className="text-lg animate-fade-up" style={{ color: 'var(--text-on-dark-secondary)', animationDelay: '200ms' }}>
            We respond within 1 business day.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CONTACT SPLIT — Light
          ════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form — wider column */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <h2 className="font-display font-bold text-2xl mb-8" style={{ color: 'var(--text-on-light-primary)' }}>
                  Send a Message
                </h2>
                <Suspense fallback={<div className="text-sm" style={{ color: 'var(--text-on-light-secondary)' }}>Loading form...</div>}>
                  <ContactForm />
                </Suspense>
              </ScrollReveal>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={1}>
                <h2 className="font-display font-bold text-2xl mb-8" style={{ color: 'var(--text-on-light-primary)' }}>
                  Direct Contact
                </h2>

                <div className="space-y-6 mb-10">
                  <div>
                    <p className="text-label mb-2" style={{ color: 'var(--color-cta)' }}>Email</p>
                    <a href="mailto:hello@nexture.nz" className="text-base font-medium" style={{ color: 'var(--text-on-light-primary)' }}>
                      hello@nexture.nz
                    </a>
                    <br />
                    <a href="mailto:shawn@nexture.nz" className="text-base" style={{ color: 'var(--text-on-light-secondary)' }}>
                      shawn@nexture.nz
                    </a>
                  </div>

                  <div>
                    <p className="text-label mb-2" style={{ color: 'var(--color-cta)' }}>Schedule Directly</p>
                    <a
                      href="https://calendly.com/nexture"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost-light text-sm py-2.5 px-5 inline-flex"
                    >
                      Book a Catch-Up with Victor →
                    </a>
                  </div>

                  <div>
                    <p className="text-label mb-2" style={{ color: 'var(--color-cta)' }}>Location</p>
                    <address className="not-italic text-sm leading-relaxed" style={{ color: 'var(--text-on-light-secondary)' }}>
                      Te Ohaka — Centre for Growth &amp; Innovation<br />
                      KBlock, Ara Institute of Canterbury<br />
                      Christchurch 8011, New Zealand
                    </address>
                  </div>
                </div>

                {/* Trust badges */}
                <div>
                  <p className="text-label mb-3" style={{ color: 'var(--color-cta)' }}>Compliance</p>
                  <div className="flex flex-wrap gap-2">
                    {['HIPAA-Ready', 'NZ Privacy Act', 'NVIDIA Inception'].map(badge => (
                      <span key={badge} className="trust-badge" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.10)', color: 'var(--text-on-light-secondary)' }}>
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          DUAL CTA CARDS — Light
          ════════════════════════════════════════ */}
      <section className="section-light-surface section-py" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="section-container px-6">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <ScrollReveal delay={1}>
              <div className="feature-card-light flex flex-col gap-4 text-center py-10 px-8">
                <span className="text-3xl" aria-hidden="true">🩺</span>
                <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-on-light-primary)' }}>Pilot Program</h3>
                <p className="text-sm" style={{ color: 'var(--text-on-light-secondary)' }}>
                  50 cases FREE. 3 months access. No credit card required.
                </p>
                <Link href="/contact?type=pilot" className="btn-primary">
                  Apply Now →
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className="feature-card-light flex flex-col gap-4 text-center py-10 px-8">
                <span className="text-3xl" aria-hidden="true">💼</span>
                <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-on-light-primary)' }}>Investor Enquiry</h3>
                <p className="text-sm" style={{ color: 'var(--text-on-light-secondary)' }}>
                  Schedule a catch-up with Victor to discuss partnership.
                </p>
                <Link href="/contact?type=investor" className="btn-ghost-light">
                  Book Meeting →
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ — Light
          ════════════════════════════════════════ */}
      <section className="section-light section-py" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)', letterSpacing: '-0.02em', color: 'var(--text-on-light-primary)' }}>
              Quick Answers
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <div className="max-w-2xl mx-auto">
              {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
