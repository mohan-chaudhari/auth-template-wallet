import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
} from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import "dotenv/config";
import { web3 } from "shared/web3";
import { CreateUserLoginDto } from "./dto/create-user-login.dto";
import { SignatureDto } from "./dto/signature.dto";
import { NullAddressConstant } from "shared/constants";
import { caching, Cache } from "cache-manager";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(User)
    private readonly userRepository: Repository<User> //  @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * @description createUser will create User if user with given wallet address
   * @param CreateUserLoginDto
   * @returns it will return user details
   */
  async createUser(createUserLoginDto: CreateUserLoginDto): Promise<User> {
    try {
      const user = await this.userRepository.save({
        walletAddress: createUserLoginDto.walletAddress,
      });
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description findUserDetails will find user with given wallet address
   * @param CreateUserLoginDto
   * @returns it will return user details
   */
  async findUserDetails(walletAddress: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          walletAddress: walletAddress,
        },
      });
      if (!user) return null;

      return user;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async updateUserAuthToken(
    authToken: string,
    authTokenExpirationDate: Date,
    { walletAddress, loginWallet }
  ): Promise<boolean> {
    try {
      if (authToken) {
        await this.cacheManager.set(walletAddress, authToken);
      } else {
        await this.cacheManager.del(walletAddress);
      }

      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description Signature authentication
   * @param wallet_address,signature,signature_message,
   * @returns object with successs or failure of signature authentication
   */
  async signatureAuth({
    wallet_address,
    signature,
    signature_message,
  }: SignatureDto): Promise<boolean> {
    try {
      if (!signature) {
        // return { errorMessage: "Please provide the signature" };
      } else {
        // fetching the wallet address which signed the signature
        const signatureAddress = await web3.eth.accounts.recover(
          signature_message,
          signature
        );

        // time check for signature
        const timeStamp = signature_message.split("=").reverse()[0];

        const timetoCheck = Math.floor(
          (Date.parse(timeStamp) + 1000 * 60 * 60) / 1000
        );

        const validTime = Math.floor(Date.now() / 1000);

        const action = signature_message.split("&")[0].split("=")[1].trim();

        // Verifying the user with signature
        if (
          wallet_address === signatureAddress &&
          timetoCheck > validTime &&
          action === "signIn"
        ) {
          return true;
        } else {
          return false;
        }
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   * @description update will update the user details
   * @param UpdateUserDto
   * @returns it will return user details
   */
  async updateUser(
    walletAddress: string,
    updateUserDto: UpdateUserDto
  ): Promise<string> {
    try {
      const data = await this.userRepository.update(
        { walletAddress },
        updateUserDto
      );
      if (data.affected > 0) return "User Updated";

      return "User not Updated";
    } catch (error) {
      throw new Error(error);
    }
  }
}
