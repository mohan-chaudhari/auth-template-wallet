import { Any, EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserInterface } from '../interface/update-user.interface';
import { CreateUserInterface } from '../interface/create-user.interface';
import { Constants } from 'shared/constants';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**
   * @description createUser will create User if user with given wallet address
   * @param UserInterface
   * @returns it will return created user details
   
   */
  async createUser(createUserInterface: CreateUserInterface): Promise<User> {
    const { walletAddress, loginWallet } = createUserInterface;
    try {
      let user = new User();
      user.walletAddress = walletAddress;
      user.loginWallet = loginWallet;
      user.imageUrl = Constants.DEFAULT_USER_PROFILE_IMAGE;
      user = await this.save(user);
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description findUser will find user with given wallet address
   * @param walletAddress
   * @returns it will return user details
   */
  async findUser(walletAddress: string): Promise<User> {
    try {
      const user = await this.findOne({
        where: {
          walletAddress: Any([walletAddress]),
          isActive: true,
        },
      });
      return user;
    } catch (error) {
      console.error(error);
      // throw new Error(error);
    }
  }

  /**
   * @description findUserByWalletAddress will find user with given wallet address
   * @param walletAddress
   * @returns it will return user details
   */
  async findUserByWalletAddress(walletAddress: string): Promise<User> {
    try {
      const user = await this.findOne({
        where: {
          walletAddress: Any([walletAddress]),
        },
      });
      return user;
    } catch (error) {
      console.error(error);
      // throw new Error(error);
    }
  }

  /**
   * @description findUserByUserName will find user with given user name
   * @param userName
   * @returns it will return user details
   */
  async findUserByUserName(userName: string): Promise<User> {
    try {
      const user = await this.findOne({
        where: { userName, isActive: true },
      });
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * @description findUserByEmail will find user with given email
   * @param email
   * @returns it will return user details
   
   */
  async findUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.findOne({
        where: { isActive: true },
      });
      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  // async deleteS3File(fileUrl): Promise<void> {
  //   if (fileUrl && fileUrl != '') {
  //     const s3 = new S3({
  //       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //       region: process.env.AWS_S3_REGION,
  //       signatureVersion: 'v4',
  //     });

  //     let key;

  //     if (fileUrl.split('com/').length > 1) {
  //       key = fileUrl.split('com/').reverse()[0];
  //     } else if (fileUrl.split('xyz/').length > 1) {
  //       key = fileUrl.split('xyz/').reverse()[0];
  //     }

  //     await s3
  //       .deleteObject({
  //         Bucket: process.env.AWS_S3_BUCKET_NAME,
  //         Key: key,
  //       })
  //       .promise();
  //   }
  // }

  /**
   * @description updateUserDetails will update the user details with given wallet address
   * @param UserInterface
   * @returns it will return user details
   */
  async updateUserDetails(
    walletAddress: string,
    updateUserInterface: UpdateUserInterface,
  ): Promise<any> {
    try {
      const keys = [
        'firstName',
        'lastName',
        'userName',
        'imageUrl',
        'bannerUrl',
        'bio',
        'twitterHandle',
        'instagramHandle',
        'website',
        'instagramToken',
      ];

      const user = await this.findOne({
        where: { walletAddress },
      });

      if (!user) return null;

      const userImageUrl = user.imageUrl;

      // const keys = Object.keys(updateUserInterface);
      keys.forEach((key) => {
        user[key] = updateUserInterface[key];
      });

      await this.save(user);

      // if (userImageUrl != updateUserInterface.imageUrl) {
      //   await this.deleteS3File(userImageUrl);
      // }

      // if (userBannerUrl != updateUserInterface.bannerUrl) {
      //   await this.deleteS3File(userBannerUrl);
      // }

      return await this.findOne({
        where: { walletAddress },
      });
    } catch (error) {
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
    tokenExpirationDate: number,
  ): Promise<any> {
    try {
      await this.update({ walletAddress }, { tokenExpirationDate });
    } catch (error) {
      throw new Error(error);
    }
  }


  // async updateUserAuthToken(
  //   authToken: string,
  //   authTokenExpirationDate: Date,
  //   walletAddress: string,
  // ): Promise<any> {
  //   try {
  //     await this.update(
  //       { walletAddress },
  //       { authToken, authTokenExpirationDate },
  //     );
  //     return true;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
}
