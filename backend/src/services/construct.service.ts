import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Construct } from '../entities/construct.entity';

@Injectable()
export class ConstructService {
  private readonly logger = new Logger(ConstructService.name);

  constructor(
    @InjectRepository(Construct)
    private constructRepo: Repository<Construct>,
  ) {}

  async findOne(id: string): Promise<Construct | null> {
    return this.constructRepo.findOne({ where: { id } });
  }

  async create(id: string, owner: string, lastUpdate?: string | number): Promise<Construct> {
    const construct = new Construct();
    construct.id = id;
    construct.owner = owner;
    if (lastUpdate) {
      construct.last_update = lastUpdate.toString();
    }
    const saved = await this.constructRepo.save(construct);
    this.logger.log(`Created new Construct ${id} for ${owner}`);
    return saved;
  }

  async findOrCreate(id: string, owner: string, lastUpdate?: string | number): Promise<Construct> {
    let construct = await this.findOne(id);
    if (!construct) {
      construct = await this.create(id, owner, lastUpdate);
    }
    return construct;
  }
}
