import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { serializeConversation, serializeMessage } from '@/lib/chat/serializers';

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status')?.toUpperCase();
  const q = searchParams.get('q')?.trim();

  const where: any = {};

  if (status === 'OPEN' || status === 'CLOSED') {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { visitorName: { contains: q, mode: 'insensitive' } },
      { visitorPhone: { contains: q, mode: 'insensitive' } },
      { visitorEmail: { contains: q, mode: 'insensitive' } },
      {
        messages: {
          some: {
            content: { contains: q, mode: 'insensitive' },
          },
        },
      },
    ];
  }

  const conversations = await prisma.chatConversation.findMany({
    where,
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: {
              senderType: 'VISITOR',
              isReadByAdmin: false,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    conversations: conversations.map((conversation) => ({
      ...serializeConversation(conversation),
      lastMessage: conversation.messages[0] ? serializeMessage(conversation.messages[0]) : null,
      unreadCount: conversation._count.messages,
    })),
  });
}

