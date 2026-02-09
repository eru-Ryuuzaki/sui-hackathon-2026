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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransactionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transactions_1 = require("@mysten/sui.js/transactions");
const sui_service_1 = require("../sui/sui.service");
class EngraveDto {
    sender;
    construct_id;
    content;
    emotion_val;
    category;
    is_encrypted;
    blob_id;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EngraveDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EngraveDto.prototype, "construct_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EngraveDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], EngraveDto.prototype, "emotion_val", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], EngraveDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], EngraveDto.prototype, "is_encrypted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], EngraveDto.prototype, "blob_id", void 0);
let TransactionController = TransactionController_1 = class TransactionController {
    suiService;
    logger = new common_1.Logger(TransactionController_1.name);
    constructor(suiService) {
        this.suiService = suiService;
    }
    async buildEngraveTx(dto) {
        const tx = new transactions_1.TransactionBlock();
        tx.setSender(dto.sender);
        const packageId = this.suiService.getPackageId();
        const hiveId = process.env.HIVE_OBJECT_ID;
        if (!hiveId || !packageId) {
            throw new Error("Configuration missing");
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
        const txBytes = await tx.build({ client: this.suiService.getClient() });
        return {
            tx_bytes: Buffer.from(txBytes).toString('base64'),
        };
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Post)('engrave'),
    (0, swagger_1.ApiOperation)({ summary: 'Build engrave transaction' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EngraveDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "buildEngraveTx", null);
exports.TransactionController = TransactionController = TransactionController_1 = __decorate([
    (0, swagger_1.ApiTags)('Transaction'),
    (0, common_1.Controller)('api/transaction'),
    __metadata("design:paramtypes", [sui_service_1.SuiService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map