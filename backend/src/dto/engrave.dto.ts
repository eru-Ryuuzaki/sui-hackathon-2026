import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class EngraveDto {
  @ApiProperty()
  @IsString()
  sender: string;

  @ApiProperty()
  @IsString()
  construct_id: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiProperty()
  @IsNumber()
  emotion_val: number;

  @ApiProperty()
  @IsNumber()
  category: number;

  @ApiProperty()
  @IsBoolean()
  is_encrypted: boolean;

  @ApiProperty()
  @IsOptional()
  @IsString()
  blob_id?: string;
}
