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
  Patch,
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
import { UpdateUserDto } from './dto/update-user.dto';

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
  ): Promise<User> {
    try {
      // authenticating wallet signature 
      // const verifiedSignature = await this.userService.signatureAuth({
      //   wallet_address: createUserLoginDto.walletAddress,
      //   signature: createUserLoginDto.signature,
      //   signature_message: createUserLoginDto.signature_message,
      // });
      // if (!verifiedSignature) throw new UnauthorizedException();

      // if user then login else create user
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

        return details;
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

        return details; 
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiTags('User Module')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logOut(@Request() request): Promise<object> {
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
      throw new Error(error);
    }
  }

  /**
  * @description getUserDetailsByWalletAddress will fetch the user details with given wallet address
  * @param createUserDto
  * @returns it will return user details
  */
  @ApiTags('User Module')
  @ApiOperation({ summary: 'Get User Details with given Wallet Address' })
  @ApiResponse({ status: ResponseStatusCode.OK, description: 'User Details' })
  @ApiResponse({
    status: ResponseStatusCode.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR,
  })
  @Get('/walletaddress/:walletAddress')
  async getUserDetailsByWalletAddress(
      @Param('walletAddress') walletAddress: string,
      @Request() request,
    ): Promise<User> {
      try {
        const user: User = await this.userService.findUserDetails(
          walletAddress,
        );
        return user
      } catch (error) {
        throw new Error(error);
      }
  }

  /**
  * @description updateUser will update the user details
  * @param UpdateUserDto
  * @returns it will return user details
  */
  @Patch('/update')
  @UseGuards(JwtAuthGuard)
  @ApiTags('User Module')
  @ApiOperation({ summary: 'Update User Details who is currenlty Logged In' })
  @ApiResponse({
    status: ResponseStatusCode.OK,
    description: ResponseMessage.USER_DETAILS,
  })
  @ApiResponse({
    status: ResponseStatusCode.INTERNAL_SERVER_ERROR,
    description: ResponseMessage.INTERNAL_SERVER_ERROR,
  })
  @ApiBearerAuth()
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() request,
    ): Promise<string> {
    try {
      const authorization = await this.authService.validateUserToken(
        request.headers.authorization.replace('Bearer ', ''),
        request.user.walletAddress,
        request.user.userType,
      );
  
      if (!authorization) {
        throw new UnauthorizedException('Unauthorized');
      }
   
      const data = await this.userService.updateUser(
        request.user.walletAddress,
        updateUserDto,
      );
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
   
}
