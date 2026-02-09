import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import * as crypto from 'crypto';

@ApiTags('ZkLogin')
@Controller('zklogin')
export class ZkLoginController {
  
  // In a real production environment, this salt should be:
  // 1. Unique per user (derived from their JWT 'sub' claim)
  // 2. Persistent (stored in DB) - if the salt changes, the Sui address changes!
  // 3. Secret (never exposed publicly? actually salt is public input to the proof, but the mapping logic is private)
  // Wait, the Master Salt is secret. The user salt is public.
  
  // For this hackathon/demo, we will derive a deterministic salt from the subject ID 
  // using a fixed "Master Seed" on the server.
  private readonly MASTER_SEED = 'ENGRAM_MASTER_SEED_2026';
  private readonly BN254_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

  @Get('salt')
  @ApiOperation({ summary: 'Get the salt for a specific JWT subject' })
  @ApiQuery({ name: 'sub', description: 'The subject claim from the JWT (unique user ID)' })
  getSalt(@Query('sub') sub: string) {
    if (!sub) {
      throw new HttpException('Subject (sub) is required', HttpStatus.BAD_REQUEST);
    }

    // Deterministic generation of salt
    // Hash(MasterSeed + UserSubject) -> Salt
    const hash = crypto.createHash('sha256');
    hash.update(this.MASTER_SEED);
    hash.update(sub);
    const salt = hash.digest('hex'); // Returns a big integer as hex string
    
    // Map salt into BN254 field to avoid "Element not in the BN254 field" errors
    let saltBigInt = BigInt('0x' + salt) % this.BN254_PRIME;
    if (saltBigInt === 0n) {
      saltBigInt = 1n;
    }
    
    return {
      salt: saltBigInt.toString(),
      sub: sub
    };
  }
}
