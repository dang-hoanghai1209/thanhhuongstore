import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { chatLimiter } from '@/lib/rateLimit';
import { getClientIp, sanitizeOptionalText } from '@/lib/chat/validation';

function createVisitorId() {
  return crypto.randomUUID();
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (await chatLimiter.check(ip)) {
    return NextResponse.json({ error: 'Too many chat requests. Please try again later.' }, { status: 429 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const visitorId = sanitizeOptionalText(body.visitorId, 80) ?? createVisitorId();
  const visitorName = sanitizeOptionalText(body.visitorName);
  const visitorPhone = sanitizeOptionalText(body.visitorPhone, 40);
  const visitorEmail = sanitizeOptionalText(body.visitorEmail, 160);

  const conversation = await prisma.chatConversation.findFirst({
    where: {
      visitorId,
      status: 'OPEN',
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  const savedConversation = conversation
    ? await prisma.chatConversation.update({
        where: { id: conversation.id },
        data: {
          ...(visitorName ? { visitorName } : {}),
          ...(visitorPhone ? { visitorPhone } : {}),
          ...(visitorEmail ? { visitorEmail } : {}),
        },
      })
    : await prisma.chatConversation.create({
        data: {
          visitorId,
          visitorName,
          visitorPhone,
          visitorEmail,
          status: 'OPEN',
        },
      });

  return NextResponse.json({
    conversationId: savedConversation.id,
    visitorId: savedConversation.visitorId,
    status: savedConversation.status,
  });
}

