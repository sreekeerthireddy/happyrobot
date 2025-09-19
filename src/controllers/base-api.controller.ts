import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
export class BaseApiController {
  // any shared methods for apis

  protected getCurrentApiKey(request: any): String {
    return request.apiKey;
  }
}
