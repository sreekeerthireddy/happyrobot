// no exceptions thrown; unified return style
import { VerifyReq, VerifyRes } from './verfiy.dto';
import axios from 'axios';

export class VerifyService {
  async verifyMc(request: VerifyReq): Promise<VerifyRes> {
    try {
      const { mc } = request;
      if (!mc) {
        throw new Error('MC is required');
      }
      const baseUrl =
        'https://mobile.fmcsa.dot.gov/qc/services/carriers/docket-number/';
      const webKey = process.env.FMCSA_WEBKEY ?? '';
      const url = new URL(`${baseUrl}${mc}`);
      url.searchParams.set('webKey', webKey);
      const response = await axios.get(url.toString(), { timeout: 10000 });
      const carrier = response.data.content?.[0]?.carrier;
      if (!carrier) {
        throw new Error('Carrier data not found');
      }
      return {
        status: true,
        data: {
          allowedToOperate: carrier.allowedToOperate,
          name: carrier.legalName,
          dbaName: carrier.dbaName,
          dotNumber: carrier.dotNumber,
          mcNumber: mc,
        },
        message: 'MC verified successfully',
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unexpected error';
      return {
        status: false,
        error: msg,
        message: 'MC verification failed',
      };
    }
  }
}
