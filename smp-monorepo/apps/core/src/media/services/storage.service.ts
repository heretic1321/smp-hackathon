import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { EnvironmentConfig } from '../../core/config/env.validation';

export interface UploadResult {
  url: string;
  contentHash: string;
  filename: string;
}

export interface MetadataResult {
  url: string;
  contentHash: string;
  filename: string;
}

@Injectable()
export class StorageService {
  private readonly baseUrl: string;
  private readonly uploadDir: string;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<EnvironmentConfig>,
  ) {
    this.baseUrl = this.configService.get('STORAGE_BASE_URL', 'https://localhost:3000');
    this.uploadDir = process.cwd() + '/uploads'; // Local storage for development
  }

  /**
   * Upload a file and return its URL and content hash
   */
  async uploadFile(
    file: Express.Multer.File,
    subfolder: string = 'misc'
  ): Promise<UploadResult> {
    try {
      // Calculate SHA256 hash of file content
      const contentHash = this.calculateHash(file.buffer);

      // Generate filename with hash for uniqueness
      const extension = this.getFileExtension(file.originalname);
      const filename = `${Date.now()}-${contentHash.substring(0, 16)}.${extension}`;
      const filepath = `${subfolder}/${filename}`;

      // In development, save to local filesystem
      // In production, this would upload to S3, Cloudflare R2, etc.
      const fileUrl = `${this.baseUrl}/${filepath}`;

      // For development: save file locally
      await this.saveFileLocally(file.buffer, filepath);

      return {
        url: fileUrl,
        contentHash,
        filename,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload relic metadata JSON and return its URL and content hash
   */
  async uploadMetadata(
    metadata: any,
    tokenId: number,
    subfolder: string = 'metadata'
  ): Promise<MetadataResult> {
    try {
      // Convert metadata to JSON string
      const jsonString = JSON.stringify(metadata, null, 2);
      const buffer = Buffer.from(jsonString, 'utf-8');

      // Calculate SHA256 hash of metadata JSON
      const contentHash = this.calculateHash(buffer);

      // Generate filename
      const filename = `${tokenId}.json`;
      const filepath = `${subfolder}/${filename}`;

      // In development, save to local filesystem
      // In production, this would upload to S3, Cloudflare R2, etc.
      const fileUrl = `${this.baseUrl}/${filepath}`;

      // For development: save file locally
      await this.saveFileLocally(buffer, filepath);

      return {
        url: fileUrl,
        contentHash,
        filename,
      };
    } catch (error) {
      throw new Error(`Failed to upload metadata: ${error.message}`);
    }
  }

  /**
   * Calculate SHA256 hash of buffer
   */
  private calculateHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'bin';
  }

  /**
   * Save file locally (development only)
   * In production, replace with actual cloud storage upload
   */
  private async saveFileLocally(buffer: Buffer, filepath: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const fullPath = path.join(this.uploadDir, filepath);

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, buffer);
  }

  /**
   * Generate relic metadata JSON structure
   */
  generateRelicMetadata(
    tokenId: number,
    relicType: string,
    imageUrl: string,
    affixes: Record<string, number>,
    rarity: string = 'Common'
  ): any {
    // Convert affixes to attributes array
    const attributes = [
      { trait_type: 'Rarity', value: rarity },
      ...Object.entries(affixes).map(([key, value]) => ({
        trait_type: key,
        value: value,
      })),
    ];

    // Generate name based on relic type and token ID
    const name = `Relic #${tokenId} — ${this.formatRelicName(relicType)}`;

    // Generate description
    const description = `An ${rarity.toLowerCase()} ${relicType.toLowerCase()} relic with enhanced properties.`;

    return {
      name,
      description,
      image: imageUrl,
      attributes,
      external_url: `https://app.${this.configService.get('DOMAIN', 'lvh.me')}/relics/${tokenId}`,
    };
  }

  /**
   * Format relic name for display
   */
  private formatRelicName(relicType: string): string {
    // Convert camelCase or snake_case to Title Case
    return relicType
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
