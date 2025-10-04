import { type Address, apiClient } from '@smp/shared';
import { walletService } from './wallet';

export interface AuthState {
  isAuthenticated: boolean;
  address: Address | null;
  isLoading: boolean;
  isAdmin: boolean;
  adminLoading: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private _state: AuthState = {
    isAuthenticated: false,
    address: null,
    isLoading: false,
    isAdmin: false,
    adminLoading: false,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    // Don't auto-initialize auth - let components decide when to check
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async checkSession(): Promise<boolean> {
    try {
      this.updateState({ isLoading: true });
      
      // Check if we have a valid session
      const user = await apiClient.getMe();
      
      // Try to restore wallet connection if MetaMask is available
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts' // This doesn't trigger a popup, just checks
          }) as string[];
          
          if (accounts && accounts.length > 0) {
            // Silently reconnect wallet
            await walletService.connect();
          }
        } catch (error) {
          // Wallet connection failed, but session is still valid
          console.warn('Could not restore wallet connection:', error);
        }
      }
      
      this.updateState({
        isAuthenticated: true,
        address: user.address as Address,
        isLoading: false,
        isAdmin: user.isAdmin,
        adminLoading: false,
      });
      
      return true;
    } catch (error) {
      // Not authenticated or session expired
      this.updateState({
        isAuthenticated: false,
        address: null,
        isLoading: false,
        isAdmin: false,
        adminLoading: false,
      });
      return false;
    }
  }

  private updateState(newState: Partial<AuthState>) {
    this._state = { ...this._state, ...newState };
    this.listeners.forEach(listener => listener(this._state));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    listener(this._state); // Immediate callback

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async signIn(): Promise<Address> {
    this.updateState({ isLoading: true });

    try {
      // Connect wallet
      const address = await walletService.connect();

      // Generate SIWE challenge
      const { nonce } = await apiClient.generateChallenge({ address });

      // Create SIWE message
      const message = `app.lvh.me wants you to sign in with your Ethereum account:
${address}

Sign in to Shadow Monarch's Path

URI: https://app.lvh.me
Version: 1
Chain ID: 84532
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}
Resources:
- https://app.lvh.me/profile
- https://app.lvh.me/gates`;

      // Sign the message
      const signature = await walletService.signMessage(message);

      // Verify signature with backend
      await apiClient.verifySignature({
        address,
        message,
        signature,
      });

      // Get admin status from the session
      const user = await apiClient.getMe();
      
      this.updateState({
        isAuthenticated: true,
        address,
        isLoading: false,
        isAdmin: user.isAdmin,
        adminLoading: false,
      });

      return address;
    } catch (error) {
      this.updateState({ isLoading: false });
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await apiClient.logout();
      await walletService.disconnect();
      this.updateState({
        isAuthenticated: false,
        address: null,
        isLoading: false,
        isAdmin: false,
        adminLoading: false,
      });
    } catch (error) {
      // Even if logout fails, clear local state
      await walletService.disconnect();
      this.updateState({
        isAuthenticated: false,
        address: null,
        isLoading: false,
        isAdmin: false,
        adminLoading: false,
      });
    }
  }

  async checkAdminStatus(): Promise<boolean> {
    if (!this._state.isAuthenticated) {
      this.updateState({ isAdmin: false, adminLoading: false });
      return false;
    }

    try {
      this.updateState({ adminLoading: true });
      const user = await apiClient.getMe();
      this.updateState({ 
        isAdmin: user.isAdmin, 
        adminLoading: false 
      });
      return user.isAdmin;
    } catch (error) {
      this.updateState({ 
        isAdmin: false, 
        adminLoading: false 
      });
      return false;
    }
  }

  get state(): AuthState {
    return this._state;
  }

  get address(): Address | null {
    return this._state.address;
  }

  get isAuthenticated(): boolean {
    return this._state.isAuthenticated;
  }

  get isLoading(): boolean {
    return this._state.isLoading;
  }

  get isAdmin(): boolean {
    return this._state.isAdmin;
  }

  get adminLoading(): boolean {
    return this._state.adminLoading;
  }
}

export const authService = AuthService.getInstance();
