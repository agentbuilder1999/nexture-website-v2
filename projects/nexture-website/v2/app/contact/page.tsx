'use client';
import { useState, FormEvent } from 'react';
import Image from 'next/image';
import SectionWrapper from '@/components/SectionWrapper';
import GradientText from '@/components/GradientText';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgonqqdn';

const contactDetails = [
  { icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ), label: 'LinkedIn', value: 'Nexture Limited', href: 'https://www.linkedin.com/company/nexture-limited/' },
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
      <section className="relative min-h-[40vh] flex items-center overflow-hidden pt-16">
        {/* Background image */}
        <Image
          src="/images/headers/c.jpg"
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

            </SectionWrapper>
          </div>
        </div>
      </section>
    </>
  );
}
