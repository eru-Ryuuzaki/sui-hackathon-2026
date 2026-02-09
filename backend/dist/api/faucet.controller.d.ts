import { SuiService } from '../sui/sui.service';
declare class ClaimFaucetDto {
    address: string;
    jwt_token: string;
}
export declare class FaucetController {
    private suiService;
    private readonly logger;
    constructor(suiService: SuiService);
    claim(dto: ClaimFaucetDto): Promise<{
        status: string;
        digest: string;
    }>;
}
export {};
