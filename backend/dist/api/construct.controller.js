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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construct_entity_1 = require("../entities/construct.entity");
let ConstructController = class ConstructController {
    constructRepo;
    constructor(constructRepo) {
        this.constructRepo = constructRepo;
    }
    async getConstruct(id) {
        const construct = await this.constructRepo.findOne({
            where: { id },
            relations: ['badges'],
        });
        if (!construct) {
            throw new common_1.NotFoundException('Construct not found');
        }
        return construct;
    }
    async getByOwner(address) {
        const construct = await this.constructRepo.findOne({
            where: { owner: address },
            relations: ['badges'],
        });
        if (!construct) {
            throw new common_1.NotFoundException('Construct not found for this address');
        }
        return construct;
    }
};
exports.ConstructController = ConstructController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get construct details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConstructController.prototype, "getConstruct", null);
__decorate([
    (0, common_1.Get)('owner/:address'),
    (0, swagger_1.ApiOperation)({ summary: 'Get construct by owner address' }),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConstructController.prototype, "getByOwner", null);
exports.ConstructController = ConstructController = __decorate([
    (0, swagger_1.ApiTags)('Construct'),
    (0, common_1.Controller)('api/construct'),
    __param(0, (0, typeorm_1.InjectRepository)(construct_entity_1.Construct)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConstructController);
//# sourceMappingURL=construct.controller.js.map