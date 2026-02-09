"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const nestjs_pino_1 = require("nestjs-pino");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const construct_entity_1 = require("./entities/construct.entity");
const memory_shard_entity_1 = require("./entities/memory-shard.entity");
const neural_badge_entity_1 = require("./entities/neural-badge.entity");
const event_cursor_entity_1 = require("./entities/event-cursor.entity");
const indexer_module_1 = require("./indexer/indexer.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            singleLine: true,
                        },
                    },
                },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST', 'localhost'),
                    port: configService.get('POSTGRES_PORT', 5432),
                    username: configService.get('POSTGRES_USER', 'engram'),
                    password: configService.get('POSTGRES_PASSWORD', 'engram_password'),
                    database: configService.get('POSTGRES_DB', 'engram_db'),
                    entities: [construct_entity_1.Construct, memory_shard_entity_1.MemoryShard, neural_badge_entity_1.NeuralBadge, event_cursor_entity_1.EventCursor],
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            nestjs_prometheus_1.PrometheusModule.register(),
            indexer_module_1.IndexerModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map