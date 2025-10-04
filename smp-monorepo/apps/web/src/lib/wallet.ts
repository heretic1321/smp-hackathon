import { type Address, apiClient } from '@smp/shared';
import { createWalletClient, custom, type WalletClient, getAddress } from 'viem';
import { baseSepolia } from 'viem/chains';

export class WalletService {
  private walletClient: WalletClient | null = null;
  private address: Address | null = null;

  async connect(): Promise<Address> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get the checksummed address using viem's getAddress
      const address = getAddress(accounts[0]) as Address;

      // Create wallet client for signing
      this.walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });

      this.address = address;

      return address;
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.walletClient || !this.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.walletClient.signMessage({
        account: this.address,
        message,
      });

      return signature;
    } catch (error) {
      throw new Error(`Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAddress(): Address | null {
    return this.address;
  }

  isConnected(): boolean {
    return this.address !== null && this.walletClient !== null;
  }

  async disconnect(): Promise<void> {
    this.walletClient = null;
    this.address = null;
  }
}

export const walletService = new WalletService();

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      isMetaMask?: boolean;
    };
  }
}
