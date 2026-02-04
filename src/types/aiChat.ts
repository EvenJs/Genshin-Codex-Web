export interface AiChatResponse {
  conversationId: string;
  response: string;
  aiGenerated: boolean;
  knowledgeUsed: boolean;
  generatedAt: string;
}

export type AiChatStreamEvent =
  | {
      type: 'meta';
      conversationId: string;
      aiGenerated: boolean;
      knowledgeUsed: boolean;
    }
  | { type: 'chunk'; content: string }
  | { type: 'done'; conversationId: string }
  | { type: 'error'; message: string };
