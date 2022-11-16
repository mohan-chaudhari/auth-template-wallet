import {
  Controller,
  Post,
  Body,
  Response,
  Request,
  UseGuards,
  Get,
  UnauthorizedException,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
} from '@nestjs/common';

import { UserService } from './user.service';
import { ResponseModel } from '../../src/responseModel';
import { ResponseStatusCode } from '../../shared/ResponseStatusCode';
import { ResponseMessage } from '../../shared/ResponseMessage';
import { AuthService } from '../../src/auth/auth.service';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { CreateUserLoginDto } from './dto/create-user-login.dto';
import { User } from './entities/user.entity';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseModel: ResponseModel,
    private readonly authService: AuthService,
  ) {}

  @Get('/genCT')
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: ResponseStatusCode.OK,
  })
  @ApiResponse({
    status: ResponseStatusCode.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR,
  })
  async generateCsrfToken(
    @Request() request,
    @Response() response,
  ): Promise<any> {
    return response.send({ csrfToken: request.csrfToken() });
  }

  /**
   * @description createUser will create User if user with given wallet address doesn't exist
   * @param CreateUserLoginDto
   * @returns it will return user details
   */
  @ApiTags('User Module')
  @ApiOperation({
    summary:
      'Login User with given Wallet Address or Create new Account with given Wallet Address',
  })
  @ApiResponse({
    status: ResponseStatusCode.OK,
    description: ResponseMessage.USER_LOGGED_IN,
  })
  @ApiResponse({
    status: ResponseStatusCode.CREATED,
    description: ResponseMessage.USER_CREATED,
  })
  @ApiResponse({
    status: ResponseStatusCode.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR,
  })
  @Post()
  async createUser(
    @Body() createUserLoginDto: CreateUserLoginDto,
  ): Promise<any> {
    try {
      // const verifiedSignature = await this.userService.signatureAuth({
      //   wallet_address: createUserLoginDto.walletAddress,
      //   signature: createUserLoginDto.signature,
      //   signature_message: createUserLoginDto.signature_message,
      // });
      // if (!verifiedSignature) throw new UnauthorizedException();

      let user = await this.userService.findUserDetails(createUserLoginDto.walletAddress);
      if (user) {
        const details = await this.authService.createUserToken(
          createUserLoginDto.walletAddress,
          user,
        );

        await this.userService.updateUserAuthToken(
          Buffer.from(String(details.access_token)).toString('base64'),
          new Date(),
          createUserLoginDto,
        );

        return this.responseModel.response(
          {
            ...details,
            tokenExpirationDate: Date.now() + 1000 * 60 * 60 * 24,
          },
          ResponseStatusCode.OK,
          true,
        );
      } else {
        user = await this.userService.createUser(createUserLoginDto);

        const details = await this.authService.createUserToken(
          createUserLoginDto.walletAddress,
          user,
        );

        await this.userService.updateUserAuthToken(
          Buffer.from(String(details.access_token)).toString('base64'),
          new Date(),
          createUserLoginDto,
        );

        return this.responseModel.response(
          {
            ...details,
            tokenExpirationDate: Date.now() + 1000 * 60 * 60 * 24,
          },
          ResponseStatusCode.CREATED,
          true,
        );
      }
    } catch (error) {
      console.log(error);
      
      return this.responseModel.response(
        error,
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        false,
      );
    }
  }

  @ApiTags('User Module')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logOut(@Request() request): Promise<any> {
    try {
      await this.userService.updateUserAuthToken(
        null,
        new Date(),
        request.user.walletAddress,
      );

      return this.responseModel.response(
        ResponseMessage.USER_LOGGED_OUT,
        ResponseStatusCode.OK,
        true,
      );
    } catch (error) {
      return this.responseModel.response(
        error,
        ResponseStatusCode.INTERNAL_SERVER_ERROR,
        false,
      );
    }
  }

    /**
   * @description getUserDetailsByWalletAddress will fetch the user details with given wallet address
   * @param createUserDto
   * @returns it will return user details
   */
     @ApiTags('User Module')
     @ApiOperation({ summary: 'Get User Details with given Wallet Address' })
     @ApiResponse({
       status: ResponseStatusCode.NOT_FOUND,
       description: ResponseMessage.USER_DOES_NOT_EXISTS_WITH_GIVEN_WALLET_ADDRESS,
     })
     @ApiResponse({ status: ResponseStatusCode.OK, description: 'User Details' })
     @ApiResponse({
       status: ResponseStatusCode.INTERNAL_SERVER_ERROR,
       description: ResponseMessage.INTERNAL_SERVER_ERROR,
     })
     @Get('/userdetails/walletaddress/:walletAddress')
     async getUserDetailsByWalletAddress(
       @Param('walletAddress') walletAddress: string,
     ): Promise<any> {
       try {
         const user: User = await this.userService.findUserDetails(
           walletAddress,
         );
         if (!user) {
           return this.responseModel.response(
             ResponseMessage.USER_DOES_NOT_EXISTS_WITH_GIVEN_WALLET_ADDRESS,
             ResponseStatusCode.NOT_FOUND,
             false,
           );
         } else {
           return this.responseModel.response(user, ResponseStatusCode.OK, true);
         }
       } catch (error) {
         return this.responseModel.response(
           error,
           ResponseStatusCode.INTERNAL_SERVER_ERROR,
           false,
         );
       }
     }
}
