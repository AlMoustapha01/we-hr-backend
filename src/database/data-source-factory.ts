import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { setupDatabaseTest, stopTestContainer } from './test-database-setup';
import { config } from 'dotenv';
import * as path from 'path';

const envPath: string = path.resolve(
  __dirname,
  process.env.NODE_ENV === 'test' ? '../../.env.test' : '../../.env',
);
config({ path: envPath });

export async function createDataSource(): Promise<DataSource> {
  if (process.env.NODE_ENV === 'test' && !process.env.SETUP_TEST_DATABASE) {
    await setupDatabaseTest();
    console.log(
      'Test container ready:',
      process.env.DATABASE_HOST,
      process.env.DATABASE_PORT,
    );
  }

  try {
    const dataSourceOptions = {
      type: process.env.DATABASE_TYPE,
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT
        ? parseInt(process.env.DATABASE_PORT, 10)
        : 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
      dropSchema: false,
      keepConnectionAlive: true,
      logging: process.env.NODE_ENV !== 'production',
      entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [path.join(__dirname, '../../dist/src/database/migrations')],
      cli: {
        entitiesDir: 'dist',
        subscribersDir: 'subscriber',
        migrationsDir: 'dist',
      },
      extra: {
        // based on https://node-postgres.com/api/pool
        // max connection pool size
        max: process.env.DATABASE_MAX_CONNECTIONS
          ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
          : 100,
        ssl:
          process.env.DATABASE_SSL_ENABLED === 'true'
            ? {
                rejectUnauthorized:
                  process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
                ca: process.env.DATABASE_CA ?? undefined,
                key: process.env.DATABASE_KEY ?? undefined,
                cert: process.env.DATABASE_CERT ?? undefined,
              }
            : undefined,
      },
    } as DataSourceOptions;

    const dataSource = new DataSource(dataSourceOptions);

    await dataSource.initialize();

    return dataSource;
  } catch (error) {
    console.error('Database initialization failed:', error);
    stopTestContainer();
    process.exit(1);
  }
}
