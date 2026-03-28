import type { Metadata } from 'next';
import Image from 'next/image';
import SectionWrapper from '@/components/SectionWrapper';
import GradientText from '@/components/GradientText';

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
                      <a
                        href="https://open.spotify.com/show/5LR0JjJpCtay8ggsz8oROd"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-medium text-[var(--text-secondary)] hover:border-[#1DB954] hover:text-[#1DB954] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        Listen on Spotify
                      </a>
                      <a
                        href="https://podcasts.apple.com/us/podcast/nexture-ai-dive/id1774201386"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-medium text-[var(--text-secondary)] hover:border-[#fc3c44] hover:text-[#fc3c44] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.16c5.435 0 9.84 4.406 9.84 9.84 0 5.435-4.405 9.84-9.84 9.84-5.434 0-9.84-4.405-9.84-9.84 0-5.434 4.406-9.84 9.84-9.84zm0 1.68c-4.508 0-8.16 3.652-8.16 8.16s3.652 8.16 8.16 8.16 8.16-3.652 8.16-8.16-3.652-8.16-8.16-8.16zM12 6a6 6 0 1 1 0 12A6 6 0 0 1 12 6zm0 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                        </svg>
                        Listen on Apple Podcasts
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </section>

    </>
  );
}
