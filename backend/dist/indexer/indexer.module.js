"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const indexer_service_1 = require("./indexer.service");
const construct_entity_1 = require("../entities/construct.entity");
const memory_shard_entity_1 = require("../entities/memory-shard.entity");
const neural_badge_entity_1 = require("../entities/neural-badge.entity");
const event_cursor_entity_1 = require("../entities/event-cursor.entity");
const construct_service_1 = require("../services/construct.service");
const shard_engraved_processor_1 = require("./processors/shard-engraved.processor");
const subject_jacked_in_processor_1 = require("./processors/subject-jacked-in.processor");
let IndexerModule = class IndexerModule {
};
exports.IndexerModule = IndexerModule;
exports.IndexerModule = IndexerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([construct_entity_1.Construct, memory_shard_entity_1.MemoryShard, neural_badge_entity_1.NeuralBadge, event_cursor_entity_1.EventCursor]),
        ],
        providers: [
            indexer_service_1.IndexerService,
            construct_service_1.ConstructService,
            shard_engraved_processor_1.ShardEngravedProcessor,
            subject_jacked_in_processor_1.SubjectJackedInProcessor,
        ],
    })
], IndexerModule);
//# sourceMappingURL=indexer.module.js.map