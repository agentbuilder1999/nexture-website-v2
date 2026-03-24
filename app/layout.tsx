import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nexture — AI-Powered Capsule Endoscopy Review',
  description:
    'TheraSeus cuts capsule endoscopy review time by 90% — from 60 minutes to 6. Clinical-grade AI for gastroenterologists. HIPAA-ready, NVIDIA Inception member.',
  keywords: ['AI healthcare', 'capsule endoscopy', 'TheraSeus', 'medical AI', 'NZ healthtech', 'gastroenterology AI'],
  openGraph: {
    title: 'Nexture — AI-Powered Capsule Endoscopy Review',
    description: 'TheraSeus cuts capsule endoscopy review time by 90% — from 60 minutes to 6.',
    url: 'https://nexture.nz',
    siteName: 'Nexture',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${ibmMono.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
