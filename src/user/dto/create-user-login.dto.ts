import { ApiProperty } from '@nestjs/swagger';
import {
  IsHexadecimal,
  IsNotEmpty,
  IsString,
  ValidateIf,
  IsIn,
} from 'class-validator';

export class CreateUserLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsHexadecimal()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signature_message: string;

  @ApiProperty({
    required: true,
  })
  @ValidateIf((o) => o.operational_type !== '')
  @IsIn(['Metamask', 'Fortmatic', 'Walletconnect', 'Coinbase'])
  @IsString()
  loginWallet: string;
}
