import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import "dotenv/config";
import { AuthTokens } from "src/auth/entities/auth-token.entity";
import { web3 } from "shared/web3";
import { CreateUserLoginDto } from "./dto/create-user-login.dto";
import { SignatureDto } from "./dto/signature.dto";
import { NullAddressConstant } from "shared/constants";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(AuthTokens)
    private readonly authTokensRepository: Repository<AuthTokens>,
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

  /**
   * @description updateUserTokenExpirationDate will update the user tokenExpirationDate with given wallet address
   * @param walletAddress
   * @param tokenExpirationDate
   */
  async updateUserTokenExpirationDate(
    walletAddress: string,
    tokenExpirationDate: number
  ): Promise<any> {
    try {
      await this.userRepository.update(
        { walletAddress },
        { tokenExpirationDate }
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUserAuthToken(
    authToken: string,
    authTokenExpirationDate: Date,
    { walletAddress, loginWallet }
  ): Promise<any> {
    try {
      const tokenExpirationDate = Date.now() + 1000 * 60 * 60 * 24;

      await this.updateUserTokenExpirationDate(
        walletAddress,
        tokenExpirationDate
      );

      await this.authTokensRepository.update(
        { walletAddress, valid: true },
        { valid: false }
      );

      await this.userRepository.update({ walletAddress }, { loginWallet });

      if (authToken) {
        const newAuthToken = new AuthTokens();

        newAuthToken.authToken = authToken;
        newAuthToken.walletAddress = walletAddress;

        await this.authTokensRepository.save(newAuthToken);
      }

      return true;
    } catch (error) {
      console.log(error);
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
  }: SignatureDto): Promise<any> {
    try {
      if (!signature) {
        return { errorMessage: "Please provide the signature" };
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
        // if (
        //   wallet_address === signatureAddress &&
        //   timetoCheck > validTime &&
        //   action === 'signIn'
        // ) {
        //   return true;
        // } else {
        //   return false;
        // }
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  //   /**
  //  * @description findUserByWalletAddress will return user details with given wallet address or null if there is no user with given wallet address
  //  * @param walletAddress
  //  * @returns it will return user details or null
  //  */
  //    async findUserByWalletAddress(walletAddress: string): Promise<User> {
  //     try {
  //       const user = await this.userRepository.findOne({where: {walletAddress}});
  //       if (!user) return null;
  //       return user;
  //     } catch (error) {
  //       throw new Error(error);
  //     }
  //   }
}
