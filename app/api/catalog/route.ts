import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/data-source';

export async function GET() {
  return NextResponse.json(await getCatalog());
}
