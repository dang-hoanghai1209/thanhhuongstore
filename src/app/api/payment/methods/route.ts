import { NextResponse } from 'next/server';

import { isVNPayConfigured } from '@/lib/vnpay';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    methods: {
      cod: true,
      bankTransfer: true,
      vnpay: isVNPayConfigured(),
    },
  });
}
