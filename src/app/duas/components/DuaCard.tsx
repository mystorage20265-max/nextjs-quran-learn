'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookmarkIcon, Share2, Sparkles } from 'lucide-react';
import type { Dua } from '../data';
import styles from './DuaCard.module.css';

interface DuaCardProps {
  dua: Dua;
  isBookmarked?: boolean;
  onBookmark?: () => void;
}

export default function DuaCard({ dua, isBookmarked, onBookmark }: DuaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: dua.name,
      text: `${dua.arabic}\n\n${dua.translation}\n\nReference: ${dua.reference}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`);
    }
  };

  return (
    <div className={styles.duaCard}>
      {/* Category Badge */}
      <div className={styles.categoryBadge}>
        <Sparkles size={12} />
        <span>{dua.category}</span>
      </div>

      {/* Header */}
      <div className={styles.duaHeader}>
        <h2 className={styles.duaName}>{dua.name}</h2>
      </div>

      {/* Arabic Text */}
      <div className={styles.duaArabic} dir="rtl">
        {dua.arabic}
      </div>

      {/* Transliteration */}
      <div className={styles.duaSection}>
        <span className={styles.sectionLabel}>Transliteration</span>
        <p className={styles.sectionText}>{dua.transliteration}</p>
      </div>

      {/* Translation */}
      <div className={styles.duaSection}>
        <span className={styles.sectionLabel}>Translation</span>
        <p className={styles.sectionText}>{dua.translation}</p>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={styles.expandedContent}>
          {dua.benefits && dua.benefits.length > 0 && (
            <div className={styles.benefitsSection}>
              <h3 className={styles.subsectionTitle}>Benefits</h3>
              <ul className={styles.benefitsList}>
                {dua.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {dua.occasions && dua.occasions.length > 0 && (
            <div className={styles.occasionsSection}>
              <h3 className={styles.subsectionTitle}>When to Recite</h3>
              <ul className={styles.occasionsList}>
                {dua.occasions.map((occasion, index) => (
                  <li key={index}>{occasion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.duaFooter}>
        <div className={styles.duaReference}>
          <span>Reference:</span> {dua.reference}
        </div>

        <div className={styles.cardActions}>
          {/* Bookmark Button */}
          <button
            onClick={onBookmark}
            className={`${styles.actionButton} ${isBookmarked ? styles.bookmarked : ''}`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <BookmarkIcon size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className={styles.actionButton}
            aria-label="Share dua"
            title="Share dua"
          >
            <Share2 size={16} />
          </button>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.expandButton}
            aria-label={isExpanded ? 'Show less' : 'Show more'}
          >
            <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}