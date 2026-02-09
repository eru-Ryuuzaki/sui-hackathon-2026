import { Repository } from 'typeorm';
import { Construct } from '../entities/construct.entity';
export declare class ConstructController {
    private constructRepo;
    constructor(constructRepo: Repository<Construct>);
    getConstruct(id: string): Promise<Construct>;
    getByOwner(address: string): Promise<Construct>;
}
