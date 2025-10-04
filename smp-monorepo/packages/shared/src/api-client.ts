import type {
  Address,
  SiweChallengeRequest,
  SiweChallengeResponse,
  SiweVerifyRequest,
  SiweVerifyResponse,
  AdminCheckResponse,
  AuthMeResponse,
  Profile,
  ProfileUpsertInput,
  GatesResponse,
  GateWithOccupancy,
  Party,
  JoinPartyRequest,
  ReadyRequest,
  LockRequest,
  LeavePartyRequest,
  StartRunResult,
  FinishRunInput,
  FinishRunResult,
  ResultSummary,
  InventoryResponse,
  LeaderboardResponse,
  MediaUploadResponse,
  ApiResponse,
  ApiErrorType
} from './types';

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://api.lvh.me:4000/v1') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get cookies for authenticated requests
    const headers = new Headers(options.headers);

    // Add common headers
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    });

    const data: ApiResponse<T> = await response.json();

    if (!data.ok) {
      const errorInfo = data.error;
      throw new ApiClientError(
        errorInfo && typeof errorInfo === 'object' && 'code' in errorInfo ? String(errorInfo.code) : 'UNKNOWN_ERROR',
        errorInfo && typeof errorInfo === 'object' && 'message' in errorInfo ? String(errorInfo.message) : 'An unknown error occurred',
        errorInfo && typeof errorInfo === 'object' && 'details' in errorInfo ? errorInfo.details : undefined
      );
    }

    return data.data as T;
  }

  // Auth endpoints
  async generateChallenge(request: SiweChallengeRequest): Promise<SiweChallengeResponse> {
    return this.request('/auth/challenge', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifySignature(request: SiweVerifyRequest): Promise<SiweVerifyResponse> {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<AuthMeResponse> {
    return this.request('/auth/me');
  }

  async checkAdmin(): Promise<AdminCheckResponse> {
    return this.request('/auth/admin');
  }

  // Profile endpoints
  async getProfile(address: Address): Promise<Profile> {
    return this.request(`/profile/${address}`);
  }

  async createProfile(profile: ProfileUpsertInput): Promise<Profile> {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // Gate endpoints
  async getGates(): Promise<GatesResponse> {
    return this.request('/gates');
  }

  async getGate(gateId: string): Promise<GateWithOccupancy> {
    return this.request(`/gates/${gateId}`);
  }

  // Party endpoints
  async joinOrCreateParty(request: JoinPartyRequest): Promise<Party> {
    return this.request(`/gates/${request.gateId}/join-or-create`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async getParty(partyId: string): Promise<Party> {
    return this.request(`/party/${partyId}`);
  }

  async setReady(partyId: string, request: ReadyRequest): Promise<Party> {
    return this.request(`/party/${partyId}/ready`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async lockParty(partyId: string, request: LockRequest): Promise<Party> {
    return this.request(`/party/${partyId}/lock`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async leaveParty(partyId: string): Promise<void> {
    return this.request(`/party/${partyId}/leave`, {
      method: 'POST',
    });
  }

  async startParty(partyId: string): Promise<{ runId: string }> {
    return this.request(`/party/${partyId}/start`, {
      method: 'POST',
    });
  }

  async getStartPayload(partyId: string): Promise<{ redirect: string }> {
    return this.request(`/party/${partyId}/start-payload`);
  }

  // Run endpoints
  async getResults(runId: string): Promise<ResultSummary> {
    return this.request(`/results/${runId}`);
  }

  async finishRun(runId: string, input: FinishRunInput, idempotencyKey?: string): Promise<FinishRunResult> {
    const headers = new Headers();
    if (idempotencyKey) {
      headers.set('Idempotency-Key', idempotencyKey);
    }

    return this.request(`/runs/${runId}/finish`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers,
    });
  }

  // Inventory endpoints
  async getInventory(address: Address): Promise<InventoryResponse> {
    return this.request(`/inventory/${address}`);
  }

  // Leaderboard endpoints
  async getWeeklyLeaderboard(weekKey: string): Promise<LeaderboardResponse> {
    return this.request(`/leaderboards/weekly/${weekKey}`);
  }

  async getBossLeaderboard(bossId: string): Promise<LeaderboardResponse> {
    return this.request(`/leaderboards/boss/${bossId}`);
  }

  // Media endpoints
  async uploadProfileImage(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/media/profile-image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data: ApiResponse<MediaUploadResponse> = await response.json();

    if (!data.ok) {
      const errorInfo = data.error;
      throw new ApiClientError(
        errorInfo && typeof errorInfo === 'object' && 'code' in errorInfo ? String(errorInfo.code) : 'UNKNOWN_ERROR',
        errorInfo && typeof errorInfo === 'object' && 'message' in errorInfo ? String(errorInfo.message) : 'An unknown error occurred',
        errorInfo && typeof errorInfo === 'object' && 'details' in errorInfo ? errorInfo.details : undefined
      );
    }

    return data.data as MediaUploadResponse;
  }

  // SSE connection for party events
  createPartySSEConnection(partyId: string): EventSource {
    return new EventSource(`${this.baseUrl}/party/${partyId}/stream`, {
      withCredentials: true,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
