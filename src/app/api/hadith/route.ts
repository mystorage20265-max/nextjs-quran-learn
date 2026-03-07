import { NextResponse } from 'next/server';

const SUNNAH_BASE = 'https://api.sunnah.com/v1';

// Our collection IDs match sunnah.com names exactly
const VALID_COLLECTIONS = new Set(['nawawi40', 'bukhari', 'muslim', 'abudawud', 'tirmidhi', 'ibnmajah']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection') ?? 'nawawi40';
  const page       = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit      = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)));
  const query      = searchParams.get('search') ?? '';

  const apiKey = process.env.SUNNAH_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'SUNNAH_API_KEY is not configured. Add it to .env.local.' },
      { status: 503 }
    );
  }

  if (!VALID_COLLECTIONS.has(collection)) {
    return NextResponse.json({ error: 'Invalid collection name.' }, { status: 400 });
  }

  const headers: Record<string, string> = { 'X-API-Key': apiKey };

  try {
    let url: string;
    if (query.trim()) {
      url = `${SUNNAH_BASE}/search?q=${encodeURIComponent(query)}&collection=${collection}&limit=${limit}&page=${page}`;
    } else {
      url = `${SUNNAH_BASE}/collections/${collection}/hadiths?limit=${limit}&page=${page}`;
    }

    const res = await fetch(url, { headers, next: { revalidate: 3600 } });

    if (res.status === 401) {
      return NextResponse.json({ error: 'Invalid API key. Check your SUNNAH_API_KEY.' }, { status: 401 });
    }
    if (res.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: `Sunnah API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hadiths = (data.data ?? []).map((h: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const en = h.hadith?.find((x: any) => x.lang === 'en');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ar = h.hadith?.find((x: any) => x.lang === 'ar');
      const grade: string = en?.grades?.[0]?.grade ?? '';
      return {
        number:  String(h.hadithNumber ?? ''),
        english: String(en?.body ?? '').trim(),
        arabic:  String(ar?.body ?? '').trim(),
        grade,
        chapter: String(en?.chapterTitle ?? '').trim(),
        urn:     en?.urn,
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).filter((h: any) => h.english.length > 0);

    const total      = data.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({ hadiths, total, page, limit, totalPages });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to fetch: ${msg}` }, { status: 502 });
  }
}
