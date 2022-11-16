import { Injectable, UnauthorizedException, Request } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Constants } from 'shared/constants';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import CryptoJS from 'crypto-js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      ignoreExpiration: false,
      secretOrKey: Constants.JWT_SECRET_KEY,
    });
  }

  /**
   * Validating payload
   * @param payload
   * @returns user or admin details
   */
  async validate(payload: any): Promise<any> {
    const bufferObj = Buffer.from(payload.data, 'base64');
    const decodedString = bufferObj.toString('utf8');

    // if (decodedString === Constants.USER) {
      const user = await this.userRepository.findOne({
        where: { walletAddress: payload.walletAddress },
      });
      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }

      return {
        walletAddress: payload.walletAddress,
        userId: payload.userId,
        data: decodedString,
        userType: payload.data,
      };
    // } 
  }

  private static extractJWT(@Request() request): string | null {
    if (request.header('Authorization')) {
      const bytes = CryptoJS.AES.decrypt(
        request.header('Authorization')?.split(' ')[1],
        Constants.AUTH_ENCRYPTION_KEY,
      );
      return bytes.toString(CryptoJS.enc.Utf8);
    }

    return null;
  }
}
