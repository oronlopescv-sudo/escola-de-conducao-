import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Setup: Creating users...');

    // Admin user
    const adminHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@autoescola.cv' },
      update: {},
      create: {
        nome: 'Administrador',
        email: 'admin@autoescola.cv',
        senha: adminHash,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin created:', admin.email);

    // Student user
    const studentHash = await bcrypt.hash('aluno123', 10);
    const studentUser = await prisma.user.upsert({
      where: { email: 'aluno@autoescola.cv' },
      update: {},
      create: {
        nome: 'Aluno Demonstração',
        email: 'aluno@autoescola.cv',
        senha: studentHash,
        role: 'ALUNO',
      },
    });
    console.log('✅ Student created:', studentUser.email);

    // Student record
    await prisma.aluno.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: {
        userId: studentUser.id,
        categoria: 'B',
        telefone: '9XX XX XX',
      },
    });
    console.log('✅ Setup complete!');

    return NextResponse.json({
      success: true,
      message: 'Database setup completed!',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
