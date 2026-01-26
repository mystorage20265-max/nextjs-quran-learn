'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, BookmarkIcon, Sparkles } from 'lucide-react';
import { duas } from './data';
import type { Dua } from './data';
import DuaCard from './components/DuaCard';
import styles from './page.module.css';

export default function DuasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cardsRef = useRef<HTMLDivElement>(null);

  // Get unique categories
  const categories = Array.from(new Set(duas.map(dua => dua.category)));

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('duas-bookmarks');
    if (saved) {
      setBookmarkedIds(JSON.parse(saved));
    }
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('duas-bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = document.querySelectorAll(`.${styles.duaCardWrapper}`);
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [searchQuery, selectedCategory, showBookmarksOnly]);

  // Filter duas
  const filteredDuas = duas.filter(dua => {
    const matchesSearch = searchQuery === '' ||
      dua.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.arabic.includes(searchQuery) ||
      dua.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || dua.category === selectedCategory;
    const matchesBookmark = !showBookmarksOnly || bookmarkedIds.includes(dua.id);

    return matchesSearch && matchesCategory && matchesBookmark;
  });

  // Toggle bookmark
  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Particle Background */}
      <div className={styles.particlesBg}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* Floating Orbs */}
      <div
        className={styles.floatingOrb1}
        style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
      />
      <div
        className={styles.floatingOrb2}
        style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
      />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>
            <Sparkles size={48} className={styles.sparkleIcon} />
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleGreen}>Essential Duas</span>
            <span className={styles.titleWhite}>for every moment</span>
          </h1>
          <p className={styles.heroDescription}>
            Discover authentic supplications from the Quran and Sunnah to strengthen your connection with Allah
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.contentContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {/* Search */}
          <div className={styles.searchSection}>
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search duas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Bookmarks Toggle */}
          <div className={styles.bookmarkSection}>
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`${styles.bookmarkToggle} ${showBookmarksOnly ? styles.active : ''}`}
            >
              <BookmarkIcon size={16} />
              <span>My Bookmarks ({bookmarkedIds.length})</span>
            </button>
          </div>

          {/* Category Filters */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Categories</h3>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`${styles.categoryButton} ${selectedCategory === null ? styles.active : ''}`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        {/* Duas Grid */}
        <main className={styles.mainContent}>
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {filteredDuas.length} {filteredDuas.length === 1 ? 'dua' : 'duas'} found
            </p>
          </div>

          {filteredDuas.length === 0 ? (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🤲</div>
              <h3>No duas found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={styles.duasGrid} ref={cardsRef}>
              {filteredDuas.map((dua, index) => (
                <div
                  key={dua.id}
                  className={styles.duaCardWrapper}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <DuaCard
                    dua={dua}
                    isBookmarked={bookmarkedIds.includes(dua.id)}
                    onBookmark={() => toggleBookmark(dua.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}