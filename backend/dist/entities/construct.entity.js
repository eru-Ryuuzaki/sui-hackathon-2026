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
exports.Construct = void 0;
const typeorm_1 = require("typeorm");
const memory_shard_entity_1 = require("./memory-shard.entity");
const neural_badge_entity_1 = require("./neural-badge.entity");
let Construct = class Construct {
    id;
    owner;
    backup_controller;
    level;
    exp;
    streak;
    energy;
    focus;
    resilience;
    last_update;
    shard_count;
    shards;
    badges;
};
exports.Construct = Construct;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Construct.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Construct.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Construct.prototype, "backup_controller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Construct.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", String)
], Construct.prototype, "exp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Construct.prototype, "streak", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 100 }),
    __metadata("design:type", String)
], Construct.prototype, "energy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 50 }),
    __metadata("design:type", Number)
], Construct.prototype, "focus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 50 }),
    __metadata("design:type", Number)
], Construct.prototype, "resilience", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', default: 0 }),
    __metadata("design:type", String)
], Construct.prototype, "last_update", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Construct.prototype, "shard_count", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => memory_shard_entity_1.MemoryShard, (shard) => shard.construct),
    __metadata("design:type", Array)
], Construct.prototype, "shards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => neural_badge_entity_1.NeuralBadge, (badge) => badge.construct),
    __metadata("design:type", Array)
], Construct.prototype, "badges", void 0);
exports.Construct = Construct = __decorate([
    (0, typeorm_1.Entity)()
], Construct);
//# sourceMappingURL=construct.entity.js.map