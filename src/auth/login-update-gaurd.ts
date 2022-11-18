import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = this.validateToken(request);

    if (!authorization) {
      throw new UnauthorizedException("Unauthorized");
    }

    return true;
  }
  validateToken = async (request) => {
    const authorization = await this.authService.validateUserToken(
      request.headers.authorization.replace("Bearer ", ""),
      request.user.walletAddress,
      request.user.userType
    );
  };
}
