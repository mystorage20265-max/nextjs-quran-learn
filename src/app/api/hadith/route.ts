import { NextResponse } from 'next/server';

// fawazahmed0 Hadith API hosted on jsDelivr CDN — completely free, no API key
const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

const VALID_COLLECTIONS = new Set(['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']);

const cache = new Map<string, { 
  metadata: any;
  hadiths: { number: number; english: string; arabic: string; chapter: string; sectionId: string }[] 
}>();

async function loadBook(book: string) {
  if (cache.has(book)) return cache.get(book)!;

  const [engRes, araRes] = await Promise.all([
    fetch(`${CDN}/eng-${book}.min.json`, { next: { revalidate: 86400 } }),
    fetch(`${CDN}/ara-${book}.min.json`, { next: { revalidate: 86400 } }),
  ]);

  if (!engRes.ok) throw new Error(`Failed to load English edition: ${engRes.status}`);

  const engData = await engRes.json();
  const araData = araRes.ok ? await araRes.json() : null;

  // Build Arabic lookup map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const araMap = new Map<number, string>();
  if (araData?.hadiths) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const h of araData.hadiths as any[]) {
      araMap.set(Number(h.hadithnumber), String(h.text ?? '').trim());
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merged = (engData.hadiths as any[]).map((h: any) => ({
    number:  Number(h.hadithnumber),
    english: String(h.text ?? '').trim(),
    arabic:  araMap.get(Number(h.hadithnumber)) ?? '',
    chapter: String(h.reference?.book ?? '').trim(),
    sectionId: String(h.reference?.book ?? '0'),
  })).filter(h => h.english.length > 0);

  const result = { metadata: engData.metadata, hadiths: merged };
  cache.set(book, result);
  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection') ?? 'bukhari';
  const page       = Math.max(1, Number(searchParams.get('page') ?? 1));
  const limit      = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)));
  const query      = searchParams.get('search')?.trim() ?? '';

  if (!VALID_COLLECTIONS.has(collection)) {
    return NextResponse.json({ error: 'Invalid collection name.' }, { status: 400 });
  }

  try {
    const { metadata, hadiths: allHadiths } = await loadBook(collection);
    let hadiths = allHadiths;

    const section = searchParams.get('section');
    if (section) {
      hadiths = hadiths.filter(h => h.sectionId === section);
    }

    // Search filter
    if (query) {
      const q = query.toLowerCase();
      hadiths = hadiths.filter(h =>
        h.english.toLowerCase().includes(q) ||
        h.arabic.includes(query) ||
        String(h.number) === query
      );
    }

    const total      = hadiths.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start      = (page - 1) * limit;
    const slice      = hadiths.slice(start, start + limit);

    return NextResponse.json({
      hadiths: slice.map(h => ({
        number:  String(h.number),
        english: h.english,
        arabic:  h.arabic,
        grade:   '',
        chapter: h.chapter ? (metadata.sections[h.chapter] || `Book ${h.chapter}`) : '',
      })),
      metadata: {
        name: metadata.name,
        sections: metadata.sections,
        section_details: metadata.section_details
      },
      total,
      page,
      limit,
      totalPages,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to load hadith collection: ${msg}` }, { status: 502 });
  }
}

