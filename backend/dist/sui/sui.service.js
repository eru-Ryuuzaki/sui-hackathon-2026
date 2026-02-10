"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SuiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@mysten/sui.js/client");
const ed25519_1 = require("@mysten/sui.js/keypairs/ed25519");
const transactions_1 = require("@mysten/sui.js/transactions");
const utils_1 = require("@mysten/sui.js/utils");
let SuiService = SuiService_1 = class SuiService {
    configService;
    logger = new common_1.Logger(SuiService_1.name);
    client;
    signer = null;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        const network = this.configService.get('SUI_NETWORK', 'testnet');
        let nodeUrl = this.configService.get('SUI_NODE_URL');
        if (!nodeUrl) {
            nodeUrl = (0, client_1.getFullnodeUrl)(network);
        }
        this.client = new client_1.SuiClient({ url: nodeUrl });
        const privateKey = this.configService.get('SUI_FAUCET_PRIVATE_KEY');
        if (privateKey) {
            try {
                this.signer = ed25519_1.Ed25519Keypair.fromSecretKey((0, utils_1.fromB64)(privateKey));
            }
            catch (e) {
                this.logger.error('Failed to load faucet key', e);
            }
        }
    }
    getClient() {
        return this.client;
    }
    async transferSui(to, amount) {
        if (!this.signer) {
            throw new Error('Faucet signer not configured');
        }
        const tx = new transactions_1.TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
        tx.transferObjects([coin], tx.pure(to));
        const res = await this.client.signAndExecuteTransactionBlock({
            signer: this.signer,
            transactionBlock: tx,
        });
        return res.digest;
    }
    getPackageId() {
        return this.configService.get('SUI_PACKAGE_ID', '');
    }
    async buildEngraveTransaction(dto) {
        const tx = new transactions_1.TransactionBlock();
        tx.setSender(dto.sender);
        const packageId = this.getPackageId();
        const hiveId = this.configService.get('HIVE_OBJECT_ID');
        if (!hiveId || !packageId) {
            throw new Error("Configuration missing: HIVE_OBJECT_ID or SUI_PACKAGE_ID");
        }
        tx.moveCall({
            target: `${packageId}::core::engrave`,
            arguments: [
                tx.object(dto.construct_id),
                tx.object(hiveId),
                tx.object('0x6'),
                tx.pure(dto.content),
                tx.pure(dto.emotion_val),
                tx.pure(dto.category),
                tx.pure(dto.is_encrypted),
                tx.pure(dto.blob_id ? [dto.blob_id] : []),
            ],
        });
        const txBytes = await tx.build({ client: this.client });
        return Buffer.from(txBytes).toString('base64');
    }
};
exports.SuiService = SuiService;
exports.SuiService = SuiService = SuiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SuiService);
//# sourceMappingURL=sui.service.js.map