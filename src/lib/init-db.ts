/**
 * Auto-initializes database on first startup
 * Runs prisma db push + seed if needed
 */

import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;

  try {
    console.log('🔍 Checking if database needs initialization...');

    // Try to query users table to see if DB is initialized
    const users = await prisma.user.count();
    console.log(`✅ Database is initialized (${users} users found)`);
    initialized = true;
  } catch (error) {
    console.log('⚠️ Database not initialized, running setup...');

    try {
      console.log('📋 Running: npx prisma db push...');
      await execAsync('npx prisma db push --skip-generate');
      console.log('✅ Tables created!');

      console.log('🌱 Running: npm run db:seed...');
      await execAsync('npm run db:seed');
      console.log('✅ Database seeded!');

      initialized = true;
    } catch (setupError) {
      console.error('❌ Database initialization failed:', setupError);
    }
  }
}
