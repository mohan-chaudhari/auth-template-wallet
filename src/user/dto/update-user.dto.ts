import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  MaxLength,
  IsOptional,
  IsString,
  IsUrl,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

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

  @ApiProperty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(1000, { message: 'Bio is too long' })
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(50)
  @IsString()
  twitterHandle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(50)
  @IsString()
  instagramHandle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(50)
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(50)
  @IsString()
  instagramToken?: string;
}
