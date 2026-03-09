import { NextRequest, NextResponse } from 'next/server';

const CDN_BASE = 'https://cdn.islamic.network/quran/images/high-resolution';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const cdnRes = await fetch(`${CDN_BASE}/${pageNum}.png`, {
      headers: { 'User-Agent': 'QuranicLearn/1.0' },
      // @ts-expect-error next-fetch signal
      signal: AbortSignal.timeout(10000),
    });

    if (!cdnRes.ok) {
      return new NextResponse('Page not found', { status: 404 });
    }

    const imageBuffer = await cdnRes.arrayBuffer();
    const contentType = cdnRes.headers.get('content-type') ?? 'image/png';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch page', { status: 502 });
  }
}
