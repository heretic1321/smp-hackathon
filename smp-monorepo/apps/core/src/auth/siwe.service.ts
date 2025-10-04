import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SiweMessage, generateNonce } from 'siwe';
import { EnvironmentConfig } from '../core/config/env.validation';
import { AppError, ErrorCode } from '../common/errors/app.error';
import { SiweChallengeRequestDto, SiweVerifyRequestDto } from './dto/auth.dto';

@Injectable()
export class SiweService {
  private readonly domain: string;
  private readonly origin: string;

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<EnvironmentConfig>,
  ) {
    const fullDomain = this.configService.get('DOMAIN', '.lvh.me');
    // Remove leading dot if present
    this.domain = fullDomain.startsWith('.') ? fullDomain.substring(1) : fullDomain;
    this.origin = `https://app.${this.domain}`;
  }

  /**
   * Generate a SIWE challenge message for the given address
   */
  async generateChallenge(request: SiweChallengeRequestDto): Promise<{ nonce: string }> {
    try {
      // Generate a secure nonce
      const nonce = generateNonce();

      // We don't need to create the full SIWE message here, just return the nonce
      // The frontend will construct the message and send it back for verification

      return { nonce };
    } catch (error: any) {
      console.error('Error generating challenge:', error);
      throw AppError.internalError('Failed to generate SIWE challenge', { 
        error: error?.message || String(error),
        address: request.address 
      });
    }
  }

  /**
   * Verify a SIWE signature and return the address
   */
  async verifySignature(request: SiweVerifyRequestDto): Promise<{ address: string }> {
    try {
      // Parse the SIWE message
      const siweMessage = new SiweMessage(request.message);

      // Verify the signature
      const result = await siweMessage.verify({
        signature: request.signature,
      });

      // Verify the address matches
      if (result.data.address.toLowerCase() !== request.address.toLowerCase()) {
        throw AppError.badRequest(
          ErrorCode.INVALID_SIGNATURE,
          'Address in message does not match provided address'
        );
      }

      return { address: result.data.address };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error('Error verifying signature:', error);

      if (error.message?.includes('Nonce')) {
        throw AppError.badRequest(ErrorCode.NONCE_MISMATCH, 'Invalid nonce in message');
      }

      if (error.message?.includes('Signature') || error.message?.includes('signature')) {
        throw AppError.badRequest(ErrorCode.INVALID_SIGNATURE, 'Invalid signature');
      }

      throw AppError.internalError('Failed to verify SIWE signature', { 
        error: error?.message || String(error) 
      });
    }
  }

  /**
   * Extract nonce from SIWE message (helper method)
   */
  private async extractNonceFromMessage(message: string): Promise<string> {
    // Parse the message to extract nonce
    // This is a simplified implementation - in production you might want to store nonces
    const lines = message.split('\n');
    for (const line of lines) {
      if (line.startsWith('Nonce: ')) {
        return line.substring(7);
      }
    }
    throw new Error('Nonce not found in message');
  }
}
