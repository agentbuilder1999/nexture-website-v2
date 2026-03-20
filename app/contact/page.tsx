'use client';
import { useState, FormEvent } from 'react';
import SectionWrapper from '@/components/SectionWrapper';
import GradientText from '@/components/GradientText';
import HeroBackground from '@/components/HeroBackground';

// TODO: replace with real Formspree form ID — register at https://formspree.io
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

const contactDetails = [
  { icon: '✉️', label: 'Email', value: 'hello@nexture.nz', href: 'mailto:hello@nexture.nz' },
  { icon: '📍', label: 'Address', value: 'Te Ohaka – Centre for Growth & Innovation\nK-Block, Ara Institute of Canterbury\nMadras Street, Christchurch Central\nChristchurch 8011, New Zealand', href: 'https://maps.google.com?q=Ara+Institute+of+Canterbury+Christchurch' },
  { icon: '🕘', label: 'Hours', value: 'Monday – Friday\n9:00 AM – 5:00 PM NZT', href: null },
];

export default function ContactPage() {
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
        showToast('✅ Message sent! We\'ll be in touch shortly.');
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
            status === 'success'
              ? 'bg-[var(--primary)] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast}
        </div>
      )}

      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden pt-16 bg-[var(--bg-section-alt)]">
        <HeroBackground type="section" opacity={0.25} />
        <div className="container mx-auto px-[var(--px-page)] py-16 relative z-10">
          <SectionWrapper>
            <GradientText as="h1" className="text-5xl md:text-6xl font-extrabold mb-4">Get in Touch</GradientText>
            <p className="text-xl text-[var(--text-secondary)] max-w-xl">
              Interested in TheraSeus, a partnership, or just want to learn more? We&apos;d love to hear from you.
            </p>
          </SectionWrapper>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Contact form */}
            <SectionWrapper>
              <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Hidden Formspree email target */}
                <input type="hidden" name="_replyto" value="victor@nexture.nz" />
                {[
                  { label: 'Name', name: 'name', type: 'text', placeholder: 'Your full name' },
                  { label: 'Email', name: 'email', type: 'email', placeholder: 'you@hospital.com' },
                  { label: 'Organisation', name: 'organisation', type: 'text', placeholder: 'Hospital, clinic, or company' },
                ].map(({ label, name, type, placeholder }) => (
                  <div key={name}>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">{label}</label>
                    <input
                      type={type} name={name} placeholder={placeholder} required={name !== 'organisation'}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Message</label>
                  <textarea
                    name="message" rows={4} required
                    placeholder="Tell us what you're interested in..."
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="btn-teal w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message →'}
                </button>
              </form>
            </SectionWrapper>

            {/* Contact info + location */}
            <SectionWrapper delay={0.15}>
              <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-6">Contact Details</h2>
              <div className="space-y-5 mb-8">
                {contactDetails.map(({ icon, label, value, href }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0 text-lg">
                      {icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors whitespace-pre-line leading-relaxed">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Book a call CTA */}
              <div className="card-gradient-border">
                <div className="card-gradient-border-inner">
                  <h3 className="font-bold text-[var(--text-heading)] mb-2">📅 Book a Call with Victor</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Schedule a 30-minute video call to discuss TheraSeus and how it can fit your practice.
                  </p>
                  <a href="mailto:hello@nexture.nz?subject=Book a Call" className="btn-secondary text-sm py-2 px-5">
                    Book a Catch-Up →
                  </a>
                </div>
              </div>
            </SectionWrapper>
          </div>
        </div>
      </section>
    </>
  );
}
