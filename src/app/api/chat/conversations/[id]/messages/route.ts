import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { chatLimiter } from '@/lib/rateLimit';
import { serializeMessage } from '@/lib/chat/serializers';
import {
  getClientIp,
  parseMessageContent,
  sanitizeOptionalText,
} from '@/lib/chat/validation';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  await prisma.chatMessage.updateMany({
    where: {
      conversationId: params.id,
      senderType: 'ADMIN',
      isReadByVisitor: false,
    },
    data: { isReadByVisitor: true },
  });

  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ messages: messages.map(serializeMessage) });
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const ip = getClientIp(request);

  if (await chatLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many chat requests. Please try again later.' }, { status: 429 });
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

  const visitorName = sanitizeOptionalText(body.visitorName);
  const visitorPhone = sanitizeOptionalText(body.visitorPhone, 40);
  const visitorEmail = sanitizeOptionalText(body.visitorEmail, 160);

  const conversation = await prisma.chatConversation.findUnique({
    where: { id: params.id },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  const message = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.chatMessage.create({
      data: {
        conversationId: params.id,
        senderType: 'VISITOR',
        senderName: visitorName,
        content: parsedContent.content,
        isReadByAdmin: false,
        isReadByVisitor: true,
      },
    });

    await tx.chatConversation.update({
      where: { id: params.id },
      data: {
        status: 'OPEN',
        lastMessageAt: createdMessage.createdAt,
        ...(visitorName ? { visitorName } : {}),
        ...(visitorPhone ? { visitorPhone } : {}),
        ...(visitorEmail ? { visitorEmail } : {}),
      },
    });

    return createdMessage;
  });

  return NextResponse.json({ message: serializeMessage(message) }, { status: 201 });
}

