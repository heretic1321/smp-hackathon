# Shadow Monarch's Path Core Backend - Implementation Plan

## Overview

This document outlines the implementation strategy for the Shadow Monarch's Path Core backend, following the [README.md](./README.md) specification as the single source of truth. The implementation is broken down into modular, testable milestones that can be developed and deployed incrementally.

## Core Principles

- **Spec-Driven Development**: All implementation must align with the specification in README.md
- **Modular Architecture**: Each module should be independently testable and deployable
- **Incremental Development**: Build working software in small, shippable increments
- **Test-First Approach**: Write tests before implementation where possible
- **Official Documentation**: Always refer to official docs for new technologies

## Technology Stack (Per Spec)

- **Framework**: NestJS 11.x
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schemas with NestJS validation pipe
- **Authentication**: SIWE (EIP-4361) with JWT cookies
- **Web3**: viem v2 + abitype
- **Media Storage**: web3.storage (IPFS)
- **Real-time**: Server-Sent Events (SSE)
- **Development**: TypeScript, Turborepo monorepo

## Project Structure (Per Spec)

```
apps/core/src/
├── core/              # Core infrastructure
│   ├── config/        # Environment validation, app config
│   ├── logger/        # Pino logger setup
│   ├── pipes/         # ZodValidationPipe
│   ├── filters/       # Global exception filters
│   ├── guards/        # Auth guards, roles, service key
│   ├── interceptors/  # Request ID, response formatting
│   └── middleware/    # CORS, helmet, rate limiting
├── common/            # Shared schemas, DTOs, errors
├── auth/              # SIWE authentication
├── profiles/          # Player profile management
├── media/             # Profile image uploads
├── gates/             # Gate management and occupancy
├── parties/           # Party system with SSE
├── runs/              # Run lifecycle and results
├── inventory/         # Read-only inventory cache
├── leaderboards/      # Weekly and per-boss leaderboards
└── chain/             # Web3 integration (viem)
```

---

## Milestone 1: Foundation & Core Infrastructure
*Estimated: 1-2 days*

### 1.1 Environment & Configuration Setup
- [ ] Create `core/config/` module with Zod environment validation
- [ ] Implement strict environment schema matching spec requirements
- [ ] Set up Pino logger with request IDs
- [ ] Configure CORS for subdomain support
- [ ] Add Helmet security middleware

### 1.2 Global Infrastructure
- [ ] Create `common/` module with shared schemas and error classes
- [ ] Implement global exception filter with error code mapping
- [ ] Create ZodValidationPipe for controller boundaries
- [ ] Set up request ID interceptor and response envelope formatter
- [ ] Add rate limiting for sensitive endpoints

### 1.3 Health & Meta Endpoints
- [ ] Implement `/v1/health` endpoint
- [ ] Add `/v1/version` with git SHA and build timestamp
- [ ] Set up basic NestJS app structure with proper middleware order

**Deliverables**: Working NestJS app with health endpoints, security middleware, and proper error handling.

---

## Milestone 2: Authentication System (SIWE)
*Estimated: 2-3 days*

### 2.1 SIWE Challenge/Verify Flow
- [ ] Create `auth/` module with SIWE service
- [ ] Implement `/v1/auth/challenge` endpoint
- [ ] Create `/v1/auth/verify` endpoint with signature validation
- [ ] Set up JWT service for session tokens
- [ ] Configure HttpOnly `gb_session` cookie

### 2.2 Auth Guards & Middleware
- [ ] Create JWT authentication guard
- [ ] Implement roles-based access control
- [ ] Add service key guard for internal endpoints
- [ ] Create `/v1/auth/me` endpoint
- [ ] Implement `/v1/auth/logout` functionality

### 2.3 Game Session Cookies
- [ ] Create signed JWT service for `gb_game` cookies
- [ ] Implement 5-minute TTL for game session tokens
- [ ] Add cookie domain configuration for subdomain support

**Deliverables**: Complete SIWE authentication system with proper session management and cookie handling.

---

## Milestone 3: Database Layer & Profiles
*Estimated: 2-3 days*

### 3.1 MongoDB Connection & Models
- [ ] Set up MongoDB connection with Mongoose
- [ ] Create base document interfaces and schemas
- [ ] Implement database indexes per spec requirements
- [ ] Add connection health monitoring

### 3.2 Player Profile System
- [ ] Create `profiles/` module with CRUD operations
- [ ] Implement case-insensitive unique display name validation
- [ ] Add profile creation and update endpoints
- [ ] Create profile retrieval by address endpoint
- [ ] Add proper Zod schemas for all profile operations

### 3.3 Profile Integration
- [ ] Connect profile system with auth system
- [ ] Add profile validation middleware
- [ ] Implement profile update on auth verification

**Deliverables**: Working profile management system with MongoDB persistence and proper validation.

---

## Milestone 4: Media Upload System
*Estimated: 1-2 days*

### 4.1 Web3.Storage Integration
- [ ] Create `media/` module with upload service
- [ ] Implement web3.storage client configuration
- [ ] Add file validation (size, type checking)
- [ ] Create multipart file upload endpoint

### 4.2 Profile Image Handling
- [ ] Integrate media upload with profile system
- [ ] Add image URL storage to player profiles
- [ ] Implement proper error handling for upload failures
- [ ] Add image metadata validation

**Deliverables**: Functional media upload system with web3.storage integration.

---

## Milestone 5: Gates & Party System
*Estimated: 3-4 days*

### 5.1 Gate Management
- [ ] Create `gates/` module with gate data models
- [ ] Implement gate seeding and management
- [ ] Add occupancy tracking system
- [ ] Create gate listing and detail endpoints

### 5.2 Party Lifecycle
- [ ] Create `parties/` module with party models
- [ ] Implement join-or-create party logic
- [ ] Add ready/lock state management
- [ ] Create party leader election system

### 5.3 Server-Sent Events (SSE)
- [ ] Implement SSE service for real-time updates
- [ ] Add party event streaming endpoint
- [ ] Create event types (member_joined, ready_changed, etc.)
- [ ] Integrate SSE with party state changes

### 5.4 Party Start Flow
- [ ] Implement party start preconditions
- [ ] Create run creation and room token generation
- [ ] Add start-payload endpoint with game cookie
- [ ] Integrate with auth system for member validation

**Deliverables**: Complete party system with real-time updates and game session initiation.

---

## Milestone 6: Run System & Chain Integration
*Estimated: 3-4 days*

### 6.1 Web3 Integration Setup
- [ ] Create `chain/` module with viem clients
- [ ] Set up public and wallet clients per spec
- [ ] Configure contract ABIs and addresses
- [ ] Implement retry logic with exponential backoff

### 6.2 Run Finishing System
- [ ] Create `runs/` module with run models
- [ ] Implement idempotency system with outbox pattern
- [ ] Add run finishing endpoint with contribution validation
- [ ] Create chain interaction for BossKilled events

### 6.3 Relic Minting
- [ ] Implement Relic721.mint integration
- [ ] Add PlayerCardSBT.updateProgress calls
- [ ] Create transaction hash tracking and logging
- [ ] Handle chain errors and retries appropriately

### 6.4 Results & Summary
- [ ] Create run results endpoint
- [ ] Implement XP and rank calculation
- [ ] Add minted relics tracking
- [ ] Create comprehensive result summary

**Deliverables**: Working run system with blockchain integration and proper error handling.

---

## Milestone 7: Read-Only Systems
*Estimated: 2-3 days*

### 7.1 Inventory Cache
- [ ] Create `inventory/` module with cache models
- [ ] Implement inventory retrieval endpoints
- [ ] Add chain state synchronization
- [ ] Create equipped items tracking

### 7.2 Leaderboards
- [ ] Create `leaderboards/` module with aggregation
- [ ] Implement weekly leaderboard calculations
- [ ] Add per-boss leaderboard functionality
- [ ] Create efficient leaderboard queries

**Deliverables**: Read-only inventory and leaderboard systems with proper caching.

---

## Milestone 8: Internal APIs & Security
*Estimated: 1-2 days*

### 8.1 Internal Endpoints
- [ ] Implement room verification endpoint for Colyseus
- [ ] Add service key authentication
- [ ] Create internal API documentation
- [ ] Add proper logging for internal operations

### 8.2 Security Hardening
- [ ] Add comprehensive input validation
- [ ] Implement rate limiting on all endpoints
- [ ] Add request size limits and file upload restrictions
- [ ] Configure CORS for production subdomains

### 8.3 Health Monitoring
- [ ] Add database connection monitoring
- [ ] Implement chain connectivity checks
- [ ] Add performance metrics collection
- [ ] Create detailed health endpoint

**Deliverables**: Production-ready security and monitoring setup.

---

## Milestone 9: Testing & Validation
*Estimated: 3-4 days*

### 9.1 Unit Tests
- [ ] Write comprehensive unit tests for all modules
- [ ] Add integration tests for critical paths
- [ ] Create e2e tests for complete user flows
- [ ] Add performance tests for key operations

### 9.2 Validation & Documentation
- [ ] Validate all endpoints against OpenAPI spec
- [ ] Add comprehensive error code documentation
- [ ] Create API usage examples and curl commands
- [ ] Add performance benchmarks

### 9.3 Security Testing
- [ ] Add security penetration testing
- [ ] Validate JWT token security
- [ ] Test CORS and cookie configurations
- [ ] Add chain interaction security validation

**Deliverables**: Comprehensive test suite with 90%+ code coverage.

---

## Development Workflow

### Daily Development Process
1. **Select Task**: Choose a specific task from the current milestone
2. **Write Tests**: Create failing tests that define expected behavior
3. **Implement**: Build the minimal code to make tests pass
4. **Refactor**: Improve code while maintaining test compatibility
5. **Validate**: Ensure implementation matches spec requirements
6. **Commit**: Make atomic commits with descriptive messages

### Code Quality Standards
- **Test Coverage**: Minimum 80% for all modules
- **Linting**: ESLint with strict rules enabled
- **Formatting**: Prettier for consistent code style
- **Documentation**: Update README and inline comments
- **Security**: Regular security audits of new code

### Deployment Strategy
1. **Local Development**: Full monorepo with hot reload
2. **Integration Testing**: Isolated services with test databases
3. **Staging Environment**: Pre-production validation
4. **Production Deployment**: Blue-green deployment strategy

---

## Risk Mitigation

### Technical Risks
- **MongoDB Complexity**: Start with simple schemas, add complexity incrementally
- **Chain Integration**: Implement robust retry logic and error handling
- **SSE Scalability**: Add Redis pub/sub if horizontal scaling needed
- **File Upload Security**: Validate all uploads server-side

### Project Risks
- **Scope Creep**: Strict adherence to spec requirements
- **Integration Complexity**: Build integration tests early
- **Performance Issues**: Regular performance profiling and optimization
- **Security Vulnerabilities**: Regular security audits and dependency updates

---

## Success Metrics

### Milestone Completion Criteria
- [ ] All endpoints return properly formatted responses
- [ ] Authentication flow works end-to-end
- [ ] Database operations are performant and reliable
- [ ] Chain interactions complete successfully
- [ ] Real-time features work as expected
- [ ] Error handling provides clear feedback
- [ ] Test coverage meets quality standards

### Final Acceptance Criteria
- [ ] Complete SIWE authentication with cookie management
- [ ] Profile creation and management works seamlessly
- [ ] Party system supports full lobby-to-game flow
- [ ] Run finishing triggers correct chain operations
- [ ] All inventory and leaderboard data is accessible
- [ ] System handles concurrent users appropriately
- [ ] All security measures are properly implemented
- [ ] Performance meets production requirements

---

## Getting Started

### Development Environment Setup
1. Install dependencies: `pnpm install`
2. Set up environment variables per spec requirements
3. Start MongoDB: `docker compose up -d`
4. Run development server: `pnpm dev` (from core directory)
5. Access API at `http://api.lvh.me:4000/v1/health`

### Next Steps After This Document
1. Begin with Milestone 1: Foundation & Core Infrastructure
2. Complete each task in order within milestones
3. Validate against spec requirements at each step
4. Write tests before implementation where possible
5. Update this document as implementation progresses

---

*This implementation plan serves as the roadmap for building the Shadow Monarch's Path Core backend. All development must align with the specification in README.md and follow the modular approach outlined above.*
