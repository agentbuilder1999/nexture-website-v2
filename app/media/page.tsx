import type { Metadata } from 'next';
import Image from 'next/image';
import SectionWrapper from '@/components/SectionWrapper';
import GradientText from '@/components/GradientText';
import PartnerLogos from '@/components/PartnerLogos';

export const metadata: Metadata = {
  title: 'Media & Press — Nexture',
  description: "Nexture's work in AI-powered healthcare has been recognized across New Zealand and internationally.",
};

const pressItems = [
  { outlet: 'Good News Aotearoa', logo: '📰', headline: 'Six Kiwi Innovations Changing the Game', excerpt: 'Nexture featured among six New Zealand innovations making a global impact in healthcare technology.', url: 'https://www.regenerationhq.co.nz/commentary/good-news-aotearoa-six-kiwi-innovations-changing-the-game', date: '2025' },
  { outlet: 'CHI.org.nz', logo: '🏥', headline: 'The Kiwi AI Startup Revolutionising Gastrointestinal Healthcare', excerpt: 'How a Christchurch startup is using AI to cut diagnostic time by 90% for gastroenterologists.', url: 'https://chi.org.nz/announcements/e8e36b77-d4fc-4904-9562-dc21d5ce0431', date: '2025' },
  { outlet: 'NZ Entrepreneur Magazine', logo: '📖', headline: 'The Kiwi AI Startup Revolutionising GI Healthcare', excerpt: "NZ Entrepreneur Magazine profiles Victor Sun and Nexture's mission to transform medical diagnostics.", url: 'https://nzentrepreneur.co.nz/nexture-the-kiwi-ai-startup-revolutionising-gastrointestinal-healthcare/', date: '2025' },
  { outlet: 'Ministry of Awesome', logo: '🚀', headline: 'Startup Stories: Victor Sun — Nexture', excerpt: 'Victor shares the story behind Nexture and the journey to building AI for capsule endoscopy.', url: 'https://ministryofawesome.com/startup-stories/startup-stories-victor-sun-nexture/', date: '2024' },
  { outlet: 'Caffeine Daily', logo: '☕', headline: 'New Startup Tackles Diagnostic Delays', excerpt: "Nexture's TheraSeus is tackling one of the biggest bottlenecks in gastrointestinal diagnostics.", url: '#', date: '2024' },
];

const podcasts = [
  { platform: 'Spotify', icon: '🎵' },
  { platform: 'Apple Podcasts', icon: '🎙️' },
  { platform: 'YouTube', icon: '▶️' },
];

export default function MediaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden pt-16">
        {/* Background image */}
        <Image
          src="/images/headers/m.jpg"
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
            <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-3">Press &amp; Media</p>
            <GradientText as="h1" className="text-5xl md:text-6xl font-extrabold mb-4">In the News</GradientText>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl">
              {"Nexture's work in AI-powered healthcare has been recognized across New Zealand."}
            </p>
          </SectionWrapper>
        </div>
      </section>

      {/* Press Coverage */}
      <section className="section">
        <div className="container mx-auto">
          <SectionWrapper className="mb-10">
            <GradientText as="h2" className="text-3xl font-extrabold mb-2">Press Coverage</GradientText>
            <p className="text-[var(--text-secondary)]">Recent mentions and features from NZ media.</p>
          </SectionWrapper>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pressItems.map(({ outlet, logo, headline, excerpt, url, date }, i) => (
              <SectionWrapper key={outlet} delay={i * 0.08}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex flex-col h-full group cursor-pointer no-underline"
                  aria-label={`Read: ${headline} on ${outlet}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{logo}</span>
                    <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">{outlet}</span>
                    <span className="ml-auto text-xs text-[var(--text-muted)]">{date}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)] mb-2 leading-snug group-hover:text-[var(--accent-purple)] transition-colors">
                    {headline}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">{excerpt}</p>
                  <p className="text-xs text-[var(--accent-link)] mt-3">Read article →</p>
                </a>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Podcast */}
      <section className="section bg-[var(--bg-section-alt)]">
        <div className="container mx-auto">
          <SectionWrapper>
            <div className="max-w-3xl mx-auto card-gradient-border">
              <div className="card-gradient-border-inner">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-4xl">
                    🎙️
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-1">Podcast</p>
                    <h2 className="text-2xl font-bold text-[var(--text-heading)] mb-2">Nexture AI Dive</h2>
                    <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                      Victor Sun and guests explore the intersection of artificial intelligence, healthcare innovation, and the future of clinical practice. Episodes available on all major platforms.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {podcasts.map(({ platform, icon }) => (
                        <span
                          key={platform}
                          className="btn-ghost text-sm py-2 px-4 opacity-50 cursor-not-allowed select-none relative group"
                          aria-disabled="true"
                          title="Coming Soon"
                        >
                          {icon} {platform}
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] text-xs rounded px-2 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Coming Soon
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Partner logos */}
      <section className="section-sm">
        <div className="container mx-auto">
          <SectionWrapper className="text-center">
            <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-8">
              Trusted &amp; Supported By
            </p>
            <PartnerLogos />
          </SectionWrapper>
        </div>
      </section>
    </>
  );
}
