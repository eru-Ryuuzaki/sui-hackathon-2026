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
var IndexerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const client_1 = require("@mysten/sui.js/client");
const event_cursor_entity_1 = require("../entities/event-cursor.entity");
const shard_engraved_processor_1 = require("./processors/shard-engraved.processor");
const subject_jacked_in_processor_1 = require("./processors/subject-jacked-in.processor");
let IndexerService = IndexerService_1 = class IndexerService {
    cursorRepo;
    configService;
    shardEngravedProcessor;
    subjectJackedInProcessor;
    logger = new common_1.Logger(IndexerService_1.name);
    suiClient;
    packageId;
    processors;
    constructor(cursorRepo, configService, shardEngravedProcessor, subjectJackedInProcessor) {
        this.cursorRepo = cursorRepo;
        this.configService = configService;
        this.shardEngravedProcessor = shardEngravedProcessor;
        this.subjectJackedInProcessor = subjectJackedInProcessor;
        this.processors = [shardEngravedProcessor, subjectJackedInProcessor];
    }
    async onModuleInit() {
        const network = this.configService.get('SUI_NETWORK', 'testnet');
        let nodeUrl = this.configService.get('SUI_NODE_URL');
        if (!nodeUrl) {
            nodeUrl = (0, client_1.getFullnodeUrl)(network);
        }
        this.suiClient = new client_1.SuiClient({ url: nodeUrl });
        this.packageId = this.configService.get('SUI_PACKAGE_ID', '');
    }
    async handleCron() {
        if (!this.packageId || !this.suiClient) {
            return;
        }
        for (const processor of this.processors) {
            await this.indexEvents(processor);
        }
    }
    async indexEvents(processor) {
        const eventType = processor.getEventType();
        const fullType = `${this.packageId}::core::${eventType}`;
        let cursor = await this.cursorRepo.findOne({ where: { event_type: fullType } });
        let txDigest = cursor ? cursor.tx_digest : undefined;
        let eventSeq = cursor ? cursor.event_seq : undefined;
        try {
            const events = await this.suiClient.queryEvents({
                query: { MoveEventType: fullType },
                cursor: txDigest && eventSeq ? { txDigest, eventSeq } : undefined,
                limit: 50,
            });
            for (const event of events.data) {
                await processor.process(event);
            }
            if (events.hasNextPage && events.nextCursor) {
                if (!cursor) {
                    cursor = new event_cursor_entity_1.EventCursor();
                    cursor.event_type = fullType;
                }
                cursor.tx_digest = events.nextCursor.txDigest;
                cursor.event_seq = events.nextCursor.eventSeq;
                await this.cursorRepo.save(cursor);
            }
        }
        catch (e) {
            this.logger.error(`Error indexing ${eventType}: ${e}`);
        }
    }
};
exports.IndexerService = IndexerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IndexerService.prototype, "handleCron", null);
exports.IndexerService = IndexerService = IndexerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_cursor_entity_1.EventCursor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        shard_engraved_processor_1.ShardEngravedProcessor,
        subject_jacked_in_processor_1.SubjectJackedInProcessor])
], IndexerService);
//# sourceMappingURL=indexer.service.js.map