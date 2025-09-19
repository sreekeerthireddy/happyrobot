export interface LoadReq {
  origin: string;
  destination: string;
  pickupDatetime: string;
  deliveryDatetime?: string;
  equipmentType: string;
}

export interface LoadRes {
  status: boolean;
  data?: {
    id: string;
    origin: string;
    destination: string;
    pickupDatetime: string;
    deliveryDatetime?: string;
    equipmentType: string;
    loadboardRate: number;
    notes: string;
    weight: number;
    commodityType: string;
    numOfPieces: number;
    miles: number;
    dimensions: string;
  } | null;
  error?: string;
  message?: string;
}
