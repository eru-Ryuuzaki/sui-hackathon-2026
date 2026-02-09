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
    
    // Salt for zkLogin must be a numeric string or BigInt usually, 
    // but the SDK handles hex or string. 
    // Typically it's a large integer.
    // Let's return it as a string representation of the BigInt to be safe.
    const saltBigInt = BigInt('0x' + salt);
    
    return {
      salt: saltBigInt.toString(),
      sub: sub
    };
  }
}
