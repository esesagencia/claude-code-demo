// ABOUTME: Aggregate root representing a conversation with messages and business rules
// ABOUTME: Enforces message ordering, conversation lifecycle, and invariants

import { Message } from './Message';
import { ConversationError } from '../exceptions/ConversationError';
import { InvalidMessageError } from '../exceptions/InvalidMessageError';
import { randomUUID } from 'crypto';

export enum ConversationStatus {
  ACTIVE = 'active',
  WAITING_FOR_RESPONSE = 'waiting_for_response',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export type ConversationMode = 'standard' | 'reflexive';

export class Conversation {
  private readonly id: string;
  private messages: Message[];
  private status: ConversationStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private title?: string;
  private readonly metadata: Map<string, unknown>;
  private readonly maxMessages: number = 1000; // Domain rule: limit conversation size
  private readonly mode: ConversationMode; // Mode: standard (with tools) or reflexive (only questions)
  private readonly maxMessagesBeforeEnd: number; // For reflexive mode: limit before showing end message
  private hasEnded: boolean = false; // For reflexive mode: marks if conversation has ended

  private constructor(
    id: string,
    messages: Message[] = [],
    mode: ConversationMode = 'reflexive',
    maxMessagesBeforeEnd: number = 13
  ) {
    this.id = id;
    this.messages = [...messages]; // Defensive copy
    this.status = ConversationStatus.ACTIVE;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.metadata = new Map();
    this.mode = mode;
    this.maxMessagesBeforeEnd = maxMessagesBeforeEnd;
  }

  static create(id?: string, mode: ConversationMode = 'reflexive', maxMessagesBeforeEnd: number = 13): Conversation {
    const conversationId = id || randomUUID();
    return new Conversation(conversationId, [], mode, maxMessagesBeforeEnd);
  }

  static restore(
    id: string,
    messages: Message[],
    status: ConversationStatus,
    createdAt: Date,
    updatedAt: Date,
    title?: string,
    mode: ConversationMode = 'reflexive',
    maxMessagesBeforeEnd: number = 13,
    hasEnded: boolean = false
  ): Conversation {
    const conversation = new Conversation(id, messages, mode, maxMessagesBeforeEnd);
    conversation.status = status;
    conversation.hasEnded = hasEnded;
    Object.assign(conversation, { createdAt, updatedAt, title });
    return conversation;
  }

  addMessage(message: Message): void {
    this.validateCanAddMessage(message);

    this.messages.push(message);
    this.updatedAt = new Date();

    // Update conversation status based on message role
    if (message.getRole().isUser()) {
      this.status = ConversationStatus.WAITING_FOR_RESPONSE;
    } else if (message.getRole().isAssistant()) {
      this.status = ConversationStatus.ACTIVE;
    }

    // Auto-generate title from first user message if not set
    if (!this.title && message.getRole().isUser() && this.messages.length === 1) {
      this.generateTitle(message);
    }
  }

  private validateCanAddMessage(message: Message): void {
    // Check conversation limits
    if (this.messages.length >= this.maxMessages) {
      throw new ConversationError(
        `Conversation has reached maximum message limit of ${this.maxMessages}`,
        this.id
      );
    }

    // Check if reflexive conversation has ended
    if (this.mode === 'reflexive' && this.hasEnded) {
      throw new ConversationError('Cannot add messages to ended reflexive conversation', this.id);
    }

    // Check if conversation is in a valid state
    if (this.status === ConversationStatus.ARCHIVED) {
      throw new ConversationError('Cannot add messages to archived conversation', this.id);
    }

    if (this.status === ConversationStatus.COMPLETED) {
      throw new ConversationError('Cannot add messages to completed conversation', this.id);
    }

    // Check message ordering rules
    const lastMessage = this.getLastMessage();
    if (lastMessage && !message.isValidAfter(lastMessage)) {
      throw new InvalidMessageError(
        `Invalid message sequence: ${message.getRole().getValue()} cannot follow ${lastMessage
          .getRole()
          .getValue()}`
      );
    }

    // Allow tool messages when there are pending tool invocations
    // Tool messages are the resolution of pending tool invocations
    if (this.hasPendingToolInvocations() && !message.getRole().isTool() && !message.getRole().isAssistant()) {
      throw new ConversationError(
        'Cannot add non-tool message while tool invocations are pending',
        this.id
      );
    }
  }

  private generateTitle(firstUserMessage: Message): void {
    const content = firstUserMessage.getContent().getValue();
    // Take first 50 characters or until first newline
    const maxLength = 50;
    const firstLine = content.split('\n')[0];
    this.title = firstLine.length > maxLength
      ? firstLine.substring(0, maxLength) + '...'
      : firstLine;
  }

  markAsCompleted(): void {
    if (this.status === ConversationStatus.ARCHIVED) {
      throw new ConversationError('Cannot complete an archived conversation', this.id);
    }
    this.status = ConversationStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  archive(): void {
    if (this.status === ConversationStatus.ARCHIVED) {
      throw new ConversationError('Conversation is already archived', this.id);
    }
    this.status = ConversationStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  reactivate(): void {
    if (this.status !== ConversationStatus.ARCHIVED) {
      throw new ConversationError('Can only reactivate archived conversations', this.id);
    }
    this.status = ConversationStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  hasPendingToolInvocations(): boolean {
    const lastAssistantMessage = this.getLastAssistantMessage();
    if (!lastAssistantMessage) return false;

    // If no tool invocations in the last assistant message, nothing is pending
    if (!lastAssistantMessage.hasToolInvocations()) return false;

    // Check if there are tool result messages after this assistant message
    const assistantIndex = this.messages.lastIndexOf(lastAssistantMessage);
    const toolCallIds = lastAssistantMessage.getToolInvocations().map(t => t.getCallId());

    // Count tool result messages for this assistant's tool calls
    let resolvedToolCalls = 0;
    for (let i = assistantIndex + 1; i < this.messages.length; i++) {
      const message = this.messages[i];
      if (message.getRole().isTool()) {
        const toolCallId = message.getMetadata('tool_call_id') as string;
        if (toolCallIds.includes(toolCallId)) {
          resolvedToolCalls++;
        }
      }
    }

    // If we have tool result messages for all tool calls, nothing is pending
    return resolvedToolCalls < toolCallIds.length;
  }

  getLastMessage(): Message | null {
    return this.messages[this.messages.length - 1] || null;
  }

  getLastUserMessage(): Message | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].getRole().isUser()) {
        return this.messages[i];
      }
    }
    return null;
  }

  getLastAssistantMessage(): Message | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].getRole().isAssistant()) {
        return this.messages[i];
      }
    }
    return null;
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  getUserMessageCount(): number {
    return this.messages.filter(m => m.getRole().isUser()).length;
  }

  getAssistantMessageCount(): number {
    return this.messages.filter(m => m.getRole().isAssistant()).length;
  }

  setTitle(title: string): void {
    if (!title || typeof title !== 'string') {
      throw new ConversationError('Title must be a non-empty string', this.id);
    }
    this.title = title;
    this.updatedAt = new Date();
  }

  addMetadata(key: string, value: unknown): void {
    this.metadata.set(key, value);
    this.updatedAt = new Date();
  }

  getMetadata(key: string): unknown | undefined {
    return this.metadata.get(key);
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getMessages(): readonly Message[] {
    return [...this.messages];
  }

  getStatus(): ConversationStatus {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getTitle(): string | undefined {
    return this.title;
  }

  isActive(): boolean {
    return this.status === ConversationStatus.ACTIVE;
  }

  isWaitingForResponse(): boolean {
    return this.status === ConversationStatus.WAITING_FOR_RESPONSE;
  }

  isCompleted(): boolean {
    return this.status === ConversationStatus.COMPLETED;
  }

  isArchived(): boolean {
    return this.status === ConversationStatus.ARCHIVED;
  }

  // Reflexive mode methods
  getMode(): ConversationMode {
    return this.mode;
  }

  isReflexiveMode(): boolean {
    return this.mode === 'reflexive';
  }

  isStandardMode(): boolean {
    return this.mode === 'standard';
  }

  getMaxMessagesBeforeEnd(): number {
    return this.maxMessagesBeforeEnd;
  }

  hasReachedLimit(): boolean {
    if (this.mode !== 'reflexive') return false;
    return this.getUserMessageCount() >= this.maxMessagesBeforeEnd;
  }

  shouldShowEndMessage(): boolean {
    if (this.mode !== 'reflexive') return false;
    return this.getUserMessageCount() === this.maxMessagesBeforeEnd && !this.hasEnded;
  }

  end(): void {
    if (this.mode !== 'reflexive') {
      throw new ConversationError('Can only end reflexive conversations', this.id);
    }
    if (!this.hasReachedLimit()) {
      throw new ConversationError(
        `Cannot end conversation before reaching limit of ${this.maxMessagesBeforeEnd} messages`,
        this.id
      );
    }
    this.hasEnded = true;
    this.status = ConversationStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  canContinue(): boolean {
    if (this.mode !== 'reflexive') return true;
    return !this.hasEnded && !this.hasReachedLimit();
  }

  getHasEnded(): boolean {
    return this.hasEnded;
  }

  toObject(): {
    id: string;
    messages: Array<any>;
    status: ConversationStatus;
    title?: string;
    messageCount: number;
    userMessageCount: number;
    mode: ConversationMode;
    maxMessagesBeforeEnd: number;
    hasEnded: boolean;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      id: this.id,
      messages: this.messages.map(m => m.toObject()),
      status: this.status,
      title: this.title,
      messageCount: this.messages.length,
      userMessageCount: this.getUserMessageCount(),
      mode: this.mode,
      maxMessagesBeforeEnd: this.maxMessagesBeforeEnd,
      hasEnded: this.hasEnded,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}