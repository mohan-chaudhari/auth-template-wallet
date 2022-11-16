import { ApiProperty } from '@nestjs/swagger';

export class UsersWalletAddressDto {
  @ApiProperty()
  walletAddress: string[];
}
