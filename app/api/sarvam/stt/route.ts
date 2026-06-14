import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Prepare form data for Sarvam API
    const sarvamFormData = new FormData();
    sarvamFormData.append('file', file);
    sarvamFormData.append('model', 'saaras:v3');
    sarvamFormData.append('mode', 'translate');

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': process.env.SARVAM_API_KEY || '',
      },
      body: sarvamFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam STT API error:', errorText);
      return NextResponse.json(
        { error: `Sarvam API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error processing STT:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
