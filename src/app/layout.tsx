// app/layout.tsx
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer';
import { getOrganizationSchema, getWebsiteSchema } from '@/lib/seoSchemas';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';
import ClientWrapper from '@/components/ClientWrapper';

export const metadata: Metadata = {
  title: 'Learn Quran - Learn the Noble Quran | Interactive Quranic Education',
  description: 'Embark on a transformative journey with the Holy Quran through our comprehensive learning platform. Learn Quran with interactive lessons, audio recitations, and guided study plans.',
  keywords: 'Quran, Learn Quran, Quranic learning, Islamic education, Tajweed, Tafsir, Hifz, Arabic, Muslim, Islamic studies',
  authors: [{ name: 'Learn Quran Team' }],
  creator: 'Learn Quran',
  publisher: 'Learn Quran',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://quraniclearn.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Learn Quran - Learn the Noble Quran | Interactive Quranic Education',
    description: 'Embark on a transformative journey with the Holy Quran through our comprehensive learning platform designed for spiritual growth.',
    url: 'https://quraniclearn.com',
    siteName: 'Learn Quran',
    images: [
      {
        url: '/your-quran-logo.svg',
        width: 1200,
        height: 630,
        alt: 'Learn Quran - Learn the Noble Quran',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Quran - Learn the Noble Quran',
    description: 'Interactive Quranic learning platform for spiritual growth and understanding.',
    images: ['/your-quran-logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
        />

        {/* PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="QuranLearn" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* ✅ JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebsiteSchema()),
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Navbar />
          <ClientWrapper>
            <main id="main-content">
              {children}
            </main>
          </ClientWrapper>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}