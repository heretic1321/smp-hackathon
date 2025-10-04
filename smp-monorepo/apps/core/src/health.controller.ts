import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
  version: string;
}

interface VersionResponse {
  gitSha: string;
  builtAt: string;
  nodeVersion: string;
  environment: string;
}

@Controller()
@ApiTags('Health & Meta')
export class HealthController {
  private readonly startTime = Date.now();

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the current health status of the service'
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' }
          }
        }
      }
    }
  })
  getHealth(): { ok: true; data: { status: string } } {
    return {
      ok: true,
      data: {
        status: 'ok'
      }
    };
  }

  @Get('version')
  @ApiOperation({
    summary: 'Version information',
    description: 'Returns version and build information about the service'
  })
  @ApiResponse({
    status: 200,
    description: 'Version information retrieved successfully'
  })
  getVersion(): { ok: true; data: VersionResponse } {
    return {
      ok: true,
      data: {
        gitSha: process.env.GIT_SHA || 'unknown',
        builtAt: process.env.BUILD_TIME || new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      }
    };
  }

  @Get('health/detailed')
  @ApiOperation({
    summary: 'Detailed health check',
    description: 'Returns detailed health information including uptime and memory usage'
  })
  getDetailedHealth(): { ok: true; data: HealthResponse } {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      ok: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime,
        version: process.env.npm_package_version || '1.0.0',
      }
    };
  }
}
