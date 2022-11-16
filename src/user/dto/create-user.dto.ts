import { ApiProperty } from '@nestjs/swagger';
import {
  IsHexadecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsHexadecimal()
  walletAddress: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  signature_message?: string;
}
