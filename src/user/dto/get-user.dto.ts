import { ApiProperty } from '@nestjs/swagger';
import {
  IsHexadecimal,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class WalletAddressDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsHexadecimal()
  walletAddress: string;
}

export class UserNameDto {
  @ApiProperty()
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  userName: string;
}
