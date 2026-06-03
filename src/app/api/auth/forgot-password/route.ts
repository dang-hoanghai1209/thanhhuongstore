import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { emailQueue } from '@/lib/queue';
import { forgotPasswordSchema } from '@/lib/validators';

function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const payload = forgotPasswordSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid forgot password request.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const email = payload.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, name: true, isActive: true },
    });

    if (user?.isActive) {
      const resetToken = randomBytes(32).toString('hex');

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: hashPasswordResetToken(resetToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await emailQueue.add('password-reset', {
        type: 'password-reset',
        data: {
          to: user.email,
          firstName: user.firstName ?? user.name ?? 'Customer',
          resetToken,
        },
      });
    }

    return NextResponse.json({
      message: 'If this email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password failed:', error);

    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to process request.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
