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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryShard = void 0;
const typeorm_1 = require("typeorm");
const construct_entity_1 = require("./construct.entity");
let MemoryShard = class MemoryShard {
    id;
    construct;
    constructId;
    shard_index;
    timestamp;
    content;
    emotion_val;
    category;
    is_encrypted;
    blob_id;
    tx_digest;
};
exports.MemoryShard = MemoryShard;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MemoryShard.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construct_entity_1.Construct, (construct) => construct.shards),
    __metadata("design:type", construct_entity_1.Construct)
], MemoryShard.prototype, "construct", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MemoryShard.prototype, "constructId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MemoryShard.prototype, "shard_index", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", String)
], MemoryShard.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MemoryShard.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MemoryShard.prototype, "emotion_val", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MemoryShard.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], MemoryShard.prototype, "is_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MemoryShard.prototype, "blob_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MemoryShard.prototype, "tx_digest", void 0);
exports.MemoryShard = MemoryShard = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Index)(['construct', 'shard_index'], { unique: true })
], MemoryShard);
//# sourceMappingURL=memory-shard.entity.js.map