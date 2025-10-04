import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from '../core/config/env.validation';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvironmentConfig>) => {
        const mongoUri = configService.get('MONGODB_URI');

        if (!mongoUri) {
          console.warn('MongoDB URI not configured. Database features will be disabled.');
          // Return a mock configuration that won't connect
          return {
            uri: 'mongodb://localhost:27017/disabled',
            bufferCommands: false,
          };
        }

        // Use the MongoDB URI as-is (already includes database name and auth params)
        return {
          uri: mongoUri,
          // Connection options - more resilient for development
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 10000, // Increased timeout
          socketTimeoutMS: 45000,
          bufferCommands: false,
          retryWrites: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class DatabaseModule {}
