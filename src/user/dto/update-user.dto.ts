import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  MaxLength,
  IsOptional,
  IsString,
  IsEmail,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @MaxLength(50, { message: 'First Name is too long' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @MaxLength(50, { message: 'Last Name is too long' })
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @MaxLength(100, { message: 'User Name is too long' })
  @IsString()
  userName: string;

  @ApiPropertyOptional()
  @IsOptional()
  imageUrl?: string;
}
