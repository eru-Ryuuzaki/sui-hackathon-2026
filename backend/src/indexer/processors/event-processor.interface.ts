import { SuiEvent } from '@mysten/sui.js/client';

export interface EventProcessor {
  getEventType(): string;
  process(event: SuiEvent): Promise<void>;
}
