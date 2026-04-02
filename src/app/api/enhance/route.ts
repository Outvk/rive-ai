// Import the standard Next.js response utility.
import { NextResponse } from 'next/server';

// Handle POST requests for image enhancement tasks like background removal and AI editing.
export async function POST(req: Request) {
  try {
    // Extract multi-part form data containing the image file and the requested action.
    const formData = await req.formData();
    const action = formData.get('action') as string;
    const imageFile = formData.get('imageFile') as File;
    
    // Retrieve the Photoroom API key (crucial for accessing the professional enhancement services).
    const apiKey = process.env.PHOTOROOM_API_KEY || 'test-key';

    if (!apiKey) {
      return NextResponse.json({ error: 'Photoroom API key not configured' }, { status: 500 });
    }

    // Ensure an image was actually uploaded.
    if (!imageFile) {
        return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Branch logic based on the requested 'action'.
    
    // Action: Background Removal (Segmenting the primary object from its background).
    if (action === 'remove-background') {
      const photoroomFormData = new FormData();
      photoroomFormData.append('image_file', imageFile);
      
      // Call the segmenting API endpoint.
      const res = await fetch('https://sdk.photoroom.com/v1/segment', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: photoroomFormData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      
      // Convert the binary result (transparency-preserved image) into a base64 string for the UI.
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({ image: base64 });
      
    } 
    // Action: Generative AI Backgrounds (Replacing the background based on a prompt).
    else if (action === 'ai-backgrounds') {
      const prompt = formData.get('prompt') as string;
      const photoroomFormData = new FormData();
      photoroomFormData.append('imageFile', imageFile);
      photoroomFormData.append('background.prompt', prompt || 'auto');
      
      // Call the generative edit API endpoint.
      const res = await fetch('https://image-api.photoroom.com/v2/edit', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: photoroomFormData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({ image: base64 });
      
    } 
    // Action: Text Removal (Using AI to erase text overlays from an image while filling in the gaps).
    else if (action === 'text-removal') {
      const textMode = formData.get('textMode') as string || 'ai.all';
      const photoroomFormData = new FormData();
      photoroomFormData.append('imageFile', imageFile);
      photoroomFormData.append('removeBackground', 'false');
      photoroomFormData.append('referenceBox', 'originalImage');
      photoroomFormData.append('textRemoval.mode', textMode);
      
      // Call the generative text-removal API.
      const res = await fetch('https://image-api.photoroom.com/v2/edit', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: photoroomFormData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({ image: base64 });
    } else {
      // Return error if an unsupported enhancement type is requested.
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    // Global error handler for API communication or file processing issues.
    console.error('Enhance API error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

