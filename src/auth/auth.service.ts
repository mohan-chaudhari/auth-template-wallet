import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Constants } from "../../shared/constants";
import { JwtService } from "@nestjs/jwt";
import { User } from "../../src/user/entities/user.entity";
import { UserRepository } from "../../src/user/repositories/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthTokens } from "./entities/auth-token.entity";
import CryptoJS from "crypto-js";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    @InjectRepository(User)
    private readonly userEntityRepository: Repository<User>,
    @InjectRepository(AuthTokens)
    private authTokensRepository: Repository<AuthTokens>
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

      delete newUserDetail?.kyc_result;
      delete newUserDetail?.kyc_user_inputs;
      delete newUserDetail?.id;

      const details = {
        ...newUserDetail,
        access_token: CryptoJS.AES.encrypt(
          access_token,
          Constants.AUTH_ENCRYPTION_KEY
        ).toString(),
      };

      return details;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description checkUser will check the userType, it will return Boolean depending upon userType match
   * @param userType
   * @returns it will return false if userType is not USER
   */
  async checkUser(userType: string, walletAddress: string): Promise<any> {
    try {
      if (userType != Constants.USER) {
        throw new UnauthorizedException("Unauthorized");
      }
      // const user = await this.userRepository.isUserValid(walletAddress);
      // if (!user) {
      //   throw new UnauthorizedException('Unauthorized');
      // }
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description checkUser will check the userType, it will return Boolean depending upon userType match
   * @param userType
   * @returns it will return false if userType is not ADMIN
   */
  async checkAdmin(userType: string): Promise<any> {
    try {
      if (userType != Constants.ADMIN) {
        throw new UnauthorizedException("Unauthorized");
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  async validateUserToken(
    token: string,
    walletAddress: string,
    userType: string
  ): Promise<any> {
    try {
      if (!token) {
        return false;
      }

      //Admin Auth Can be Updated
      const bufferObj = Buffer.from(userType, "base64");
      const decodedString = bufferObj.toString("utf8");
      if (decodedString == Constants.ADMIN) {
        return true;
      }

      const authToken = await this.authTokensRepository.findOne({
        where: {
          walletAddress,
          valid: true,
        },
      });

      // const userDetails = await this.userEntityRepository.findOne({
      //   walletAddress,
      // });

      if (!authToken) {
        return false;
      }
      const userAuthToken = Buffer.from(authToken.authToken, "base64").toString(
        "ascii"
      );

      if (userAuthToken == token) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
