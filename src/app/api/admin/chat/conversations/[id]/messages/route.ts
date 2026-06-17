import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { serializeMessage } from '@/lib/chat/serializers';
import { parseMessageContent } from '@/lib/chat/validation';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
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

  const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const parsedContent = parseMessageContent(body.content);

  if ('error' in parsedContent) {
    return NextResponse.json({ error: parsedContent.error }, { status: 400 });
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  const message = await prisma.$transaction(async (tx) => {
    await tx.chatMessage.updateMany({
      where: {
        conversationId: params.id,
        senderType: 'VISITOR',
        isReadByAdmin: false,
      },
      data: { isReadByAdmin: true },
    });

    const createdMessage = await tx.chatMessage.create({
      data: {
        conversationId: params.id,
        senderType: 'ADMIN',
        senderName: authResult.email,
        content: parsedContent.content,
        isReadByAdmin: true,
        isReadByVisitor: false,
      },
    });

    await tx.chatConversation.update({
      where: { id: params.id },
      data: {
        status: 'OPEN',
        lastMessageAt: createdMessage.createdAt,
      },
    });

    return createdMessage;
  });

  return NextResponse.json({ message: serializeMessage(message) }, { status: 201 });
}

