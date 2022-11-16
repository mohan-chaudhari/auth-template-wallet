import { BadRequestException, Injectable, OnModuleInit } from "@nestjs/common";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserRepository } from "./repositories/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import "dotenv/config";

import { Constants, NullAddressConstant } from "shared/constants";

import { AuthTokens } from "src/auth/entities/auth-token.entity";
// import { web3 } from 'shared/web3';
import { SignatureDto } from "./dto/signature.dto";
import { web3 } from "shared/web3";

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(AuthTokens)
    private readonly authTokensRepository: Repository<AuthTokens>,
    @InjectRepository(User)
    private readonly userRepositorySecond: Repository<User> //  @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async onModuleInit() {
    try {
      const nftAccount = await this.userRepository.findOne({
        where: {
          walletAddress: NullAddressConstant.NULLADDRESS,
        },
      });
      if (nftAccount) {
        return;
      }
      const user = new User();
      user.userName = process.env.MINTING_ACCOUNT_USERNAME;
      user.walletAddress = process.env.MINTING_ACCOUNT_ADDRESS;
      await this.userRepository.save(user);
    } catch (error) {
      console.error(error.message);
    }
  }

  /**
   * @description createUser will create User if user with given wallet address
   * @param createUserDto
   * @returns it will return user details
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.createUser(createUserDto);
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async createUserInternal({ walletAddress }): Promise<User> {
    try {
      const user = await this.userRepositorySecond.save({
        walletAddress: walletAddress,
        imageUrl: Constants.DEFAULT_USER_PROFILE_IMAGE,
      });
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description findUser will return user details with given wallet address or null if there is no user with given wallet address
   * @param CreateUserDto
   * @returns it will return user details or null

   */
  async findUser(createUserDto: CreateUserDto): Promise<any> {
    try {
      const user = await this.userRepository.findUser(
        createUserDto.walletAddress
      );
      if (!user) return null;

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description findUserByWalletAddress will return user details with given wallet address or null if there is no user with given wallet address
   * @param walletAddress
   * @returns it will return user details or null

   */
  async findUserByWalletAddress(walletAddress: string): Promise<User> {
    try {
      if (walletAddress.toLowerCase() == NullAddressConstant.NULLADDRESS) {
        return null;
      }
      const user = await this.userRepository.findUser(walletAddress);
      if (!user) return null;
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description findUserDetails will find user with given wallet address
   * @param CreateUserDto
   * @returns it will return user details
   */
  async findUserDetails(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findUserByWalletAddress(
        createUserDto.walletAddress
      );
      if (!user) return null;

      return user;
    } catch (error) {
      console.error(error);
      // throw new Error(error);
    }
  }

  async updateUserAuthToken(
    authToken: string,
    authTokenExpirationDate: Date,
    { walletAddress, loginWallet }
  ): Promise<any> {
    try {
      // await this.userRepository.updateUserAuthToken(
      //   authToken,
      //   authTokenExpirationDate,
      //   walletAddress,
      // );

      const tokenExpirationDate = Date.now() + 1000 * 60 * 60 * 24;

      await this.userRepository.updateUserTokenExpirationDate(
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
   * @param
   * takes wallet_address,signature,signature_message,
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
        //fetching the wallet address which signed the signature
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
}
