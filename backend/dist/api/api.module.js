"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const faucet_controller_1 = require("./faucet.controller");
const hive_controller_1 = require("./hive.controller");
const memory_controller_1 = require("./memory.controller");
const construct_controller_1 = require("./construct.controller");
const zklogin_controller_1 = require("./zklogin.controller");
const construct_entity_1 = require("../entities/construct.entity");
const memory_shard_entity_1 = require("../entities/memory-shard.entity");
const neural_badge_entity_1 = require("../entities/neural-badge.entity");
const memory_service_1 = require("../services/memory.service");
let ApiModule = class ApiModule {
};
exports.ApiModule = ApiModule;
exports.ApiModule = ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([construct_entity_1.Construct, memory_shard_entity_1.MemoryShard, neural_badge_entity_1.NeuralBadge]),
        ],
        controllers: [
            faucet_controller_1.FaucetController,
            hive_controller_1.HiveController,
            memory_controller_1.MemoryController,
            construct_controller_1.ConstructController,
            zklogin_controller_1.ZkLoginController,
        ],
        providers: [
            memory_service_1.MemoryService,
        ],
    })
], ApiModule);
//# sourceMappingURL=api.module.js.map