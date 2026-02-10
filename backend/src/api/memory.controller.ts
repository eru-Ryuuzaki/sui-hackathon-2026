import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MemoryService } from '../services/memory.service';

@ApiTags('Memory')
@Controller('memory')
export class MemoryController {
  constructor(
    private memoryService: MemoryService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search memories' })
  @ApiQuery({ name: 'q', required: true })
  async search(@Query('q') query: string) {
    return this.memoryService.search(query);
  }

  @Get(':construct_id')
  @ApiOperation({ summary: 'Get memories for a construct' })
  async getMemories(@Param('construct_id') constructId: string) {
    return this.memoryService.findByConstructId(constructId);
  }
}
