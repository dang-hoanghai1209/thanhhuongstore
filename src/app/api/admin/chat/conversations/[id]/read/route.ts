import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const authResult = await requireAdmin(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  }

  const result = await prisma.chatMessage.updateMany({
    where: {
      conversationId: params.id,
      senderType: 'VISITOR',
      isReadByAdmin: false,
    },
    data: { isReadByAdmin: true },
  });

  return NextResponse.json({ updatedCount: result.count });
}

