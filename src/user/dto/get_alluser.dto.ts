import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsHexadecimal,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  maxLength,
} from 'class-validator';

export class GetAllUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBlocked: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  kyc_verified: boolean;

  @ApiPropertyOptional()
  @MaxLength(100)
  @IsOptional()
  @IsString()
  username: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexadecimal()
  walletAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  take: number;

  @ApiPropertyOptional()
  @IsOptional()
  skip: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  verifiedUser: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  fromDate: number;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: number;
}
