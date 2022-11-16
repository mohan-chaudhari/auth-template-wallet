import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";

import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { Constants } from "../../shared/constants";
import { UserRepository } from "src/user/repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";

// import { Admin } from 'src/admin/entities/admin.entity';
import { AuthTokens } from "./entities/auth-token.entity";

@Module({
  imports: [
    JwtModule.register({
      secret: Constants.JWT_SECRET_KEY,
      signOptions: { expiresIn: Constants.USER_TOKEN_VALIDITY },
    }),
    TypeOrmModule.forFeature([User, AuthTokens]),
  ],
  providers: [AuthService, JwtStrategy, UserRepository],
  exports: [UserRepository],
})
export class AuthModule {}
