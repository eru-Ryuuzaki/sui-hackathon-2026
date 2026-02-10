import { Injectable, Logger } from '@nestjs/common';
import { SuiEvent } from '@mysten/sui.js/client';
import { EventProcessor } from './event-processor.interface';
import { ConstructService } from '../../services/construct.service';

@Injectable()
export class SubjectJackedInProcessor implements EventProcessor {
  private readonly logger = new Logger(SubjectJackedInProcessor.name);

  constructor(
    private constructService: ConstructService,
  ) {}

  getEventType(): string {
    return 'SubjectJackedInEvent';
  }

  async process(event: SuiEvent): Promise<void> {
    const { subject, construct_id, timestamp } = event.parsedJson as any;
    
    await this.constructService.findOrCreate(construct_id, subject, timestamp);
  }
}
