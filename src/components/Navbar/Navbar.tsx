'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Menu,
  X,
  Home,
  BookOpen,
  GraduationCap,
  Brain,
  LayoutGrid,
  Info,
  Book,
  Search,
  Sparkles,
  Mic2,
  Clock,
  Users,
  PlayCircle,
  Radio,
  Music,
  LogIn,
  UserPlus,
  Star
} from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home size={18} /> },
    { href: '/read-quran', label: 'Read Quran', icon: <BookOpen size={18} /> },
    { href: '/learn-quran', label: 'Learn Quran', icon: <GraduationCap size={18} /> },
    { href: '/memorize-quran', label: 'Memorize Quran', icon: <Brain size={18} /> },
  ];

  const moreFeatures = [
    { href: '/courses', label: 'Courses', icon: <Book size={16} /> },
    { href: '/duas', label: 'DUAS', icon: <Sparkles size={16} /> },
    { href: '/prayer-time', label: 'Prayer Time', icon: <Clock size={16} /> },
    { href: '/community', label: 'COMMUNITY', icon: <Users size={16} /> },
    { href: '/quran-player', label: 'Quran Player', icon: <PlayCircle size={16} /> },
    { href: '/radio', label: 'Quran Radio', icon: <Radio size={16} /> },
  ];

  return (
    <nav className={`nav-wrapper ${isScrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo Section */}
        <Link href="/" className="nav-logo" onClick={closeMenu}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="logo-container"
          >
            <Image
              src="/logo-v4.png"
              alt="Learn Quran"
              width={100}
              height={100}
              className="logo-img"
              priority
            />
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links-desktop">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-item ${pathname === link.href ? 'nav-item-active' : ''}`}
            >
              <motion.span
                className="nav-item-content"
                whileHover={{ y: -2 }}
              >
                {link.icon}
                {link.label}
              </motion.span>
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-underline"
                  className="nav-underline"
                />
              )}
            </Link>
          ))}

          {/* More Features Dropdown */}
          <div className="nav-dropdown-wrapper" ref={dropdownRef}>
            <button
              className={`nav-item dropdown-trigger ${activeDropdown === 'more' ? 'active' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
            >
              <LayoutGrid size={18} />
              More
              <ChevronDown size={14} className={`chevron ${activeDropdown === 'more' ? 'rotate' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'more' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="dropdown-panel"
                >
                  <div className="dropdown-grid">
                    {moreFeatures.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="dropdown-link"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className="dropdown-icon">{item.icon}</span>
                        <span className="dropdown-label">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Auth */}
        <div className="nav-auth-desktop">
          <Link href="/login" className="auth-btn login-btn">
            <LogIn size={18} />
            <span>Login</span>
          </Link>
          <Link href="/signup" className="auth-btn signup-btn">
            <UserPlus size={18} />
            <span>Join Now</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="mobile-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-overlay"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="mobile-sidebar"
            >
              <div className="sidebar-header">
                <div className="logo-container">
                  <Image
                    src="/logo-v4.png"
                    alt="Learn Quran"
                    width={80}
                    height={80}
                    priority
                  />
                </div>
                <button className="sidebar-close" onClick={closeMenu}><X size={24} /></button>
              </div>

              <div className="sidebar-scroll">
                <div className="sidebar-section">
                  <p className="sidebar-label">Main Navigation</p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                      onClick={closeMenu}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="sidebar-divider" />

                <div className="sidebar-section">
                  <p className="sidebar-label">Explore More</p>
                  <div className="sidebar-grid">
                    {moreFeatures.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="sidebar-grid-item"
                        onClick={closeMenu}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sidebar-footer">
                <Link href="/login" className="sidebar-btn sidebar-login" onClick={closeMenu}>
                  <LogIn size={18} />
                  Login
                </Link>
                <Link href="/signup" className="sidebar-btn sidebar-signup" onClick={closeMenu}>
                  <UserPlus size={18} />
                  Join Now
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}