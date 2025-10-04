import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { SiweService } from './siwe.service';
import { JwtAuthService } from './jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EnvironmentConfig } from '../core/config/env.validation';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    forwardRef(() => ProfilesModule),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<EnvironmentConfig>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          issuer: 'shadow-monarchs-path',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [SiweService, JwtAuthService, JwtAuthGuard],
  exports: [SiweService, JwtAuthService, JwtAuthGuard],
})
export class AuthModule {}
