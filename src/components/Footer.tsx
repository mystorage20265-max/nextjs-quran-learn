'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, X, Instagram, Youtube, Shield, Heart, Globe } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const navColumns = [
    {
      heading: 'Explore',
      links: [
        { name: 'Home', href: '/' },
        { name: 'Read Quran', href: '/read-quran/1' },
        { name: 'Audio Quran', href: '/audio-quran' },
        { name: 'Quran Radio', href: '/radio' },
      ],
    },
    {
      heading: 'Learn',
      links: [
        { name: 'Memorize (Hifz)', href: '/memorize-quran' },
        { name: 'Word by Word', href: '/read-quran/1?mode=word-by-word' },
        { name: 'Juz / Para', href: '/juz/1' },
        { name: 'Quran & Science', href: '/quran-science' },
      ],
    },
    {
      heading: 'Tools',
      links: [
        { name: 'Prayer Times', href: '/prayer-time' },
        { name: 'Manzil', href: '/manzil/1' },
        { name: 'Coming Soon', href: '/coming-soon' },
      ],
    },
  ];

  const socials = [
    { icon: <Facebook size={18} />, href: 'https://facebook.com', label: 'Facebook' },
    { icon: <X size={18} />, href: 'https://x.com', label: 'X (Twitter)' },
    { icon: <Instagram size={18} />, href: 'https://instagram.com', label: 'Instagram' },
    { icon: <Youtube size={18} />, href: 'https://youtube.com', label: 'YouTube' },
  ];

  const stats = [
    { num: '114', label: 'Surahs' },
    { num: '6,236', label: 'Ayahs' },
    { num: '30', label: 'Juz' },
    { num: '77,797', label: 'Words' },
  ];

  return (
    <footer className="ftr">
      {/* Glow */}
      <div className="ftr-glow" />

      {/* ── Arabic verse banner ── */}
      <div className="ftr-verse-bar">
        <span className="ftr-verse-ar">وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ</span>
        <span className="ftr-verse-en">"And We send down of the Quran that which is healing and mercy for the believers." — 17:82</span>
      </div>

      <div className="ftr-container">

        {/* ── Stats strip ── */}
        <div className="ftr-stats">
          {stats.map(s => (
            <div key={s.label} className="ftr-stat">
              <span className="ftr-stat-num">{s.num}</span>
              <span className="ftr-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Main grid: brand + columns + CTA ── */}
        <div className="ftr-main">
          {/* Brand */}
          <div className="ftr-brand">
            <Link href="/" className="ftr-logo">
              <span className="ftr-logo-icon">☪</span>
              <span className="ftr-logo-text">Learn Quran</span>
            </Link>
            <p className="ftr-desc">
              Empowering your spiritual journey through intelligent, interactive Quranic education.
              Join Muslims worldwide in mastering the Word of Allah.
            </p>
            {/* Social icons */}
            <div className="ftr-socials">
              {socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="ftr-social" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {navColumns.map(col => (
            <div key={col.heading} className="ftr-col">
              <h5 className="ftr-col-heading">{col.heading}</h5>
              <ul className="ftr-col-list">
                {col.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="ftr-link">
                      <span className="ftr-link-arrow">›</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* WhatsApp CTA */}
          <div className="ftr-cta-card">
            <div className="ftr-cta-top-bar" />
            <h4 className="ftr-cta-heading">Stay Connected</h4>
            <p className="ftr-cta-sub">Get weekly Quranic insights, reminders & updates.</p>
            <a
              href="https://wa.me/916204130133?text=Assalamu%20Alaikum!%20I%20would%20like%20to%20receive%20weekly%20Quranic%20insights"
              target="_blank" rel="noopener noreferrer"
              className="ftr-wa-btn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Connect on WhatsApp
            </a>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="ftr-divider" />

        {/* ── Bottom bar ── */}
        <div className="ftr-bottom">
          <p className="ftr-copy">© {currentYear} <strong>Learn Quran</strong>. All rights reserved. Made with ❤️ for the Ummah.</p>
          <div className="ftr-badges">
            <span className="ftr-badge"><Shield size={13} />Secure</span>
            <span className="ftr-badge"><Heart size={13} />Built for Ummah</span>
            <span className="ftr-badge"><Globe size={13} />Global</span>
          </div>
          <div className="ftr-legal-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
