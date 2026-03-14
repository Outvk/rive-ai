import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
       throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    const data = await response.arrayBuffer();

    return new NextResponse(data, {
      headers: {
        'Content-Type': 'model/gltf-binary', // GLB MIME type
        'Access-Control-Allow-Origin': '*', // Crucial to fix CORS
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        // Forward the content disposition if it exists (for downloads)
        ...(response.headers.get('content-disposition') && {
          'Content-Disposition': response.headers.get('content-disposition')!
        })
      },
    });

  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: 'Failed to proxy model' }, { status: 500 });
  }
}
