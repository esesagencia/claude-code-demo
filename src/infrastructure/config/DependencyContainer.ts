// ABOUTME: Dependency injection container for wiring up the hexagonal architecture (reflexive mode)
// ABOUTME: Creates and manages all adapters, use cases, and services (no tools for reflexive mode)

import { IAIProvider } from '../../application/ports/outbound/IAIProvider';
import { IStreamAdapter } from '../../application/ports/outbound/IStreamAdapter';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';

import { StreamChatCompletionUseCase } from '../../application/use-cases/StreamChatCompletionUseCase';
import { SendMessageUseCase } from '../../application/use-cases/SendMessageUseCase';
import { ManageConversationUseCase } from '../../application/use-cases/ManageConversationUseCase';

import { OpenAIAdapter } from '../adapters/ai/OpenAIAdapter';
import { VercelStreamAdapter } from '../adapters/streaming/VercelStreamAdapter';
import { InMemoryConversationRepository } from '../repositories/InMemoryConversationRepository';
import { MongoDBClient } from '../adapters/database/MongoDBClient';
import { MongoDBConversationRepository } from '../adapters/database/MongoDBConversationRepository';

export interface ContainerConfig {
  openaiApiKey?: string;
  repositoryType?: 'mongodb' | 'inmemory';
  mongodbUrl?: string;
  databaseName?: string;
  enableLogging?: boolean;
}

export class DependencyContainer {
  private static instance: DependencyContainer | null = null;

  // Ports
  private aiProvider!: IAIProvider;
  private streamAdapter!: IStreamAdapter;
  private conversationRepository!: IConversationRepository;

  // Use Cases
  private streamChatCompletionUseCase!: StreamChatCompletionUseCase;
  private sendMessageUseCase!: SendMessageUseCase;
  private manageConversationUseCase!: ManageConversationUseCase;

  private constructor(private config: ContainerConfig) {
    // Initialization is now async, done via initialize()
  }

  /**
   * Creates and initializes the container instance
   */
  static async create(config?: ContainerConfig): Promise<DependencyContainer> {
    if (!DependencyContainer.instance) {
      if (!config) {
        throw new Error('Configuration required for first initialization');
      }
      DependencyContainer.instance = new DependencyContainer(config);
      await DependencyContainer.instance.initialize();
    }
    return DependencyContainer.instance;
  }

  /**
   * Initializes adapters and use cases (async)
   */
  private async initialize(): Promise<void> {
    await this.initializeAdapters();
    this.initializeUseCases();
  }

  /**
   * Resets the container instance (useful for testing)
   */
  static reset(): void {
    DependencyContainer.instance = null;
  }

  /**
   * Initializes all infrastructure adapters
   */
  private async initializeAdapters(): Promise<void> {
    // Get API key from config or environment
    const apiKey = this.config.openaiApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Initialize AI provider
    this.aiProvider = new OpenAIAdapter(apiKey);

    // Initialize streaming adapter
    this.streamAdapter = new VercelStreamAdapter();

    // Initialize repository with fallback strategy
    await this.initializeRepository();

    if (this.config.enableLogging) {
      console.log('Infrastructure adapters initialized (reflexive mode - no tools)');
    }
  }

  /**
   * Initializes conversation repository with fallback to in-memory
   */
  private async initializeRepository(): Promise<void> {
    const repositoryType = this.config.repositoryType || process.env.REPOSITORY_TYPE || 'inmemory';

    if (repositoryType === 'mongodb') {
      try {
        const mongodbUrl = this.config.mongodbUrl || process.env.MONGODB_URL;
        const databaseName = this.config.databaseName || process.env.DATABASE_NAME || 'ai_chat_app';

        if (!mongodbUrl) {
          throw new Error('MONGODB_URL not configured');
        }

        console.log('[DependencyContainer] Initializing MongoDB repository...');
        const mongoClient = MongoDBClient.getInstance(mongodbUrl, databaseName);
        await mongoClient.connect();

        const db = mongoClient.getDatabase();
        const repository = new MongoDBConversationRepository(db);
        await repository.initialize();

        this.conversationRepository = repository;
        console.log('[DependencyContainer] MongoDB repository initialized successfully');
      } catch (error) {
        console.error('[DependencyContainer] Failed to initialize MongoDB repository:', error);
        console.warn('[DependencyContainer] Falling back to InMemory repository');
        this.conversationRepository = new InMemoryConversationRepository();
      }
    } else {
      console.log('[DependencyContainer] Using InMemory repository');
      this.conversationRepository = new InMemoryConversationRepository();
    }
  }

  /**
   * Initializes all use cases
   */
  private initializeUseCases(): void {
    this.streamChatCompletionUseCase = new StreamChatCompletionUseCase(
      this.aiProvider,
      this.streamAdapter,
      this.conversationRepository
    );

    this.sendMessageUseCase = new SendMessageUseCase(
      this.conversationRepository
    );

    this.manageConversationUseCase = new ManageConversationUseCase(
      this.conversationRepository
    );

    if (this.config.enableLogging) {
      console.log('Use cases initialized (reflexive mode)');
    }
  }

  // Getters for use cases
  getStreamChatCompletionUseCase(): StreamChatCompletionUseCase {
    return this.streamChatCompletionUseCase;
  }

  getSendMessageUseCase(): SendMessageUseCase {
    return this.sendMessageUseCase;
  }

  getManageConversationUseCase(): ManageConversationUseCase {
    return this.manageConversationUseCase;
  }

  // Getters for adapters (useful for testing or direct access)
  getAIProvider(): IAIProvider {
    return this.aiProvider;
  }

  getStreamAdapter(): IStreamAdapter {
    return this.streamAdapter;
  }

  getConversationRepository(): IConversationRepository {
    return this.conversationRepository;
  }

  /**
   * Health check for the container (reflexive mode)
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: Record<string, boolean | number | string>;
    errors: string[];
  }> {
    const errors: string[] = [];
    const services: Record<string, boolean | number | string> = {};

    // Check AI provider
    try {
      services.aiProvider = await this.aiProvider.validateConnection();
    } catch (error) {
      services.aiProvider = false;
      errors.push(`AI Provider: ${(error as Error).message}`);
    }

    // Check repository
    try {
      const count = await this.conversationRepository.count();
      services.repository = true;
      services.conversationCount = count;
    } catch (error) {
      services.repository = false;
      errors.push(`Repository: ${(error as Error).message}`);
    }

    // Reflexive mode indicator
    services.mode = 'reflexive';
    services.toolsEnabled = false;

    const status = errors.length === 0 ? 'healthy' : 'unhealthy';

    return {
      status,
      services,
      errors,
    };
  }

  /**
   * Gets container configuration
   */
  getConfig(): ContainerConfig {
    return { ...this.config };
  }

  /**
   * Updates container configuration (requires reinitialization)
   */
  static async reconfigure(config: ContainerConfig): Promise<DependencyContainer> {
    DependencyContainer.reset();
    return await DependencyContainer.create(config);
  }
}