import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthResponse } from './health.response';

@ApiTags('health')
@Controller('health')
export class HealthController {
  /** Liveness check */
  @Get()
  check(): HealthResponse {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
