import { ApiProperty } from '@nestjs/swagger';
import { IsHexadecimal, IsString } from 'class-validator';

export class SignatureDto {
  @ApiProperty()
  @IsString()
  @IsHexadecimal()
  wallet_address: string;

  @ApiProperty()
  @IsString()
  signature: string;

  @ApiProperty()
  @IsString()
  signature_message: string;
}
