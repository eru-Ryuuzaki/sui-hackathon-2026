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
exports.MemoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const memory_shard_entity_1 = require("../entities/memory-shard.entity");
let MemoryController = class MemoryController {
    shardRepo;
    constructor(shardRepo) {
        this.shardRepo = shardRepo;
    }
    async search(query) {
        return this.shardRepo.createQueryBuilder('shard')
            .leftJoinAndSelect('shard.construct', 'construct')
            .where("to_tsvector('english', shard.content) @@ plainto_tsquery('english', :query)", { query })
            .andWhere('shard.is_encrypted = :encrypted', { encrypted: false })
            .orderBy('shard.timestamp', 'DESC')
            .take(20)
            .getMany();
    }
    async getMemories(constructId) {
        return this.shardRepo.find({
            where: { constructId },
            order: { timestamp: 'DESC' },
            take: 50,
        });
    }
};
exports.MemoryController = MemoryController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search memories' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':construct_id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get memories for a construct' }),
    __param(0, (0, common_1.Param)('construct_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MemoryController.prototype, "getMemories", null);
exports.MemoryController = MemoryController = __decorate([
    (0, swagger_1.ApiTags)('Memory'),
    (0, common_1.Controller)('api/memory'),
    __param(0, (0, typeorm_1.InjectRepository)(memory_shard_entity_1.MemoryShard)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MemoryController);
//# sourceMappingURL=memory.controller.js.map