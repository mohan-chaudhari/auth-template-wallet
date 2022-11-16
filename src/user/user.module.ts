import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ResponseModel } from 'src/responseModel';
import { AuthService } from 'src/auth/auth.service';
import { Constants } from 'shared/constants';

import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { AuthTokens } from 'src/auth/entities/auth-token.entity';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: Constants.JWT_SECRET_KEY,
      signOptions: { expiresIn: Constants.USER_TOKEN_VALIDITY },
    }),
    TypeOrmModule.forFeature([
      User,
      AuthTokens,
      // Admin,
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    ResponseModel,
  ],
})
export class UserModule {}
