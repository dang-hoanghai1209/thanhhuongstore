import bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validators';

function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const payload = resetPasswordSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        { error: 'Invalid reset password request.', details: payload.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const resetToken = await prisma.passwordReset.findUnique({
      where: { token: hashPasswordResetToken(payload.data.token) },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Password reset token is invalid or expired.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(payload.data.password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return NextResponse.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password failed:', error);

    return NextResponse.json(
      { error: error instanceof SyntaxError ? 'Invalid JSON payload.' : 'Unable to reset password.' },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
