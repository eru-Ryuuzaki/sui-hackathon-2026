import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { Construct } from './entities/construct.entity';
import { MemoryShard } from './entities/memory-shard.entity';
import { EventCursor } from './entities/event-cursor.entity';
import { IndexerModule } from './indexer/indexer.module';
import { SuiModule } from './sui/sui.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          type: 'postgres' as const,
          host: configService.get<string>('POSTGRES_HOST', 'localhost'),
          port: configService.get<number>('POSTGRES_PORT', 5432),
          username: configService.get<string>('POSTGRES_USER', 'engram'),
          password: configService.get<string>(
            'POSTGRES_PASSWORD',
            'engram_password',
          ),
          database: configService.get<string>('POSTGRES_DB', 'engram_db'),
          entities: [Construct, MemoryShard, EventCursor],
          synchronize: true, // Auto-create tables (dev only)
        };

        console.log('--- Database Connection Config ---');
        console.log(`Host: ${dbConfig.host}`);
        console.log(`Port: ${dbConfig.port}`);
        console.log(`User: ${dbConfig.username}`);
        console.log(`Database: ${dbConfig.database}`);
        console.log(
          `Password: ${dbConfig.password ? '****** (Set)' : 'NOT SET'}`,
        );
        console.log('--------------------------------');

        return dbConfig;
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    PrometheusModule.register(),
    IndexerModule,
    ApiModule,
    SuiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
