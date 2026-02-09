import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SuiClient } from '@mysten/sui.js/client';
export declare class SuiService implements OnModuleInit {
    private configService;
    private readonly logger;
    private client;
    private signer;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    getClient(): SuiClient;
    transferSui(to: string, amount: number): Promise<string>;
    getPackageId(): string;
}
