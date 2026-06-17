import { ChatConversation, ChatMessage } from '@prisma/client';

type ConversationWithMessages = ChatConversation & {
  messages: ChatMessage[];
};

export function serializeMessage(message: ChatMessage) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderType: message.senderType,
    senderName: message.senderName,
    content: message.content,
    isReadByAdmin: message.isReadByAdmin,
    isReadByVisitor: message.isReadByVisitor,
    createdAt: message.createdAt.toISOString(),
  };
}

export function serializeConversation(conversation: ChatConversation) {
  return {
    id: conversation.id,
    visitorId: conversation.visitorId,
    visitorName: conversation.visitorName,
    visitorPhone: conversation.visitorPhone,
    visitorEmail: conversation.visitorEmail,
    status: conversation.status,
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export function serializeConversationDetail(conversation: ConversationWithMessages) {
  return {
    ...serializeConversation(conversation),
    messages: conversation.messages.map(serializeMessage),
  };
}

