import { Controller, Get, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('Dashboard')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * @description api to check status of platform
   * @returns Httpstatus 200 OK response
   * This is to check health of app
   */
  @Get()
  @ApiOkResponse({ description: 'checks health of app' })
  healthCheck(): Promise<any> {
    return this.appService.healthCheck();
  }

  @Post('jungle_check')
  csrfCheck(): string {
    return 'Welcome to the jungle';
  }
}
