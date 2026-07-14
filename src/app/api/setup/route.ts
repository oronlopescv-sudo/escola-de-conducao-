import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Demo accounts are ready',
    accounts: [
      { email: 'admin@autoescola.cv', senha: 'admin123', role: 'ADMIN' },
      { email: 'aluno@autoescola.cv', senha: 'aluno123', role: 'ALUNO' }
    ]
  });
}
