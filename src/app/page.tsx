// Learn Quran - ADVANCED ANIMATIONS
// Parallax, Scroll Reveals, 3D Effects, Micro-interactions
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Globe, MessageSquare, Monitor, Pause, Play, ArrowRight, ChevronDown } from 'lucide-react';
import './demo-styles.css';

const LOGOS = ['Azhar', 'Medina', 'Makkah', 'Cairo', 'Istanbul', 'Doha'];
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

      // Card Glow & 3D Tilt Effect
      const cards = document.querySelectorAll('.hero-card-item');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

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
      {/* Animated Background Particles */}
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
                <button className="btn-explore-platform magnetic-btn">
                  {slides[currentSlide].primaryBtn}
                </button>
                <button className="btn-watch-video magnetic-btn">
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
              { title: "AI Control Tower", label: "DASHBOARD", img: "https://images.pexels.com/photos/5926382/pexels-photo-5926382.jpeg?auto=compress&cs=tinysrgb&w=800" },
              { title: "Connected Workflow", label: "PROCESS", img: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=800" },
              { title: "AI-Powered Service", label: "AGENTS", img: "https://images.pexels.com/photos/7006949/pexels-photo-7006949.jpeg?auto=compress&cs=tinysrgb&w=800" }
            ].map((card, idx) => (
              <div key={idx} className="hero-card-item group">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOLUTION TABS with animations ===== */}
      <section className="solutions-section reveal-section" ref={solutionsRef}>
        <h2 className="solutions-title animate-child">
          Run your enterprise on the <span className="green gradient-text">Learn Quran AI Platform</span>
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

      {/* ===== AI TOWER / INFINITY LOOP - TRUE ∞ SHAPE WITH FLOWING TRACERS ===== */}
      <section className="ai-tower-section reveal-section" ref={aiTowerRef}>
        <h2 className="section-title animate-child">
          <span className="green">Bring intelligence</span> to every corner<br />of your life
        </h2>

        <div className="infinity-wrapper">
          {/* TWINKLING STARS LAYER */}
          <div className="stars-layer">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="twinkle-star" style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}>✦</div>
            ))}
          </div>

          {/* TRUE SVG INFINITY SYMBOL with 3D glass tube effect */}
          <svg className="infinity-svg-3d" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* 3D Glass Tube Gradient */}
              <linearGradient id="tube3dGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0066cc" />
                <stop offset="20%" stopColor="#00c8f0" />
                <stop offset="40%" stopColor="#00f5d4" />
                <stop offset="50%" stopColor="#81b532" />
                <stop offset="60%" stopColor="#00f5d4" />
                <stop offset="80%" stopColor="#00c8f0" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>

              {/* Inner highlight for 3D effect */}
              <linearGradient id="tubeHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow3d" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Center green glow */}
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(129, 181, 50, 0.8)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* Tracer gradient */}
              <linearGradient id="tracerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="#00f5d4" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Background glow layer */}
            <ellipse cx="500" cy="250" rx="120" ry="100" fill="url(#centerGlow)" className="center-glow-svg" />

            {/* FULL INFINITY PATH (Used for tracers) */}
            <path
              id="fullInfinityPath"
              d="M500,250 
                               C500,350 400,420 280,420 
                               C130,420 80,320 80,250 
                               C80,180 130,80 280,80 
                               C400,80 500,150 500,250
                               C500,350 600,420 720,420 
                               C870,420 920,320 920,250 
                               C920,180 870,80 720,80 
                               C600,80 500,150 500,250"
              fill="none"
            />

            {/* BACK PART of infinity */}
            <path
              className="infinity-line back"
              d="M500,250 C500,150 600,80 720,80 C870,80 920,180 920,250 C920,320 870,420 720,420 C600,420 500,350 500,250"
              fill="none" stroke="url(#tube3dGrad)" strokeWidth="70" strokeLinecap="round" filter="url(#glow3d)"
            />

            {/* FRONT PART of infinity */}
            <path
              className="infinity-line front"
              d="M500,250 C500,350 400,420 280,420 C130,420 80,320 80,250 C80,180 130,80 280,80 C400,80 500,150 500,250"
              fill="none" stroke="url(#tube3dGrad)" strokeWidth="70" strokeLinecap="round" filter="url(#glow3d)"
            />

            {/* HIGHLIGHT TUBES (For 3D feeling) */}
            <path
              className="infinity-highlight"
              d="M500,250 C500,350 400,420 280,420 C130,420 80,320 80,250 C80,180 130,80 280,80 C400,80 500,150 500,250"
              fill="none" stroke="url(#tubeHighlight)" strokeWidth="70" strokeLinecap="round" opacity="0.4"
            />
            <path
              className="infinity-highlight"
              d="M500,250 C500,150 600,80 720,80 C870,80 920,180 920,250 C920,320 870,420 720,420 C600,420 500,350 500,250"
              fill="none" stroke="url(#tubeHighlight)" strokeWidth="70" strokeLinecap="round" opacity="0.4"
            />

            {/* 4. FAST TRACERS - Rapid data pulses */}
            <path
              d="M 500,250 C 500,350 400,420 280,420 C 130,420 80,320 80,250 C 80,180 130,80 280,80 C 400,80 500,150 500,250 C 500,350 600,420 720,420 C 870,420 920,320 920,250 C 920,180 870,80 720,80 C 600,80 500,150 500,250"
              fill="none"
              stroke="url(#tube3dGrad)"
              strokeWidth="3"
              className="infinity-tracer-fast"
              filter="url(#glow3d)"
            />
            <path
              d="M 500,250 C 500,350 400,420 280,420 C 130,420 80,320 80,250 C 80,180 130,80 280,80 C 400,80 500,150 500,250 C 500,350 600,420 720,420 C 870,420 920,320 920,250 C 920,180 870,80 720,80 C 600,80 500,150 500,250"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="infinity-tracer-white"
              strokeDasharray="20 980"
            />

            {/* CENTRAL ENGINE GLOW */}
            <circle cx="500" cy="250" r="15" fill="#81b532" className="engine-core-pulse">
              <animate attributeName="r" values="15;25;15" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Left Avatar - Person in Sajda (Prostration) */}
          <div className="infinity-avatar left-loop">
            <div className="avatar-orb cyan-orb"></div>
            <img
              src="https://png.pngtree.com/png-clipart/20220420/ourmid/pngtree-muslim-men-praying-cartoon-illustration-design-png-image_4550506.png"
              alt="Muslim in Sajda"
              className="avatar-face"
            />
            <span className="pill-label employees">Worship</span>
          </div>

          {/* Right Avatar - The Holy Kaaba */}
          <div className="infinity-avatar right-loop">
            <div className="avatar-orb purple-orb"></div>
            <img
              src="https://media.istockphoto.com/id/1406253881/vector/kaaba-and-word-allah.jpg?s=612x612&w=0&k=20&c=EAhx_aFC_BhaDhWO0S01KyoED9VzkRQwUdv_9KM7-DY="
              alt="Holy Kaaba"
              className="avatar-face"
            />
            <span className="pill-label customers">Qibla</span>
          </div>

          {/* Center IMAN text at crossing point */}
          <div className="infinity-label">
            <span className="ai-main">إيمان</span>
            <span className="ai-sub">IMAN</span>
          </div>

          {/* Nodes along the path - Three Pillars & Five Pillars of Islam */}
          <div className="path-node node-it"><span>إحسان Ihsan</span><div className="dot"></div></div>
          <div className="path-node node-crm"><span>إسلام Islam</span><div className="dot"></div></div>
          <div className="path-node node-hr"><span>Testify the Shahada</span><div className="dot"></div></div>
          <div className="path-node node-risk"><span>Establish Prayer</span><div className="dot"></div></div>
          <div className="path-node node-dev"><span>Pay Zakat</span><div className="dot"></div></div>
          <div className="path-node node-fin"><span>Fast Ramadan</span><div className="dot"></div></div>
          <div className="path-node node-extra"><span>Perform Hajj</span><div className="dot"></div></div>

          {/* Sparkles everywhere */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`sparkle-star s${i}`} style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              animationDelay: `${i * 0.4}s`
            }}>✦</div>
          ))}
        </div>


        {/* Any Cards with hover effects */}
        <div className="any-cards">
          {[
            { icon: '🤖', title: 'Any AI', desc: 'Connect AI from any source', color: 'cyan' },
            { icon: '📊', title: 'Any Data', desc: 'Unify your enterprise data', color: 'purple' },
            { icon: '⚡', title: 'Any Workflows', desc: 'Automate end-to-end', color: 'green' }
          ].map((card, i) => (
            <div key={card.title} className={`any-card animate-child hover-3d`} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className={`any-icon ${card.color} icon-bounce`}>{card.icon}</div>
              <h4>{card.title}</h4>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ===== TESTIMONIALS with parallax cards ===== */}
      <section className="testimonials-section reveal-section" ref={testimonialsRef}>
        <h2 className="section-title animate-child">
          When our community learns, <span className="green">the world works better</span>
        </h2>
        <div className="testimonial-cards">
          <div className="testimonial-card hover-lift-3d animate-child">
            <div className="testimonial-image">
              <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop" alt="Office" />
              <div className="image-overlay"></div>
            </div>
            <div className="testimonial-stat glass-stat">
              <span className="stat-value counter-animate">100%</span>
              <span className="stat-label">Authentic Quranic resources</span>
            </div>
          </div>
          <div className="testimonial-card hover-lift-3d animate-child">
            <div className="testimonial-image">
              <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop" alt="Team" />
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
        <h3 className="animate-child">Recognized results that transform lives</h3>
        <div className="stats-grid">
          {[
            { num: '#1', text: 'Spiritual Growth' },
            { num: '5X', text: 'Faster Memorization' },
            { num: '100+', text: 'Interactive Lessons' },
            { num: '1M+', text: 'Daily Recitations' }
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
          <h2 className="animate-child"><span className="green">Let&apos;s get</span> to learning</h2>
          <p className="animate-child">Explore all the ways Learn Quran can put AI to work for your spiritual journey.</p>
        </div>
        <div className="work-cards">
          {[
            { icon: '👤', title: 'Contact us', desc: 'Talk to an expert and see how our platform can meet your goals.' },
            { icon: '👥', title: 'Join the community', desc: 'Learn, share, and connect with people doing work that matters.' },
            { icon: '🤝', title: 'Find a teacher', desc: 'Realize even more value with a certified Quran tutor.' },
            { icon: '🎬', title: 'Explore modules', desc: 'Get hands-on with the Learn Quran AI Platform.' }
          ].map((card, i) => (
            <div key={card.title} className="work-card animate-child slide-in-right" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="work-icon bounce-hover">{card.icon}</div>
              <div className="work-info">
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
              </div>
              <div className="work-arrow magnetic-arrow">→</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
