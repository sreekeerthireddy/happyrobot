import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'];
    if (!key || !process.env.API_KEY || key !== process.env.API_KEY) {
      console.log('key is ...', key);
      console.log('process.env.API_KEY is ...', process.env.API_KEY);
      throw new UnauthorizedException('Unauthorized - Inavlid API Key');
    }
    return true;
  }
}
