import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseModel {
  response(message: any, status: number, success: boolean) {
    return {
      message,
      success,
      status,
    };
  }
}
