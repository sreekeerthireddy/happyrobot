export enum NegotiateStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface NegotiateReq {
  loadId: string;
  mcNumber: string;
  proposedRate: number;
}

export interface NegotiateRes {
  status: boolean;
  message?: string;
  data?: {
    negotiationId: string;
    status: NegotiateStatus;
    carrierLastProposed?: number;
    serverLastProposed?: number;
    agreedRate?: number;
    round: number;
    roundsLeft: number;
    message?: string;
  };
  error?: string;
}

export interface CounterOfferReq {
  negotiateId: string;
  proposedRate?: number | null;
  accepted: boolean;
}

export interface CounterOfferRes {
  status: boolean;
  message?: string;
  data?: {
    negotiationId: string;
    status: NegotiateStatus;
    carrierLastProposed?: number;
    serverLastProposed?: number;
    agreedRate?: number;
    round: number;
    roundsLeft: number;
    message?: string;
  };
  error?: string;
}
