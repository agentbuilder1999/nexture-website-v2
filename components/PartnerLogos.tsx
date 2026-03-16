import Image from 'next/image';

interface Partner {
  name: string;
  logo?: string;        // path to image asset
  color?: string;       // fallback text color
  logoWidth?: number;
}

export const partners: Partner[] = [
  { name: 'NVIDIA Inception', color: '#76B900' },
  {
    name: 'Ministry of Awesome',
    logo: '/assets/logo-ministry-awesome.png',
    logoWidth: 140,
  },
  { name: 'University of Otago', color: '#00539F' },
  { name: 'Amazon Web Services', color: '#FF9900' },
  {
    name: 'Google Cloud',
    logo: '/assets/logo-google-cloud.png',
    logoWidth: 110,
  },
];

export default function PartnerLogos() {
  return (
    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
      {partners.map(({ name, logo, color, logoWidth }) =>
        logo ? (
          <div
            key={name}
            className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] transition-all hover:border-[var(--border-strong)] h-12"
            title={name}
          >
            <Image
              src={logo}
              alt={name}
              height={32}
              width={logoWidth ?? 100}
              className="h-8 w-auto object-contain brightness-0 invert"
              style={{ maxWidth: logoWidth }}
            />
          </div>
        ) : (
          <div
            key={name}
            className="px-5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-sm font-semibold transition-all hover:border-[var(--border-strong)] h-12 flex items-center"
            style={{ color }}
          >
            {name}
          </div>
        )
      )}
    </div>
  );
}
