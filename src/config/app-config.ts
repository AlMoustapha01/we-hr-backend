import '@/libs/utils/dotenv';
import { registerAs } from '@nestjs/config';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { AppConfig } from './app-config.type';
import validateConfig from '@/utils/validate-config';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}
class EnvironmentVariablesValidator {
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  @IsString()
  APP_NAME: string;

  @IsNotEmpty()
  @IsString()
  APP_VERSION: string;

  @IsNotEmpty()
  @IsString()
  APP_DESCRIPTION: string;

  @IsNotEmpty()
  @IsString()
  APP_AUTHOR: string;

  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  APP_URL: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsString()
  @IsOptional()
  APP_API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_CORS_ORIGIN: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'Coding slayers',
    version: process.env.APP_VERSION || '0.0.1',
    description: process.env.APP_DESCRIPTION || '',
    author: process.env.APP_AUTHOR || '',
    apiPrefix: process.env.APP_API_PREFIX || '',
    url: process.env.APP_URL || 'https://coding-slayers.com',
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    headerLanguage: process.env.APP_HEADER_LANGUAGE || 'fr',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'fr',
    corsOrigin: process.env.APP_CORS_ORIGIN || 'http://localhost:3002',
  };
});
