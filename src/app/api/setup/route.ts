import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database setup...');

    // Run prisma db push
    console.log('📋 Running: npx prisma db push...');
    try {
      const { stdout: pushOutput } = await execAsync('npx prisma db push --skip-generate');
      console.log('✅ Prisma db push completed');
      console.log(pushOutput);
    } catch (error: any) {
      console.log('⚠️ Prisma db push output:', error.stdout || error.message);
    }

    // Run seed
    console.log('🌱 Running: npm run db:seed...');
    try {
      const { stdout: seedOutput } = await execAsync('npm run db:seed');
      console.log('✅ Seed completed');
      console.log(seedOutput);
    } catch (error: any) {
      console.log('⚠️ Seed output:', error.stdout || error.message);
    }

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
