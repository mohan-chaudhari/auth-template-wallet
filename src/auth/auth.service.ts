import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Constants } from '../../shared/constants';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthTokens } from './entities/auth-token.entity';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
    @InjectRepository(AuthTokens)
    private authTokensRepository: Repository<AuthTokens>,
  ) {}

  /**
   * @description createUserToken will create JWT Token for user
   * @param walletAddress
   * @param User
   * @returns it will return user details with JWT Token
   */
  async createUserToken(walletAddress: string, user: User): Promise<any> {
    try {
      const bufferObj = Buffer.from(Constants.USER, 'utf8');
      const base64String = bufferObj.toString('base64');

      const payload = {
        walletAddress,
        data: base64String,
      };

      const newUserDetail = JSON.parse(JSON.stringify(user));
      const validity = Constants.USER_TOKEN_VALIDITY;

      const access_token = this.jwtService.sign(payload, {
        expiresIn: `${validity}`,
      });

      delete newUserDetail?.kyc_result;
      delete newUserDetail?.kyc_user_inputs;
      delete newUserDetail?.id;

      const details = {
        ...newUserDetail,
        access_token: CryptoJS.AES.encrypt(
          access_token,
          Constants.AUTH_ENCRYPTION_KEY,
        ).toString(),
      };

      return details;
    } catch (error) {
      console.log(error);
      
      throw new Error(error);
    }
  }
}
