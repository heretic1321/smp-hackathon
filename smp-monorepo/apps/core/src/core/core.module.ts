import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironment } from './config/env.validation';
import { createLogger } from './logger/logger.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Pass the loaded env object to our validator
      validate: (env) => validateEnvironment(env),
      // Look for env files in both repo root and app folder
      envFilePath: [
        'apps/core/.env.local',
        'apps/core/.env',
        '.env.local',
        '.env',
      ],
    }),
  ],
  providers: [
    {
      provide: 'LOGGER',
      useFactory: (configService: ConfigService) => {
        const env = {
          NODE_ENV: configService.get<string>('NODE_ENV', 'development') as any,
          DOMAIN: configService.get<string>('DOMAIN', '.lvh.me')!,
          PORT: Number(configService.get<number>('PORT', 4000)),
          MONGODB_URI: configService.get<string>('MONGODB_URI', '')!,
          JWT_SECRET: configService.get<string>('JWT_SECRET', '')!,
          SESSION_TTL_HOURS: Number(configService.get<number>('SESSION_TTL_HOURS', 2)),
          GB_GAME_TTL_MINUTES: Number(configService.get<number>('GB_GAME_TTL_MINUTES', 5)),
          RPC_URL: configService.get<string>('RPC_URL', '')!,
          CHAIN_ID: Number(configService.get<number>('CHAIN_ID', 11155111)),
          COORDINATOR_PRIVATE_KEY: configService.get<string>('COORDINATOR_PRIVATE_KEY', '')!,
          STORAGE_BASE_URL: configService.get<string>('STORAGE_BASE_URL', '')!,
          SERVICE_KEY: configService.get<string>('SERVICE_KEY', '')!,
        } as any;
        return createLogger(env);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['LOGGER'],
})
export class CoreModule {}
