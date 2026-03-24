'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';

/* ── ROI Calculator ───────────────────────────────────────── */
function ROICalculator() {
  const [cases, setCases] = useState(15);
  const [rate, setRate] = useState(180);

  const costPerCase = 135;
  const hoursPerCase = 54 / 60; // 54 min saved per case
  const physicianCostPerHour = rate;
  const physicianSavedPerCase = hoursPerCase * physicianCostPerHour;
  const netSavingsPerCase = physicianSavedPerCase - costPerCase;
  const totalTimeSaved = (cases * hoursPerCase).toFixed(1);
  const totalNetSavings = Math.max(0, Math.round(cases * netSavingsPerCase));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block mb-3 text-sm font-semibold" style={{ color: 'var(--text-on-dark-secondary)' }}>
            Cases per month: <span className="font-mono" style={{ color: 'var(--text-on-dark-primary)' }}>{cases}</span>
          </label>
          <input
            type="range"
            min={1} max={100} value={cases}
            onChange={e => setCases(Number(e.target.value))}
            className="roi-slider"
            aria-label="Cases per month"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-on-dark-muted)' }}>
            <span>1</span><span>100</span>
          </div>
        </div>
        <div>
          <label className="block mb-3 text-sm font-semibold" style={{ color: 'var(--text-on-dark-secondary)' }}>
            Physician hourly rate: <span className="font-mono" style={{ color: 'var(--text-on-dark-primary)' }}>${rate} NZD</span>
          </label>
          <input
            type="range"
            min={80} max={400} step={10} value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="roi-slider"
            aria-label="Physician hourly rate"
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-on-dark-muted)' }}>
            <span>$80</span><span>$400</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card text-center">
          <span className="stat-number" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{totalTimeSaved}h</span>
          <span className="stat-label">Hours Saved/Month</span>
        </div>
        <div className="stat-card text-center">
          <span className="stat-number" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--color-data-positive)' }}>
            ${totalNetSavings.toLocaleString()}
          </span>
          <span className="stat-label">Net Savings/Month</span>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/contact?type=quote" className="btn-primary">
          Get Custom Quote →
        </Link>
      </div>
    </div>
  );
}

/* ── FAQ Accordion ──────────────────────────────────────── */
const faqs = [
  {
    q: 'Is TheraSeus FDA-approved?',
    a: 'TheraSeus is currently pursuing Medsafe SaMD classification in New Zealand. Our FDA 510(k) pathway is in the roadmap for 2026–2027. TheraSeus is a Computer-Aided Detection (CADe) tool — the doctor reviews and confirms every finding.',
  },
  {
    q: 'Does AI replace the doctor?',
    a: 'No. TheraSeus is a CADe tool that filters and prioritises frames for physician review. The doctor reviews all AI-flagged findings and makes every diagnostic decision. AI reduces scanning burden; physicians retain full clinical authority.',
  },
  {
    q: 'How accurate is the AI?',
    a: 'Internal validation shows sensitivity of 95% for active bleeding and 90% for polyps. Specificity ranges from 83–92% across lesion types. External clinical trial is currently in progress. Full performance table available on this page.',
  },
  {
    q: 'Is patient data secure?',
    a: 'Yes. PHI is de-identified locally before any data leaves your facility. Cloud deployment uses HIPAA-eligible AWS infrastructure with BAA. On-premise deployment keeps all data within your network.',
  },
  {
    q: 'What capsule systems does TheraSeus support?',
    a: 'TheraSeus supports all major capsule endoscopy systems including Medtronic PillCam, Olympus EndoCapsule, Ankon NaviCam, and Jinshan. Accepts DICOM, JPEG, MP4, and AVI file formats.',
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="max-w-2xl mx-auto">
      {faqs.map((faq, i) => (
        <div key={i} className="accordion-item">
          <button
            className="accordion-trigger"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span>{faq.q}</span>
            <span style={{ color: 'var(--color-cta)', transition: 'transform 0.3s ease', display: 'inline-block', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
          </button>
          <div className={`accordion-content ${open === i ? 'open' : ''}`}>
            <p>{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductPage() {
  return (
    <>
      {/* ════════════════════════════════════════
          HERO — Dark
          ════════════════════════════════════════ */}
      <section className="section-dark relative min-h-[60vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 80% 50%, rgba(74,92,232,0.08) 0%, transparent 70%)' }} />

        <div className="section-container px-6 py-24 relative z-10 w-full">
          <div className="max-w-2xl">
            <div className="flex gap-2 flex-wrap mb-6 animate-fade-up">
              <span className="trust-badge">TheraSeus™</span>
              <span className="trust-badge">Capsule Endoscopy AI</span>
            </div>
            <h1 className="font-display font-extrabold mb-6 animate-fade-up"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--text-on-dark-primary)', animationDelay: '80ms' }}>
              Read a Capsule Study<br />
              <span className="gradient-text">in 6 Minutes.</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8 animate-fade-up"
              style={{ color: 'var(--text-on-dark-secondary)', animationDelay: '200ms' }}>
              AI-powered image filtering, lesion detection, and structured reporting for gastroenterologists.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <Link href="/contact" className="btn-primary">Book Demo →</Link>
              <Link href="#pricing" className="btn-secondary">View Pricing</Link>
            </div>

            {/* Stat bar */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-10 pt-8 text-sm animate-fade-up"
              style={{ animationDelay: '420ms', borderTop: '1px solid var(--border-dark)', color: 'var(--text-on-dark-muted)' }}>
              <span><span style={{ color: 'var(--color-data-primary)' }}>50,000</span> → <span style={{ color: 'var(--color-data-positive)' }}>5,000</span> images</span>
              <span>~5 min AI processing</span>
              <span>8–20 min physician review</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — Light
          ════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4" style={{ color: 'var(--color-cta)' }}>Workflow</p>
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-light-primary)' }}>
              How TheraSeus Works
            </h2>
          </ScrollReveal>

          <div className="space-y-0">
            {[
              {
                num: '①',
                title: 'UPLOAD',
                time: '~2 minutes',
                items: [
                  'Drag-and-drop MP4, AVI, DICOM, or JPEG series',
                  'Any capsule endoscope system supported',
                  'Secure upload — PHI de-identified locally',
                ],
              },
              {
                num: '②',
                title: 'AI ANALYSIS',
                time: '~5 minutes automated',
                items: [
                  'Quality filtering (Laplacian + BRISQUE algorithms)',
                  'YOLOv8-x lesion detection with confidence scores',
                  'SAM2 segmentation for precise boundaries',
                  'Structured report auto-draft generated',
                ],
              },
              {
                num: '③',
                title: 'DOCTOR REVIEW',
                time: '8–20 minutes',
                items: [
                  'Review ~5,000 AI-prioritised frames (from 50,000+)',
                  'Confirm, edit, or override AI findings',
                  'Sign report → Export to EMR/PACS via DICOM/HL7 FHIR',
                ],
              },
            ].map(({ num, title, time, items }, i) => (
              <ScrollReveal key={num} delay={(i + 1) as 1 | 2 | 3}>
                <div className="feature-card-light mb-4 flex gap-6 items-start">
                  <div className="text-3xl flex-shrink-0 w-12 text-center font-mono font-bold"
                    style={{ color: 'var(--color-cta)' }}>{num}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3 mb-3">
                      <h3 className="font-display font-bold text-xl" style={{ color: 'var(--text-on-light-primary)' }}>{title}</h3>
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-cta)' }}>{time}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {items.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-on-light-secondary)' }}>
                          <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-data-green)' }}>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CLINICAL PERFORMANCE — Dark
          ════════════════════════════════════════ */}
      <section className="section-dark section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4">Validated Performance</p>
            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-dark-primary)' }}>
              Numbers You Can Take to Your Ethics Board
            </h2>
            <p className="text-base" style={{ color: 'var(--text-on-dark-secondary)' }}>
              Internal validation; external clinical trial in progress.
            </p>
          </ScrollReveal>

          <div className="max-w-2xl mx-auto mb-10">
            <ScrollReveal>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-dark-strong)', background: 'var(--bg-dark-surface)' }}>
                <table className="perf-table">
                  <thead>
                    <tr>
                      <th>Detection Type</th>
                      <th>Sensitivity</th>
                      <th>Specificity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: 'Active Bleeding',  sens: '95%', spec: '92%' },
                      { type: 'Polyps',           sens: '90%', spec: '88%' },
                      { type: 'Ulcers',           sens: '88%', spec: '85%' },
                      { type: 'Angiodysplasia',   sens: '85%', spec: '83%' },
                    ].map(row => (
                      <tr key={row.type}>
                        <td>{row.type}</td>
                        <td><span className="pct">{row.sens}</span></td>
                        <td><span className="pct">{row.spec}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </div>

          {/* Tech stack chips */}
          <ScrollReveal delay={2}>
            <div className="flex flex-wrap justify-center gap-3">
              {['YOLOv8-x', 'SAM2', 'Real-ESRGAN', 'EfficientNet-B3'].map(tech => (
                <span key={tech} className="tech-chip">{tech}</span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES — Light
          ════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4" style={{ color: 'var(--color-cta)' }}>Platform Features</p>
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-light-primary)' }}>
              Everything You Need for Efficient GI Review
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: '🔍',
                title: 'Intelligent Filtering',
                desc: 'Removes blurry, duplicate, and normal frames using Laplacian sharpness + BRISQUE quality scoring. Reduces 50,000+ frames to the 5,000 most clinically relevant.',
              },
              {
                icon: '🎯',
                title: 'AI Lesion Detection',
                desc: 'Bounding boxes and confidence scores for active bleeding, polyps, ulcers, angiodysplasia, and 21+ finding categories. YOLOv8-x backbone for fast, accurate detection.',
              },
              {
                icon: '📄',
                title: 'Structured Reports',
                desc: 'Auto-compiled PDF report with key findings, annotated images, and severity classification. One-click signing and EMR export.',
              },
              {
                icon: '🔗',
                title: 'PACS / EMR Integration',
                desc: 'DICOM import from any source. HL7 FHIR export to major EMR systems. Works with your existing clinical infrastructure.',
              },
            ].map(({ icon, title, desc }, i) => (
              <ScrollReveal key={title} delay={(i + 1) as 1 | 2 | 3 | 4}>
                <div className="feature-card-light">
                  <div className="card-icon">
                    <span aria-hidden="true">{icon}</span>
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-3" style={{ color: 'var(--text-on-light-primary)' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-on-light-secondary)' }}>{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ROI CALCULATOR — Dark
          ════════════════════════════════════════ */}
      <section id="roi" className="section-dark section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4">Business Case</p>
            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-dark-primary)' }}>
              Calculate Your Time &amp; Cost Savings
            </h2>
            <p style={{ color: 'var(--text-on-dark-secondary)' }}>
              Adjust for your practice. Results update live.
            </p>
          </ScrollReveal>
          <ScrollReveal>
            <ROICalculator />
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          DEPLOYMENT + PRICING — Light
          ════════════════════════════════════════ */}
      <section id="pricing" className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-label mb-4" style={{ color: 'var(--color-cta)' }}>Deployment</p>
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-light-primary)' }}>
              Flexible Deployment. Transparent Pricing.
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            <ScrollReveal delay={1}>
              <div className="feature-card-light h-full">
                <div className="text-2xl mb-4" aria-hidden="true">☁️</div>
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-on-light-primary)' }}>Cloud (AWS Sydney)</h3>
                <ul className="space-y-2 mb-6">
                  {['Same-day setup', 'HIPAA-eligible infrastructure', 'No hardware required', 'Automatic updates'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-on-light-secondary)' }}>
                      <span style={{ color: 'var(--color-data-green)' }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <p className="font-mono font-bold text-3xl" style={{ color: 'var(--text-on-light-primary)' }}>$135<span className="text-base font-sans font-normal" style={{ color: 'var(--text-on-light-secondary)' }}>/case</span></p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className="feature-card-light h-full">
                <div className="text-2xl mb-4" aria-hidden="true">🖥️</div>
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-on-light-primary)' }}>On-Premise</h3>
                <ul className="space-y-2 mb-6">
                  {['Full data control', '1–2 week deployment', 'GPU server required', 'Custom integration support'].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-on-light-secondary)' }}>
                      <span style={{ color: 'var(--color-data-green)' }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <p className="font-mono font-bold text-3xl" style={{ color: 'var(--text-on-light-primary)' }}>Custom<span className="text-base font-sans font-normal" style={{ color: 'var(--text-on-light-secondary)' }}> pricing</span></p>
              </div>
            </ScrollReveal>
          </div>

          {/* Pricing tiers summary */}
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { tier: 'Pay-per-use', price: '$135/case' },
                { tier: 'Practice', price: '$99/case (volume)' },
                { tier: 'Enterprise', price: 'Custom' },
              ].map(({ tier, price }) => (
                <div key={tier} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                  style={{ background: 'var(--bg-light-surface)', border: '1px solid var(--border-light)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-on-light-primary)' }}>{tier}</span>
                  <span style={{ color: 'var(--color-cta)' }}>{price}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          COMPATIBILITY — Light
          ════════════════════════════════════════ */}
      <section className="section-light-surface section-py" style={{ borderTop: '1px solid var(--border-light)' }}>
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-10">
            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', letterSpacing: '-0.02em', color: 'var(--text-on-light-primary)' }}>
              Works With Your Existing Equipment
            </h2>
            <p style={{ color: 'var(--text-on-light-secondary)' }}>All major capsule endoscopy systems. No hardware changes required.</p>
          </ScrollReveal>
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-3">
              {['Medtronic PillCam', 'Olympus EndoCapsule', 'Ankon NaviCam', 'Jinshan OMOM', 'DICOM', 'JPEG', 'MP4', 'AVI'].map(item => (
                <span key={item} className="trust-badge" style={{ background: 'white', border: '1px solid var(--border-light)', color: 'var(--text-on-light-secondary)' }}>
                  {item}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PILOT CTA — Dark
          ════════════════════════════════════════ */}
      <section className="section-dark section-py relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(232,0,90,0.08) 0%, transparent 70%)' }} />
        <div className="section-container px-6 relative z-10 text-center">
          <ScrollReveal>
            <p className="text-label mb-4">Pilot Program</p>
            <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--text-on-dark-primary)' }}>
              Join Our Pilot Program
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-on-dark-secondary)' }}>
              50 cases FREE. 3 months access. No credit card required.
            </p>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
              {[
                'Full platform access',
                'Priority support',
                'Onboarding call',
                'Influence the roadmap',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-on-dark-secondary)' }}>
                  <span style={{ color: 'var(--color-data-positive)' }}>✓</span>
                  {item}
                </div>
              ))}
            </div>

            <Link href="/contact?type=pilot" className="btn-primary text-base px-8 py-4">
              Apply for Pilot →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FAQ — Light
          ════════════════════════════════════════ */}
      <section className="section-light section-py">
        <div className="section-container px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-display font-bold" style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em', color: 'var(--text-on-light-primary)' }}>
              Frequently Asked Questions
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <FAQ />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
