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
var FaucetController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaucetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sui_service_1 = require("../sui/sui.service");
class ClaimFaucetDto {
    address;
    jwt_token;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ClaimFaucetDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ClaimFaucetDto.prototype, "jwt_token", void 0);
let FaucetController = FaucetController_1 = class FaucetController {
    suiService;
    logger = new common_1.Logger(FaucetController_1.name);
    constructor(suiService) {
        this.suiService = suiService;
    }
    async claim(dto) {
        if (!dto.jwt_token) {
            throw new common_1.BadRequestException('Missing JWT token');
        }
        try {
            const digest = await this.suiService.transferSui(dto.address, 10_000_000);
            return { status: 'success', digest };
        }
        catch (e) {
            this.logger.error(`Faucet claim failed for ${dto.address}`, e);
            throw new common_1.BadRequestException('Faucet claim failed');
        }
    }
};
exports.FaucetController = FaucetController;
__decorate([
    (0, common_1.Post)('claim'),
    (0, swagger_1.ApiOperation)({ summary: 'Claim initial SUI for new users' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ClaimFaucetDto]),
    __metadata("design:returntype", Promise)
], FaucetController.prototype, "claim", null);
exports.FaucetController = FaucetController = FaucetController_1 = __decorate([
    (0, swagger_1.ApiTags)('Faucet'),
    (0, common_1.Controller)('api/faucet'),
    __metadata("design:paramtypes", [sui_service_1.SuiService])
], FaucetController);
//# sourceMappingURL=faucet.controller.js.map