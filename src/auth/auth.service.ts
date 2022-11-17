import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Constants } from "../../shared/constants";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../src/user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as CryptoJS from "crypto-js";
import { Cache } from "cache-manager";

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>
  ) {}

  /**
   * @description createUserToken will create JWT Token for user
   * @param walletAddress
   * @param User
   * @returns it will return user details with JWT Token
   */
  async createUserToken(walletAddress: string, user: User): Promise<any> {
    try {
      const bufferObj = Buffer.from(Constants.USER, "utf8");
      const base64String = bufferObj.toString("base64");

      const payload = {
        walletAddress,
        data: base64String,
      };

      const newUserDetail = JSON.parse(JSON.stringify(user));
      const validity = Constants.USER_TOKEN_VALIDITY;

      const access_token = this.jwtService.sign(payload, {
        expiresIn: `${validity}`,
      });

      const details = {
        ...newUserDetail,
        access_token: CryptoJS.AES.encrypt(
          access_token,
          Constants.AUTH_ENCRYPTION_KEY
        ).toString(),
      };

      return details;
    } catch (error) {
      console.log(error);

      throw new Error(error);
    }
  }

  async validateUserToken(
    token: string,
    walletAddress: string,
    userType: string
  ): Promise<boolean> {
    try {
      if (!token) {
        return false;
      }

      const authToken: string = await this.cacheManager.get(walletAddress);

      if (!authToken) {
        return false;
      }

      const userAuthToken = Buffer.from(authToken, "base64").toString("ascii");

      if (userAuthToken === token) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
