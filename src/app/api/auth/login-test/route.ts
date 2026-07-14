import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    console.log('📍 Login test:', email, senha);

    // Hardcoded test
    if (email === 'admin@autoescola.cv' && senha === 'admin123') {
      return NextResponse.json({
        success: true,
        role: 'ADMIN',
        message: 'Login test successful'
      });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
