import { NextResponse } from 'next/server';

function notImplemented() {
  return NextResponse.json({ error: 'This API is not implemented yet' }, { status: 501 });
}

export const GET = notImplemented;
export const POST = notImplemented;
