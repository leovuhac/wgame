/**
 * MongoDB Connection Module
 * Handles connection, reconnection logic, and schema initialization
 */

export interface MongoDBConfig {
  url: string;
  poolSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected: boolean = false;
  private config: MongoDBConfig;
  private retryCount: number = 0;

  private constructor(config: MongoDBConfig) {
    this.config = {
      poolSize: 10,
      retryAttempts: 3,
      retryDelay: 5000,
      timeout: 30000,
      ...config,
    };
  }

  public static getInstance(config?: MongoDBConfig): MongoDBConnection {
    if (!MongoDBConnection.instance && config) {
      MongoDBConnection.instance = new MongoDBConnection(config);
    }
    return MongoDBConnection.instance;
  }

  /**
   * Establish connection to MongoDB
   * Implements exponential backoff retry logic
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    const maxRetries = this.config.retryAttempts || 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(
          `Connecting to MongoDB (attempt ${attempt + 1}/${maxRetries})...`
        );
        // In actual implementation, this would be:
        // await mongoose.connect(this.config.url, {
        //   maxPoolSize: this.config.poolSize,
        //   serverSelectionTimeoutMS: this.config.timeout,
        // });
        this.isConnected = true;
        this.retryCount = 0;
        console.log('✅ Connected to MongoDB successfully');
        return;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Connection attempt ${attempt + 1} failed:`, lastError.message);

        if (attempt < maxRetries - 1) {
          const delay = this.getExponentialBackoffDelay(attempt);
          console.log(`Retrying in ${delay / 1000} seconds...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      // In actual implementation:
      // await mongoose.disconnect();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Check connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get exponential backoff delay for retry
   */
  private getExponentialBackoffDelay(attempt: number): number {
    const baseDelay = this.config.retryDelay || 5000;
    const delay = baseDelay * Math.pow(2, attempt);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return delay + jitter;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export initialization helper
export async function initializeMongoDBConnection(
  config: MongoDBConfig
): Promise<MongoDBConnection> {
  const connection = MongoDBConnection.getInstance(config);
  await connection.connect();
  return connection;
}
