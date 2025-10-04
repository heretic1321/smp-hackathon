import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { StorageService } from './services/storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppError, ErrorCode } from '../common/errors/app.error';
import {
  ProfileImageUploadResponseDto,
  RelicImageUploadResponseDto,
} from './dto/media.dto';

@Controller('media')
@ApiTags('Media')
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @Post('profile-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        // Validate file type
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          return callback(new BadRequestException('File size too large!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload profile image',
    description: 'Upload a profile image for the authenticated user'
  })
  @ApiResponse({
    status: 201,
    description: 'Profile image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            imageUrl: { type: 'string', example: 'https://cdn.example.com/profile-images/123.webp' },
            contentHash: { type: 'string', example: 'abc123...' }
          }
        }
      }
    }
  })
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ ok: true; data: ProfileImageUploadResponseDto }> {
    if (!file) {
      throw AppError.badRequest(ErrorCode.UNSUPPORTED_TYPE, 'No file provided');
    }

    try {
      const result = await this.storageService.uploadFile(file, 'profile-images');

      return {
        ok: true,
        data: {
          imageUrl: result.url,
          contentHash: result.contentHash,
        },
      };
    } catch (error) {
      throw AppError.internalError('Failed to upload profile image', { error: error.message });
    }
  }

  @Post('relic-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/relic-images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        // Validate file type
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        // Validate file size (10MB max for relics)
        if (file.size > 10 * 1024 * 1024) {
          return callback(new BadRequestException('File size too large!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload relic image and generate metadata',
    description: 'Upload a relic image and automatically generate metadata JSON with content hash'
  })
  @ApiResponse({
    status: 201,
    description: 'Relic image uploaded and metadata generated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            imageUrl: { type: 'string', example: 'https://cdn.example.com/relic-images/123.webp' },
            contentHash: { type: 'string', example: 'abc123...' },
            metadataUrl: { type: 'string', example: 'https://cdn.example.com/metadata/123.json' },
            metadataHash: { type: 'string', example: 'def456...' }
          }
        }
      }
    }
  })
  async uploadRelicImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('relicType') relicType: string,
    @Body('tokenId') tokenId: string,
    @Body('affixes') affixesJson?: string,
    @Body('rarity') rarity?: string,
  ): Promise<{ ok: true; data: RelicImageUploadResponseDto }> {
    if (!file) {
      throw AppError.badRequest(ErrorCode.UNSUPPORTED_TYPE, 'No file provided');
    }

    if (!relicType || !tokenId) {
      throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'relicType and tokenId are required');
    }

    try {
      // Parse affixes
      let affixes: Record<string, number> = {};
      if (affixesJson) {
        try {
          affixes = JSON.parse(affixesJson);
        } catch (error) {
          throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'Invalid affixes JSON format');
        }
      }

      // Upload image
      const imageResult = await this.storageService.uploadFile(file, 'relic-images');

      // Generate metadata
      const metadata = this.storageService.generateRelicMetadata(
        parseInt(tokenId),
        relicType,
        imageResult.url,
        affixes,
        rarity || 'Common'
      );

      // Upload metadata JSON
      const metadataResult = await this.storageService.uploadMetadata(
        metadata,
        parseInt(tokenId),
        'metadata'
      );

      return {
        ok: true,
        data: {
          imageUrl: imageResult.url,
          contentHash: imageResult.contentHash,
          metadataUrl: metadataResult.url,
          metadataHash: metadataResult.contentHash,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.internalError('Failed to upload relic image', { error: error.message });
    }
  }
}
