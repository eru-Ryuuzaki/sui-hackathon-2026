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
const construct_entity_1 = require("../entities/construct.entity");
const memory_shard_entity_1 = require("../entities/memory-shard.entity");
const event_cursor_entity_1 = require("../entities/event-cursor.entity");
let IndexerService = IndexerService_1 = class IndexerService {
    constructRepo;
    shardRepo;
    cursorRepo;
    configService;
    logger = new common_1.Logger(IndexerService_1.name);
    suiClient;
    packageId;
    constructor(constructRepo, shardRepo, cursorRepo, configService) {
        this.constructRepo = constructRepo;
        this.shardRepo = shardRepo;
        this.cursorRepo = cursorRepo;
        this.configService = configService;
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
        await this.indexEvents('ShardEngravedEvent', async (event) => {
            const { subject, construct_id, shard_id, timestamp, category, is_encrypted, content_snippet } = event.parsedJson;
            const shard = new memory_shard_entity_1.MemoryShard();
            shard.constructId = construct_id;
            shard.shard_index = Number(shard_id);
            shard.timestamp = timestamp;
            shard.content = content_snippet;
            shard.emotion_val = 0;
            shard.category = category;
            shard.is_encrypted = is_encrypted;
            shard.tx_digest = event.id.txDigest;
            let construct = await this.constructRepo.findOne({ where: { id: construct_id } });
            if (!construct) {
                construct = new construct_entity_1.Construct();
                construct.id = construct_id;
                construct.owner = subject;
                await this.constructRepo.save(construct);
            }
            const existing = await this.shardRepo.findOne({ where: { tx_digest: event.id.txDigest } });
            if (!existing) {
                await this.shardRepo.save(shard);
                this.logger.log(`Indexed Shard ${shard_id} for Construct ${construct_id}`);
            }
        });
        await this.indexEvents('SubjectJackedInEvent', async (event) => {
            const { subject, construct_id, timestamp } = event.parsedJson;
            let construct = await this.constructRepo.findOne({ where: { id: construct_id } });
            if (!construct) {
                construct = new construct_entity_1.Construct();
                construct.id = construct_id;
                construct.owner = subject;
                construct.last_update = timestamp;
                await this.constructRepo.save(construct);
                this.logger.log(`Indexed New Construct ${construct_id} for ${subject}`);
            }
        });
    }
    async indexEvents(eventType, handler) {
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
                await handler(event);
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
    __param(0, (0, typeorm_1.InjectRepository)(construct_entity_1.Construct)),
    __param(1, (0, typeorm_1.InjectRepository)(memory_shard_entity_1.MemoryShard)),
    __param(2, (0, typeorm_1.InjectRepository)(event_cursor_entity_1.EventCursor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], IndexerService);
//# sourceMappingURL=indexer.service.js.map