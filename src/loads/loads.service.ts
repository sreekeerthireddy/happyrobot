import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { LoadReq, LoadRes } from './loads.dto';
import { encode } from '@aashari/nodejs-geocoding';
const chrono = require('chrono-node');

@Injectable()
export class LoadsService {
  private prisma = new PrismaClient();

  private async geocode(query: string): Promise<{ lat: number; lon: number }> {
    const results = await encode(query);
    if (!results || results.length === 0) {
      throw new BadRequestException(`Unable to geocode: ${query}`);
    }
    const loc = results[0];
    if (loc.latitude == null || loc.longitude == null) {
      throw new BadRequestException(`Incomplete geocoding data for: ${query}`);
    }
    return { lat: loc.latitude, lon: loc.longitude };
  }

  async getLoadDetails(request: LoadReq): Promise<LoadRes> {
    try {
      const { origin, destination, pickupDatetime, equipmentType } = request;
      if (!origin || !pickupDatetime || !equipmentType) {
        throw new Error(
          'origin, pickupDatetime, and equipmentType are required',
        );
      }

      // 1. Geocode origin
      const { lat: carrierLat, lon: carrierLng } = await this.geocode(origin);
      const { deltaLat, deltaLng } = ((): {
        deltaLat: number;
        deltaLng: number;
      } => {
        const dLat = 50 / 69;
        const dLng = 50 / (Math.cos((carrierLat * Math.PI) / 180) * 69);
        return { deltaLat: dLat, deltaLng: dLng };
      })();

      // 2. Parse pickup time as UTC
      const dtLocal = chrono.parseDate(pickupDatetime as string);
      if (!dtLocal)
        throw new Error(`Unable to parse pickupDatetime: ${pickupDatetime}`);
      const pickupDate = new Date(
        Date.UTC(
          dtLocal.getFullYear(),
          dtLocal.getMonth(),
          dtLocal.getDate(),
          dtLocal.getHours(),
          dtLocal.getMinutes(),
          dtLocal.getSeconds(),
          dtLocal.getMilliseconds(),
        ),
      );
      const maxPickupDate = new Date(pickupDate.getTime() + 6 * 60 * 60 * 1000);

      // 3. Build Prisma filter
      const where: any = {
        equipment_type: equipmentType,
        originLat: { gte: carrierLat - deltaLat, lte: carrierLat + deltaLat },
        originLng: { gte: carrierLng - deltaLng, lte: carrierLng + deltaLng },
        pickup_datetime: { gte: pickupDate, lte: maxPickupDate },
      };
      if (destination) {
        const { lat: destLat, lon: destLng } = await this.geocode(destination);
        where.destinationLat = {
          gte: destLat - deltaLat,
          lte: destLat + deltaLat,
        };
        where.destinationLng = {
          gte: destLng - deltaLng,
          lte: destLng + deltaLng,
        };
      }

      // 4. Query and score
      const candidates = await this.prisma.load.findMany({ where });
      const scored = candidates
        .filter((l) => l.originLat != null && l.originLng != null)
        .map((load) => {
          const toRad = (d: number) => (d * Math.PI) / 180;
          const R = 3959;
          const dLat = toRad(load.originLat! - carrierLat);
          const dLng = toRad(load.originLng! - carrierLng);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(carrierLat)) *
              Math.cos(toRad(load.originLat!)) *
              Math.sin(dLng / 2) ** 2;
          const dist = 2 * R * Math.asin(Math.sqrt(a));
          return { load, dist };
        })
        .filter((item) => item.dist <= 50)
        .sort(
          (a, b) =>
            a.dist - b.dist ||
            a.load.pickup_datetime.getTime() - b.load.pickup_datetime.getTime(),
        );

      if (!scored.length) {
        return {
          status: false,
          data: null,
          message: 'No load found with the given criteria',
        };
      }
      // Map Prisma Load record to API-friendly DTO
      const best = scored[0].load;
      return {
        status: true,
        data: {
          id: best.id,
          origin: best.origin,
          destination: best.destination,
          pickupDatetime: best.pickup_datetime.toISOString(),
          deliveryDatetime: best.delivery_datetime.toISOString(),
          equipmentType: best.equipment_type,
          loadboardRate: best.loadboard_rate,
          notes: best.notes,
          weight: best.weight,
          commodityType: best.commodity_type,
          numOfPieces: best.num_of_pieces,
          miles: best.miles,
          dimensions: best.dimensions,
        },
        message: 'A matching load found',
      };
    } catch (err) {
      return {
        status: false,
        error: err instanceof Error ? err.message : 'Unexpected error',
        message: 'Load details failed',
        data: null,
      };
    }
  }
}
