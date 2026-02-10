import { SuiService } from '../sui/sui.service';
import { EngraveDto } from '../dto/engrave.dto';
export declare class TransactionController {
    private suiService;
    private readonly logger;
    constructor(suiService: SuiService);
    buildEngraveTx(dto: EngraveDto): Promise<{
        tx_bytes: string;
    }>;
}
