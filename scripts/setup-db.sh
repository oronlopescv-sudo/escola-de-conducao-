#!/bin/bash
set -e

echo "🚀 Setting up database..."
echo "📋 Running prisma db push..."
npx prisma db push --skip-generate

echo "🌱 Running seed..."
npm run db:seed

echo "✅ Database setup complete!"
