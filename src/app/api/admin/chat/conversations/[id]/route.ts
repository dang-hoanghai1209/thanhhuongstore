import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { serializeConversationDetail } from '@/lib/chat/serializers';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { id: params.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  return NextResponse.json({ conversation: serializeConversationDetail(conversation) });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const status = payload && typeof payload === 'object'
    ? (payload as Record<string, unknown>).status
    : undefined;

  if (status !== 'OPEN' && status !== 'CLOSED') {
    return NextResponse.json({ error: 'status must be OPEN or CLOSED.' }, { status: 400 });
  }

  const conversation = await prisma.chatConversation.update({
    where: { id: params.id },
    data: { status },
  }).catch(() => null);

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  return NextResponse.json({ conversation: serializeConversationDetail({ ...conversation, messages: [] }) });
}

