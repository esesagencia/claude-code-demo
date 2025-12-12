// ABOUTME: Orchestrates streaming chat completion with reflexive mode support
// ABOUTME: Pure business logic coordinating AI provider and streaming (no tools in reflexive mode)

import { Conversation } from '../../domain/entities/Conversation';
import { Message } from '../../domain/entities/Message';
import { StreamingResponse, TokenUsage } from '../../domain/entities/StreamingResponse';
import { MessageRole } from '../../domain/value-objects/MessageRole';
import { MessageContent } from '../../domain/value-objects/MessageContent';
import { ConversationOrchestrator } from '../../domain/services/ConversationOrchestrator';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { IAIProvider, AICompletionRequest } from '../ports/outbound/IAIProvider';
import { IStreamAdapter, StreamData } from '../ports/outbound/IStreamAdapter';
import { ReflexivePromptService } from '../../infrastructure/adapters/ai/ReflexivePromptService';

export class StreamChatCompletionUseCase {
  private readonly orchestrator: ConversationOrchestrator;
  private readonly reflexivePromptService: ReflexivePromptService;

  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly streamAdapter: IStreamAdapter,
    private readonly conversationRepository: IConversationRepository
  ) {
    this.orchestrator = new ConversationOrchestrator();
    this.reflexivePromptService = new ReflexivePromptService();
  }

  async execute(
    conversationId: string,
    controller: ReadableStreamDefaultController
  ): Promise<void> {
    let streamingResponse: StreamingResponse | undefined;

    try {
      // Get conversation
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Check if conversation can continue
      if (conversation.isReflexiveMode() && !conversation.canContinue()) {
        throw new Error('Conversation has ended. Please start a new conversation.');
      }

      // Prepare for streaming
      const context = this.orchestrator.prepareForStreaming(conversation);
      streamingResponse = context.streamingResponse;
      if (!streamingResponse) {
        throw new Error('Failed to prepare streaming response');
      }
      streamingResponse.start();

      // Prepare AI request with reflexive prompt if needed
      const messages = [...conversation.getMessages()];

      // Determine system prompt based on conversation state
      let systemPrompt: string | undefined;
      let isClosingMessage = false;

      if (conversation.isReflexiveMode()) {
        if (conversation.shouldShowEndMessage()) {
          // This is the 13th message - use the closing prompt
          const conversationTopic = this.extractConversationTopic(messages);
          systemPrompt = this.reflexivePromptService.getClosingPrompt(conversationTopic);
          isClosingMessage = true;
        } else {
          // Normal reflexive prompt
          systemPrompt = this.reflexivePromptService.getSystemPrompt();
        }
      }

      const request: AICompletionRequest = {
        messages,
        model: 'gpt-4o',
        systemPrompt,
      };

      // Stream completion
      let accumulatedText = '';

      for await (const chunk of this.aiProvider.streamCompletion(request)) {
        switch (chunk.type) {
          case 'text':
            if (chunk.content) {
              accumulatedText += chunk.content;
              streamingResponse.addTextChunk(chunk.content);
              this.streamText(chunk.content, controller);
            }
            break;

          case 'usage':
            if (chunk.usage) {
              // Complete the streaming response
              streamingResponse.complete(chunk.usage, chunk.finishReason || 'stop');

              // Create assistant message
              const assistantMessage = Message.create(
                MessageRole.assistant(),
                MessageContent.from(accumulatedText || ''),
                []
              );

              // Add assistant message to conversation
              this.orchestrator.processAssistantMessage(
                conversation,
                assistantMessage,
                streamingResponse
              );

              // If this is a closing message, end the conversation
              if (isClosingMessage) {
                conversation.end();
              }

              // Save conversation with assistant message
              await this.conversationRepository.save(conversation);

              // Stream finish event with special flag for closing message
              if (isClosingMessage) {
                this.streamClosingFinish(chunk.usage, controller);
              } else {
                this.streamFinish(chunk.usage, controller);
              }
            }
            break;

          case 'error':
            if (chunk.error) {
              throw new Error(chunk.error);
            }
            break;
        }
      }
    } catch (error) {
      if (streamingResponse && streamingResponse.isStreaming()) {
        streamingResponse.fail(error as Error);
      }
      this.streamError(error as Error, controller);
      throw error;
    } finally {
      this.streamAdapter.close(controller);
    }
  }

  /**
   * Extracts the main topic of conversation from the message history
   * This is used to generate a contextual closing message
   */
  private extractConversationTopic(messages: Message[]): string | undefined {
    // Get the first user message as it usually contains the main topic
    const firstUserMessage = messages.find(
      (msg) => msg.getRole().getValue() === 'user'
    );

    if (!firstUserMessage) {
      return undefined;
    }

    const content = firstUserMessage.getContent().getValue();

    // Return a summary (first 100 chars for context)
    return content.substring(0, 150);
  }

  private streamText(content: string, controller: ReadableStreamDefaultController): void {
    const data: StreamData = {
      type: 'text',
      payload: content,
    };
    this.streamAdapter.write(controller, data);
  }

  private streamFinish(
    usage: TokenUsage,
    controller: ReadableStreamDefaultController
  ): void {
    const data: StreamData = {
      type: 'finish',
      payload: {
        finishReason: 'stop',
        usage,
        isContinued: false,
      },
    };
    this.streamAdapter.write(controller, data);
  }

  /**
   * Streams finish event for closing message with special metadata
   */
  private streamClosingFinish(
    usage: TokenUsage,
    controller: ReadableStreamDefaultController
  ): void {
    const data: StreamData = {
      type: 'finish',
      payload: {
        finishReason: 'reflexive_end',
        usage,
        isContinued: false,
        isReflexiveEnd: true,
      },
    };
    this.streamAdapter.write(controller, data);
  }

  private streamError(
    error: Error,
    controller: ReadableStreamDefaultController
  ): void {
    const data: StreamData = {
      type: 'error',
      payload: {
        error: error.message,
      },
    };
    this.streamAdapter.write(controller, data);
  }
}