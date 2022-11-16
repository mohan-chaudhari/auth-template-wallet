import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async healthCheck(): Promise<any> {
    return { status: HttpStatus.OK };
  }
}
