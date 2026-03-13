import { useState, useCallback, useEffect } from 'react';

export function useLikedTracks() {
  const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('qp-liked');
        if (stored) {
          setLikedTracks(new Set(JSON.parse(stored)));
        }
      } catch (err) {
        console.error('Failed to load liked tracks', err);
      }
    }
  }, []);

  const isLiked = useCallback((id: number) => likedTracks.has(id), [likedTracks]);

  const toggleLike = useCallback((id: number) => {
    setLikedTracks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem('qp-liked', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  return { likedTracks, isLiked, toggleLike };
}
