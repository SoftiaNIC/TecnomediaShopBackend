import { Global, Module, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DB_CONNECTION = 'DB_CONNECTION';
export const DB_POOL = 'DB_POOL';
export type Database = NodePgDatabase<typeof schema>;

const logger = new Logger('DatabaseModule');

export const databaseProviders = [
  {
    provide: DB_POOL,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<Pool> => {
      const connectionString = configService.get<string>('DATABASE_URL');
      const nodeEnv = configService.get<string>('NODE_ENV', 'development');
      
      if (!connectionString) {
        throw new Error('DATABASE_URL is not defined in the configuration');
      }

      // Validate connection string format
      try {
        new URL(connectionString);
      } catch (error) {
        throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
      }

      const poolConfig = {
        connectionString,
        ssl: nodeEnv === 'production' ? { 
          rejectUnauthorized: false 
        } : false,
        max: configService.get<number>('DATABASE_MAX_CONNECTIONS', 10),
        min: configService.get<number>('DATABASE_MIN_CONNECTIONS', 2),
        idleTimeoutMillis: configService.get<number>('DATABASE_IDLE_TIMEOUT', 30000),
        connectionTimeoutMillis: configService.get<number>('DATABASE_CONNECTION_TIMEOUT', 10000),
        maxUses: 7500, // Reciclar conexiones periódicamente
        allowExitOnIdle: true,
      };

      const pool = new Pool(poolConfig);
      
      // Manejo de errores del pool
      pool.on('error', (err) => {
        logger.error('Unexpected error on idle database client', err);
      });
      
      // Test the connection
      let client;
      try {
        client = await pool.connect();
        await client.query('SELECT NOW()');
        logger.log('Database connection established successfully');
      } catch (error) {
        logger.error('Failed to establish database connection', error.stack);
        if (client) client.release();
        await pool.end();
        throw error;
        throw new Error(`Database connection failed: ${error.message}`);
      }

      // Handle pool errors
      pool.on('error', (error) => {
        logger.error('Unexpected error on idle client', error);
      });

      return pool;
    },
  },
  {
    provide: DB_CONNECTION,
    inject: [DB_POOL],
    useFactory: async (pool: Pool): Promise<Database> => {
      return drizzle(pool, { 
        schema,
        logger: process.env.NODE_ENV === 'development',
      });
    },
  },
];

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async onModuleDestroy() {
    if (this.pool) {
      try {
        logger.log('Closing database pool...');
        await this.pool.end();
        logger.log('Database pool closed successfully');
      } catch (error) {
        logger.error('Error closing database pool', error);
      }
    }
  }
}
