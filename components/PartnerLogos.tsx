import Image from 'next/image';

interface Partner {
  name: string;
  logo: string;
  width: number;
  height: number;
}

// Real partner logo assets — copied to public/partners/
export const partners: Partner[] = [
  { name: 'Google Cloud', logo: '/partners/Google-Cloud-Emblem.png', width: 120, height: 40 },
  { name: 'University of Otago', logo: '/partners/uoo-logo.svg', width: 140, height: 40 },
  { name: 'Amazon Web Services', logo: '/partners/amazon_web_services_logo.jpg', width: 120, height: 40 },
  { name: 'Ministry of Awesome', logo: '/partners/ministryofawesome_logo.jpg', width: 120, height: 40 },
  { name: 'NVIDIA Inception', logo: '/partners/nvidia-inception-program-badge-rgb-for-screen.png', width: 100, height: 40 },
];

export default function PartnerLogos() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-items-center">
      {partners.map(({ name, logo, width, height }) => (
        <div
          key={name}
          className="flex items-center justify-center px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] transition-all hover:border-[var(--border-strong)] group"
          style={{ height: 64, minWidth: 80 }}
          title={name}
        >
          <Image
            src={logo}
            alt={name}
            width={width}
            height={height}
            className="object-contain transition-all duration-300 grayscale group-hover:grayscale-0"
            style={{ height: 40, width: 'auto', maxWidth: width }}
          />
        </div>
      ))}
    </div>
  );
}
