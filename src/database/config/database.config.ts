/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { config } from 'dotenv';

// Initializing dotenv based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production'
    ? '../../../.env.production'
    : process.env.NODE_ENV === 'test'
      ? '../../../.env.test'
      : '../../../.env';

config({ path: envFile });

import { registerAs } from '@nestjs/config';

import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  @ValidateIf((o: any) => !o.DATABASE_URL)
  DATABASE_TYPE: string;

  @IsString()
  @ValidateIf((o: any) => !o.DATABASE_URL)
  DATABASE_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @ValidateIf((o: any) => !o.DATABASE_URL)
  DATABASE_PORT: number;

  @IsString()
  @ValidateIf((o: any) => !o.DATABASE_URL)
  DATABASE_PASSWORD: string;

  @IsString()
  @ValidateIf((o: any) => !o.DATABASE_URL)
  DATABASE_NAME: string;

  @IsString()
  @ValidateIf((o: any) => !o.DATABASE_URL)
  DATABASE_USERNAME: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE: boolean;

  @IsInt()
  @IsOptional()
  DATABASE_MAX_CONNECTIONS: number;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL_ENABLED: boolean;

  @IsBoolean()
  @IsOptional()
  DATABASE_REJECT_UNAUTHORIZED: boolean;

  @IsString()
  @IsOptional()
  DATABASE_CA: string;

  @IsString()
  @IsOptional()
  DATABASE_KEY: string;

  @IsString()
  @IsOptional()
  DATABASE_CERT: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT
      ? parseInt(process.env.DATABASE_PORT, 10)
      : 5432,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    maxConnections: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 100,
    sslEnabled: process.env.DATABASE_SSL_ENABLED === 'true',
    rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
    ca: process.env.DATABASE_CA,
    key: process.env.DATABASE_KEY,
    cert: process.env.DATABASE_CERT,
  };
});
