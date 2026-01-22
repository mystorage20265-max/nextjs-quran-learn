'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Shield,
  Heart,
  Globe
} from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    learn: [
      { name: 'Home', href: '/' },
      { name: 'About Us', href: '/about' },
      { name: 'Read Quran', href: '/read-quran' },
    ],
    courses: [
      { name: 'Tajweed', href: '/tajweed' },
      { name: 'Hifz Program', href: '/hifz' },
      { name: 'Tafsir Study', href: '/tafsir' },
      { name: 'Arabic Language', href: '/courses' },
    ],
    comingSoon: [
      { name: 'Courses', href: '/courses' },
      { name: 'TAJWEED', href: '/tajweed' },
      { name: 'Prayer Time', href: '/prayer-time' },
      { name: 'COMMUNITY', href: '/community' },
    ],
    resources: [
      { name: 'Read Quran', href: '/read-quran' },
      { name: 'Learn Quran', href: '/learn-quran' },
      { name: 'Memorize Quran', href: '/memorize-quran' },
      { name: 'Quran Player', href: '/quran-player' },
    ]
  };

  const socials = [
    { icon: <Facebook size={20} />, href: 'https://facebook.com', label: 'Facebook', color: '#1877F2' },
    { icon: <Twitter size={20} />, href: 'https://twitter.com', label: 'Twitter', color: '#1DA1F2' },
    { icon: <Instagram size={20} />, href: 'https://instagram.com', label: 'Instagram', color: '#E4405F' },
    { icon: <Youtube size={20} />, href: 'https://youtube.com', label: 'Youtube', color: '#FF0000' },
  ];

  return (
    <footer className="footer-advanced">
      <div className="footer-glow" />

      <div className="footer-container">
        {/* Top Section: Brand & Newsletter */}
        <div className="footer-top">
          <div className="footer-brand-hero">
            <Link href="/" className="footer-logo">
              <span className="logo-icon">☪</span>
              <span className="logo-text">Learn Quran</span>
            </Link>
            <p className="footer-tagline">
              Empowering your spiritual journey through intelligent Quranic education.
              Join millions worldwide in mastering the word of Allah.
            </p>
            <div className="footer-social-strip">
              {socials.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, color: social.color }}
                  className="social-strip-item"
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="footer-newsletter">
            <h4>Stay Connected</h4>
            <p>Get weekly Quranic insights and updates.</p>
            <a
              href="https://wa.me/916204130133?text=Assalamu%20Alaikum!%20I%20would%20like%20to%20receive%20weekly%20Quranic%20insights%20from%20Learn%20Quran"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              <img src="/whatsapp-icon.png" alt="WhatsApp" />
              Connect on WhatsApp
            </a>
          </div>
        </div>

        <div className="footer-divider" />

        {/* Middle Section: Links Grid */}
        <div className="footer-grid">
          <div className="footer-col">
            <h5>Learn</h5>
            <ul>
              {footerLinks.learn.map(link => (
                <li key={link.href}><Link href={link.href}>{link.name}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h5>Our Programs</h5>
            <ul>
              {footerLinks.courses.map(link => (
                <li key={link.href}><Link href={link.href}>{link.name}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h5>Coming Soon</h5>
            <ul>
              {footerLinks.comingSoon.map(link => (
                <li key={link.href}><Link href={link.href}>{link.name}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <ul>
              {footerLinks.resources.map(link => (
                <li key={link.href}><Link href={link.href}>{link.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        {/* Bottom Section: Legal & Trust */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <p>&copy; {currentYear} <strong>Learn Quran</strong>. All rights reserved.</p>
            <div className="legal-links">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
          </div>

          <div className="footer-trust">
            <div className="trust-badge">
              <Shield size={16} />
              <span>Secure Learning</span>
            </div>
            <div className="trust-badge">
              <Heart size={16} />
              <span>Built for Ummah</span>
            </div>
            <div className="trust-badge">
              <Globe size={16} />
              <span>Global Reach</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
