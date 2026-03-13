import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const action = formData.get('action') as string;
    const imageFile = formData.get('imageFile') as File;
    const apiKey = process.env.PHOTOROOM_API_KEY || 'test-key';

    if (!apiKey) {
      return NextResponse.json({ error: 'Photoroom API key not configured' }, { status: 500 });
    }

    if (!imageFile) {
        return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    if (action === 'remove-background') {
      const photoroomFormData = new FormData();
      photoroomFormData.append('image_file', imageFile);
      
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
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return NextResponse.json({ image: base64 });
      
    } else if (action === 'ai-backgrounds') {
      const prompt = formData.get('prompt') as string;
      const photoroomFormData = new FormData();
      photoroomFormData.append('imageFile', imageFile);
      photoroomFormData.append('background.prompt', prompt || 'auto');
      
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
      
    } else if (action === 'text-removal') {
      const textMode = formData.get('textMode') as string || 'ai.all';
      const photoroomFormData = new FormData();
      photoroomFormData.append('imageFile', imageFile);
      photoroomFormData.append('removeBackground', 'false');
      photoroomFormData.append('referenceBox', 'originalImage');
      photoroomFormData.append('textRemoval.mode', textMode);
      
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
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Enhance API error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
