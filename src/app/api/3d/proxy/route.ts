// Import the standard response utility.
import { NextResponse } from 'next/server';

// Handle GET requests to proxy external 3D model files (GLB, GLTF).
export async function GET(req: Request) {
  // Extract the target file URL from the search parameters.
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  // Ensure a valid URL was provided.
  if (!url) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    // Fetch the 3D model data from the external source (e.g., Tripo3D or AWS S3).
    const response = await fetch(url);
    
    // Handle cases where the external server rejects the request.
    if (!response.ok) {
       throw new Error(`Failed to fetch model: ${response.statusText}`);
    }

    // Capture the binary data (3D geometry and textures) as an ArrayBuffer.
    const data = await response.arrayBuffer();

    // Serve the binary data with appropriate headers to the frontend.
    return new NextResponse(data, {
      headers: {
        // Explicitly set the MIME type for 3D binary models.
        'Content-Type': 'model/gltf-binary', 
        // Force the browser to allow this request, effectively bypassing CORS restrictions.
        'Access-Control-Allow-Origin': '*', 
        // Cache the result for 24 hours to improve performance and reduce external API calls.
        'Cache-Control': 'public, max-age=86400', 
        // Forward metadata about the file name if provided by the source.
        ...(response.headers.get('content-disposition') && {
          'Content-Disposition': response.headers.get('content-disposition')!
        })
      },
    });

  } catch (error: any) {
    // Log unexpected errors and return a 500 status.
    console.error("Proxy error:", error);
    return NextResponse.json({ error: 'Failed to proxy model' }, { status: 500 });
  }
}

