export interface VerifyReq {
  mc: string;
}

export interface VerifyRes {
  status: boolean;
  data?: {
    allowedToOperate: string;
    name: string;
    dbaName: string;
    dotNumber: number;
    mcNumber: string;
  };
  message?: string;
  error?: string;
}
