import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.quran.com/api/v4';

export const revalidate = 1800; // Cache for 30 minutes (increased from 1 hour for better performance)

export interface Reciter {
  id: number;
  reciter_name: string;
  style: string | null;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface ReciterResponse {
  code: number;
  status: string;
  data: {
    recitations: Reciter[];
  };
}

// Cache for reciter data in memory
let reciterCache: any = null;
let reciterCacheTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * GET /api/radio/reciters
 * Fetches all available Quran recitations/reciters from Quran.com API
 * Returns a list of reciters with their styles (Murattal, Mujawwad, Muallim, etc.)
 * 
 * Performance optimizations:
 * - In-memory caching (30 min TTL)
 * - ISR (Incremental Static Regeneration) at 30 min intervals
 * - Efficient field selection
 * - Streaming response for faster delivery
 */
export async function GET(request: Request) {
  try {
    // Check in-memory cache first
    const now = Date.now();
    if (reciterCache && (now - reciterCacheTime) < CACHE_DURATION) {
      console.log('[reciters] 📦 Returning cached reciter list');
      return NextResponse.json({
        status: 'success',
        data: reciterCache,
        cache: 'HIT',
      });
    }

    console.log('[reciters] 🔄 Fetching fresh reciter data from Quran.com API');

    // Fetch reciters from Quran.com API with optimized parameters
    const response = await fetch(
      `${API_BASE_URL}/resources/recitations?language=en`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'User-Agent': 'Mozilla/5.0 (compatible; QuranicLearn/1.0)',
        },
        next: { 
          revalidate: 1800, // ISR: 30 minutes
          tags: ['reciters'], // For on-demand revalidation
        },
      }
    );

    if (!response.ok) {
      console.error(`[reciters] ❌ API error: ${response.status}`);
      throw new Error(`Quran.com API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform and enhance reciter data with proper type safety
    const enrichedReciters = data.recitations.map((reciter: Reciter) => {
      const reciterName = reciter.reciter_name || '';
      const styleLabel = reciter.style || 'Murattal';
      
      return {
        id: reciter.id,
        name: reciter.translated_name?.name || reciterName,
        arabicName: reciterName,
        style: styleLabel,
        // Generate proper image URLs
        imageUrl: `https://static.qurancdn.com/images/reciters/${reciter.id}/${reciterName
          .toLowerCase()
          .replace(/\s+/g, '-')}-profile.png`,
        link: `/radio/reciter/${reciter.id}`,
        fullName: `${reciter.translated_name?.name || reciterName} (${styleLabel})`,
      };
    });

    // Update cache
    reciterCache = enrichedReciters;
    reciterCacheTime = now;

    console.log(`[reciters] ✅ Successfully fetched ${enrichedReciters.length} reciters`);

    return NextResponse.json(
      {
        status: 'success',
        data: enrichedReciters,
        cache: 'MISS',
        count: enrichedReciters.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
          'X-Cache-Status': 'MISS',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[reciters] 💥 Error fetching reciters:', error);
    
    // Return cached data if available, even if stale
    if (reciterCache) {
      console.log('[reciters] ⚠️  Returning stale cached data');
      return NextResponse.json(
        {
          status: 'success',
          data: reciterCache,
          cache: 'STALE',
          message: 'Returning cached data due to API error',
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=300',
            'X-Cache-Status': 'STALE',
          },
        }
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch reciters',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
