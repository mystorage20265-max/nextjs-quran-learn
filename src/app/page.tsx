// Learn Quran - ADVANCED ANIMATIONS
// Parallax, Scroll Reveals, 3D Effects, Micro-interactions
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MessageSquare, Monitor, Pause, Play, ArrowRight, BookOpen, Heart, GraduationCap, Users, Sparkles } from 'lucide-react';
import './demo-styles.css';

const CelestialIman = dynamic(() => import('@/components/celestial-iman'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #0d1b2a 50%, #1b263b 100%)' }} />
});

const SOLUTION_TABS = [
  { id: 'tajweed', label: 'Tajweed', desc: 'Master the art of recitation with real-time AI feedback', icon: '📖' },
  { id: 'hifz', label: 'Hifz', desc: 'Smart memorization tracks tailored to your pace', icon: '🧠' },
  { id: 'tafsir', label: 'Tafsir', desc: 'Deepen your understanding with multi-dimensional insights', icon: '✨' },
  { id: 'arabic', label: 'Arabic', desc: 'Learn the language of the Quran from basics to advanced', icon: '🗣️' },
  { id: 'community', label: 'Community', desc: 'Connect with a global network of Quranic students', icon: '🌍' },
  { id: 'radio', label: 'Quran Radio', desc: 'Listen to 24/7 world-class Quranic recitations', icon: '📻' }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('tajweed');
  const [showDemoVideo, setShowDemoVideo] = useState(false); // STATE FOR VIDEO MODAL
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Refs for scroll animations
  const logosRef = useRef<HTMLElement>(null);
  const solutionsRef = useRef<HTMLElement>(null);
  const aiTowerRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const insightsRef = useRef<HTMLElement>(null);
  const workRef = useRef<HTMLElement>(null);

  // --- Carousel Data ---
  const slides = [
    {
      title: "Put Quranic knowledge to work",
      subtitle: "for your Iman",
      desc: "The first intelligent platform that connects Quranic sciences with modern adaptive learning technology.",
      primaryBtn: "Start Learning",
      secondaryBtn: "Watch Demo",
      bg: "bg-[#002d3d]"
    },
    {
      title: "Master Tajweed",
      subtitle: "with precision",
      desc: "Learn the art of beautiful Quran recitation with interactive audio lessons, expert guidance, and real-time feedback.",
      primaryBtn: "Explore Tajweed",
      secondaryBtn: "Listen to Samples",
      bg: "bg-[#001f2b]"
    },
    {
      title: "Memorize with confidence",
      subtitle: "verse by verse",
      desc: "Smart repetition techniques, progress tracking, and personalized memorization plans to help you achieve your Hifz goals.",
      primaryBtn: "Start Memorizing",
      secondaryBtn: "See Methods",
      bg: "bg-[#002530]"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Global parallax
      setMousePos({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      });

      // Card Glow & 3D Tilt Effect - ONLY when hovering
      const cards = document.querySelectorAll('.hero-card-item');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if mouse is actually over the card
        const isHovering = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

        if (isHovering) {
          // Calculate percentage position
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
          const rotateY = ((x - centerX) / centerX) * 10;

          const cardEl = card as HTMLElement;
          cardEl.style.setProperty('--mx', `${x}px`);
          cardEl.style.setProperty('--my', `${y}px`);
          cardEl.style.setProperty('--rx', `${rotateX}deg`);
          cardEl.style.setProperty('--ry', `${rotateY}deg`);
        } else {
          // Reset to straight when not hovering
          const cardEl = card as HTMLElement;
          cardEl.style.setProperty('--rx', `0deg`);
          cardEl.style.setProperty('--ry', `0deg`);
        }
      });

      // Magnetic Buttons
      const magnets = document.querySelectorAll('.magnetic-btn');
      magnets.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);

        // Only activate if close
        if (Math.abs(x) < 100 && Math.abs(y) < 100) {
          const btnEl = btn as HTMLElement;
          btnEl.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        } else {
          (btn as HTMLElement).style.transform = `translate(0px, 0px)`;
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    // Intersection Observer for scroll animations
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const children = entry.target.querySelectorAll('.animate-child');
          children.forEach((child, i) => {
            setTimeout(() => child.classList.add('visible'), i * 100);
          });
        }
      });
    }, observerOptions);

    const refs = [logosRef, solutionsRef, aiTowerRef, testimonialsRef, statsRef, insightsRef, workRef];
    refs.forEach(ref => ref.current && observer.observe(ref.current));

    // Carousel Timer
    let timer: NodeJS.Timeout | null = null;
    if (!isPaused) {
      timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 6000);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (timer) clearInterval(timer);
      observer.disconnect();
    };
  }, [isPaused, slides.length]);

  return (
    <main className="demo-page">
      <div className="particles-bg">
        {[...Array(30)].map((_, i) => (
          <div key={i} className={`particle p${i % 5}`} style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 20}s`
          }} />
        ))}
      </div>

      {/* VIDEO MODAL */}
      {showDemoVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowDemoVideo(false)}>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 text-white hover:text-green-400 z-10 bg-black/50 rounded-full p-2 transition-colors"
              onClick={() => setShowDemoVideo(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <video
              width="100%"
              height="100%"
              src="/COMING SOON.mp4"
              title="Quran Demo"
              autoPlay
              controls
              playsInline
              className="w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* ===== FLOATING CTA ===== */}
      <div className="floating-btns">
        <button className="floating-btn contact magnetic-btn">
          <MessageSquare size={20} />
          <span>Contact Support</span>
        </button>
        <button className="floating-btn demo-btn magnetic-btn">
          <Monitor size={20} />
          <span>Quick Tour</span>
        </button>
      </div>

      {/* ===== HERO SECTION - OFFICIAL SPLIT LAYOUT ===== */}
      <section className="hero-section split-layout">
        {/* Background Carousel */}
        <div className="hero-bg-carousel">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`hero-bg-slide ${currentSlide === idx ? 'active ken-burns' : ''} ${slide.bg}`}
            />
          ))}
          <div className="hero-overlay" />
        </div>

        <div className="hero-container container-wide">
          {/* Hero Parallax Orbs */}
          <div className="hero-orb orb-1" style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }} />
          <div className="hero-orb orb-2" style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }} />

          <div className="hero-top-row">
            {/* LEFT: Heading & Dots */}
            <div className="hero-left">
              <h1 className="hero-title-main">
                <span className="green-text">{slides[currentSlide].title}</span>
                <span className="white-text">{slides[currentSlide].subtitle}</span>
              </h1>

              {/* Horizontal Carousel Indicators */}
              <div className="hero-controls-horizontal">
                <div className="indicator-group">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`indicator-pills ${currentSlide === idx ? 'active' : ''}`}
                    >
                      <div className="pill-fill" style={{
                        animationPlayState: isPaused ? 'paused' : 'running'
                      }} />
                    </button>
                  ))}
                </div>
                <button className="pause-btn" onClick={() => setIsPaused(!isPaused)}>
                  {isPaused ? <Play size={16} fill="white" /> : <Pause size={16} fill="white" />}
                </button>
              </div>
            </div>

            {/* RIGHT: Description & Buttons */}
            <div className="hero-right">
              <p className="hero-description">
                {slides[currentSlide].desc}
              </p>
              <div className="hero-actions">
                <Link href={
                  currentSlide === 0 ? '/read-quran' :
                    currentSlide === 1 ? '/learn-quran' :
                      '/memorize-quran'
                }>
                  <button className="btn-explore-platform magnetic-btn">
                    {slides[currentSlide].primaryBtn}
                  </button>
                </Link>

                <button
                  className="btn-watch-video magnetic-btn"
                  onClick={() => setShowDemoVideo(true)}
                >
                  <div className="play-icon-circle">
                    <Play size={12} fill="white" />
                  </div>
                  {slides[currentSlide].secondaryBtn}
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM: Horizontal Feature Cards */}
          <div className="hero-bottom-cards">
            {[
              { title: "Interactive Quran Reading", label: "READING", img: "/images/quran_reading.png", link: "/read-quran" },
              { title: "Advanced Memorization", label: "HIFZ", img: "/images/memorization.png", link: "/memorize-quran" },
              { title: "Noorani Qaida Lessons", label: "LEARN", img: "/images/qaida.png", link: "/learn-quran" }
            ].map((card, idx) => (
              <Link href={card.link} key={idx} className="hero-card-item group">
                <div className="card-image-wrapper">
                  <img src={card.img} alt={card.title} className="card-img" />
                  <div className="card-overlay" />
                  <div className="card-content">
                    <span className="card-label">{card.label}</span>
                    <h3 className="card-title">{card.title}</h3>
                  </div>
                  <div className="card-arrow">
                    <ArrowRight size={24} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CELESTIAL IMAN - SOLAR SYSTEM INTERFACE ===== */}
      <CelestialIman />

      {/* ===== SOLUTION TABS with animations ===== */}
      <section className="solutions-section reveal-section" ref={solutionsRef}>
        <h2 className="solutions-title animate-child">
          Learning the Qur’an <span className="green gradient-text"> nurturing the soul</span>
        </h2>
        <div className="solution-tabs animate-child">
          {SOLUTION_TABS.map((tab, i) => (
            <button
              key={tab.id}
              className={`solution-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="solution-content">
          {SOLUTION_TABS.filter(t => t.id === activeTab).map((tab) => (
            <div key={tab.id} className="solution-panel slide-in-panel">
              <div className="panel-visual tilt-card">
                <div className="panel-icon bounce-in">{tab.icon}</div>
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop" alt="Dashboard" className="panel-image" />
              </div>
              <div className="panel-info">
                <h3 className="text-reveal">{tab.label}</h3>
                <p>{tab.desc}</p>
                <button className="btn-outline hover-arrow">Learn More <span>→</span></button>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* ===== TESTIMONIALS with parallax cards ===== */}
      <section className="testimonials-section reveal-section" ref={testimonialsRef}>
        <h2 className="section-title animate-child">
          When hearts connect with the Quran, <span className="green">souls find peace</span>
        </h2>
        <div className="testimonial-cards">
          <div className="testimonial-card hover-lift-3d animate-child">
            <div className="testimonial-image">
              <img src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=600&h=400&fit=crop" alt="Quran Study" />
              <div className="image-overlay"></div>
            </div>
            <div className="testimonial-stat glass-stat">
              <span className="stat-value counter-animate">100%</span>
              <span className="stat-label">Authentic Quranic resources</span>
            </div>
          </div>
          <div className="testimonial-card hover-lift-3d animate-child">
            <div className="testimonial-image">
              <img src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&h=400&fit=crop" alt="Islamic Learning" />
              <div className="image-overlay"></div>
            </div>
            <div className="testimonial-stat glass-stat">
              <span className="stat-value counter-animate">24/7</span>
              <span className="stat-label">Access to learning modules</span>
            </div>
          </div>
        </div>
      </section>


      {/* ===== STATS with counter animation ===== */}
      <section className="stats-section reveal-section" ref={statsRef}>
        <h3 className="animate-child">The Holy Quran in numbers</h3>
        <div className="stats-grid">
          {[
            { num: '114', text: 'Surahs (Chapters)' },
            { num: '6,236', text: 'Ayahs (Verses)' },
            { num: '30', text: 'Juz (Parts)' },
            { num: '77,797', text: 'Words' }
          ].map((stat, i) => (
            <div key={stat.num} className="stat-item animate-child scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="stat-num counter-up">{stat.num}</span>
              <span className="stat-text">{stat.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== INSIGHTS with card animations ===== */}
      <section className="insights-section reveal-section" ref={insightsRef}>
        <div className="insights-header">
          <h2 className="insights-title animate-child">
            <span className="green">Latest insights</span><br />
            from our experts
          </h2>
          <div className="insights-buttons animate-child">
            <button className="btn-outline hover-fill">View Blogs</button>
            <button className="btn-outline hover-fill">View Research</button>
          </div>
        </div>

        <div className="insights-grid">
          <div className="insight-featured animate-child gradient-shift">
            <div className="featured-shapes">
              <div className="shape-ring spin-slow"></div>
              <div className="shape-donut bounce-slow"></div>
              <div className="shape-cube rock-slow">📦</div>
              <div className="shape-sphere float-slow"></div>
            </div>
            <div className="featured-content">
              <span className="insight-label">GUIDE</span>
              <h3>Ramadan<br />Recitation<br />Tracker<br /><span className="year glow-text">2026</span></h3>
              <a href="#" className="insight-link hover-arrow">Read Forecast <span>→</span></a>
            </div>
          </div>

          {[
            { badge: 'Tajweed', sub: 'Mastery', title: 'The Art of Perfect Recitation 2026', style: 'gartner' },
            { badge: 'Hifz', sub: 'Techniques', title: 'Modern Memorization Methods for Adults', style: 'ai-itsm' },
            { badge: 'Quran', sub: 'Insights', title: 'Deep Dive into Surah Multi-Dimensionality', style: 'maturity' }
          ].map((card, i) => (
            <div key={card.title} className="insight-card animate-child hover-lift-3d" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`insight-image ${card.style}`}>
                <span>{card.badge}</span>
                <span className="sub">{card.sub}</span>
              </div>
              <div className="insight-content">
                <span className="insight-label">REPORT</span>
                <h4>{card.title}</h4>
                <a href="#" className="insight-link hover-arrow">Read Report <span>→</span></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WORK SECTION with stagger ===== */}
      <section className="work-section reveal-section" ref={workRef}>
        <div className="work-left">
          <h2 className="animate-child"><span className="green">Our Vision</span> for Quranic Excellence</h2>
          <p className="animate-child">Empowering Muslims worldwide to connect deeply with the Quran through innovative learning, authentic knowledge, and spiritual growth.</p>
        </div>
        <div className="work-cards">
          {[
            { icon: <BookOpen size={28} />, title: 'Master Quranic Recitation', desc: 'Perfect your Tajweed and recite with beauty and precision through guided lessons.' },
            { icon: <Heart size={28} />, title: 'Deepen Spiritual Connection', desc: 'Transform your relationship with Allah through understanding and reflection on His words.' },
            { icon: <GraduationCap size={28} />, title: 'Comprehensive Learning', desc: 'From Noorani Qaida to advanced Tafsir, journey through all levels of Quranic knowledge.' },
            { icon: <Users size={28} />, title: 'Global Muslim Community', desc: 'Connect with learners worldwide, share insights, and grow together in faith.' }
          ].map((card, i) => (
            <div key={card.title} className="work-card animate-child slide-in-right" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="work-icon bounce-hover">{card.icon}</div>
              <div className="work-info">
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
              </div>
              <div className="work-icon bounce-hover" style={{ opacity: 0.6 }}><Sparkles size={20} /></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
