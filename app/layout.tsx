import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nexture — AI-Powered Healthcare Innovation',
  description:
    'Nexture builds AI-powered tools that give clinicians back their time. TheraSeus cuts capsule endoscopy review time by up to 90%.',
  keywords: ['AI healthcare', 'capsule endoscopy', 'TheraSeus', 'medical AI', 'NZ healthtech'],
  openGraph: {
    title: 'Nexture — AI-Powered Healthcare Innovation',
    description: 'Nexture builds AI-powered tools that give clinicians back their time.',
    url: 'https://nexture.nz',
    siteName: 'Nexture',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
