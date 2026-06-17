import { NextRequest } from 'next/server';

export const MAX_CHAT_CONTENT_LENGTH = 1000;
export const MAX_VISITOR_FIELD_LENGTH = 120;

export function sanitizeOptionalText(value: unknown, maxLength = MAX_VISITOR_FIELD_LENGTH) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : undefined;
}

export function parseMessageContent(value: unknown) {
  if (typeof value !== 'string') {
    return { error: 'Message content is required.' };
  }

  const content = value.trim();

  if (!content) {
    return { error: 'Message content cannot be empty.' };
  }

  if (content.length > MAX_CHAT_CONTENT_LENGTH) {
    return { error: `Message content must be ${MAX_CHAT_CONTENT_LENGTH} characters or fewer.` };
  }

  return { content };
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

