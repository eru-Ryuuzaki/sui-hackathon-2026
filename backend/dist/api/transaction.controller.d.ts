import { SuiService } from '../sui/sui.service';
declare class EngraveDto {
    sender: string;
    construct_id: string;
    content: string;
    emotion_val: number;
    category: number;
    is_encrypted: boolean;
    blob_id?: string;
}
export declare class TransactionController {
    private suiService;
    private readonly logger;
    constructor(suiService: SuiService);
    buildEngraveTx(dto: EngraveDto): Promise<{
        tx_bytes: string;
    }>;
}
export {};
