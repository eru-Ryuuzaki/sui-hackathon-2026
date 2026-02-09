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
exports.HiveController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const construct_entity_1 = require("../entities/construct.entity");
const memory_shard_entity_1 = require("../entities/memory-shard.entity");
const neural_badge_entity_1 = require("../entities/neural-badge.entity");
let HiveController = class HiveController {
    constructRepo;
    shardRepo;
    badgeRepo;
    constructor(constructRepo, shardRepo, badgeRepo) {
        this.constructRepo = constructRepo;
        this.shardRepo = shardRepo;
        this.badgeRepo = badgeRepo;
    }
    async getStatus() {
        const totalSubjects = await this.constructRepo.count();
        const totalShards = await this.shardRepo.count();
        const totalBadges = await this.badgeRepo.count();
        return {
            total_subjects: totalSubjects,
            total_shards: totalShards,
            total_badges_issued: totalBadges,
            timestamp: Date.now(),
        };
    }
};
exports.HiveController = HiveController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get global Hive Mind statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HiveController.prototype, "getStatus", null);
exports.HiveController = HiveController = __decorate([
    (0, swagger_1.ApiTags)('Hive'),
    (0, common_1.Controller)('api/hive'),
    __param(0, (0, typeorm_1.InjectRepository)(construct_entity_1.Construct)),
    __param(1, (0, typeorm_1.InjectRepository)(memory_shard_entity_1.MemoryShard)),
    __param(2, (0, typeorm_1.InjectRepository)(neural_badge_entity_1.NeuralBadge)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], HiveController);
//# sourceMappingURL=hive.controller.js.map