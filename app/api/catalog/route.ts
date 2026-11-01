import { NextResponse } from 'next/server';
import catalogData from '@/data/catalog/catalog.json';

// Static export: route được chụp thành file lúc build
export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(catalogData);
}
