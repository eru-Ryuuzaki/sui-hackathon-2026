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
exports.NeuralBadge = void 0;
const typeorm_1 = require("typeorm");
const construct_entity_1 = require("./construct.entity");
let NeuralBadge = class NeuralBadge {
    id;
    construct;
    constructId;
    name;
    description;
    rarity;
    unlocked_at;
};
exports.NeuralBadge = NeuralBadge;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], NeuralBadge.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => construct_entity_1.Construct, (construct) => construct.badges),
    __metadata("design:type", construct_entity_1.Construct)
], NeuralBadge.prototype, "construct", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NeuralBadge.prototype, "constructId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NeuralBadge.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NeuralBadge.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], NeuralBadge.prototype, "rarity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", String)
], NeuralBadge.prototype, "unlocked_at", void 0);
exports.NeuralBadge = NeuralBadge = __decorate([
    (0, typeorm_1.Entity)()
], NeuralBadge);
//# sourceMappingURL=neural-badge.entity.js.map