import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  NegotiateReq,
  NegotiateRes,
  CounterOfferReq,
  CounterOfferRes,
  NegotiateStatus,
} from './negotiate.dto';

@Injectable()
export class NegotiateService {
  private prisma = new PrismaClient();

  // Carrier’s first counter-offer starts or accepts immediately
  async makeNegotiation(request: NegotiateReq): Promise<NegotiateRes> {
    try {
      const { loadId, mcNumber, proposedRate } = request;
      // 1. Validate load exists
      const load = await this.prisma.load.findUnique({ where: { id: loadId } });
      if (!load) {
        throw new BadRequestException('Load not found');
      }
      const maxRate = load.loadboard_rate;
      // create negotiation session with carrier's initial ask
      let session = await this.prisma.negotiation.create({
        data: {
          loadId,
          mcNumber,
          currentRound: 1,
          carrierLastProposed: proposedRate,
          serverLastProposed: maxRate,
          agreedRate: proposedRate <= maxRate ? proposedRate : null,
          status:
            proposedRate <= maxRate
              ? NegotiateStatus.ACCEPTED
              : NegotiateStatus.PENDING,
        },
      });
      // immediate acceptance
      if (session.status === NegotiateStatus.ACCEPTED) {
        return {
          status: true,
          message: 'Negotiation started successfully',
          data: {
            negotiationId: session.id,
            status: session.status as NegotiateStatus,
            carrierLastProposed: session.carrierLastProposed!,
            serverLastProposed: session.serverLastProposed!,
            agreedRate: session.agreedRate!,
            round: 1,
            roundsLeft: 0,
          },
        };
      }
      // server counter-offer
      const counter = (proposedRate + maxRate) / 2;
      session = await this.prisma.negotiation.update({
        where: { id: session.id },
        data: {
          currentRound: 1,
          carrierLastProposed: proposedRate,
          serverLastProposed: counter,
        },
      });
      return {
        status: true,
        message: 'Negotiation started successfully',
        data: {
          negotiationId: session.id,
          status: session.status as NegotiateStatus,
          carrierLastProposed: session.carrierLastProposed!,
          serverLastProposed: session.serverLastProposed!,
          agreedRate: session.agreedRate ?? undefined,
          round: 1,
          roundsLeft: 2,
        },
      };
    } catch (error) {
      return {
        status: false,
        error: error.message,
        message: 'Negotiation failed',
        data: undefined,
      };
    }
  }

  // Carrier’s follow-up counter-offers or acceptance in round 2/3
  async makeCounterOffer(request: CounterOfferReq): Promise<CounterOfferRes> {
    try {
      const { negotiateId, proposedRate, accepted } = request;
      // 1. Load session
      const session = await this.prisma.negotiation.findUnique({
        where: { id: negotiateId },
      });
      if (!session) {
        throw new BadRequestException('Negotiation session not found');
      }
      if (session.status !== NegotiateStatus.PENDING) {
        throw new BadRequestException('Negotiation already closed');
      }
      // fetch the referenced load and ensure it exists
      const targetLoad = await this.prisma.load.findUnique({
        where: { id: session.loadId },
      });
      if (!targetLoad) {
        throw new BadRequestException('Referenced load not found');
      }
      const maxRate = targetLoad.loadboard_rate;
      let newRound = session.currentRound + 1;
      // 2. Accept path
      if (accepted) {
        // carrier accepts server's last offer
        const updated = await this.prisma.negotiation.update({
          where: { id: negotiateId },
          data: {
            currentRound: newRound,
            status: NegotiateStatus.ACCEPTED,
            agreedRate: session.serverLastProposed,
          },
        });
        return {
          status: true,
          message: 'Offer accepted',
          data: {
            negotiationId: negotiateId,
            status: updated.status as NegotiateStatus,
            carrierLastProposed: updated.carrierLastProposed!,
            serverLastProposed: updated.serverLastProposed!,
            agreedRate: updated.agreedRate!,
            round: newRound,
            roundsLeft: 3 - newRound,
          },
        };
      }
      // 3. Check if max rounds exceeded
      if (newRound > 3) {
        await this.prisma.negotiation.update({
          where: { id: negotiateId },
          data: { status: NegotiateStatus.REJECTED },
        });
        return {
          status: true,
          message: 'Offer rejected due to max rounds exceeded',
          data: {
            negotiationId: negotiateId,
            status: NegotiateStatus.REJECTED,
            carrierLastProposed: session.carrierLastProposed!,
            serverLastProposed: session.serverLastProposed!,
            agreedRate: undefined,
            round: session.currentRound,
            roundsLeft: 0,
          },
        };
      }
      // 4. Counter path: compute new counter
      // server responds with next counter
      const counter = (session.serverLastProposed! + proposedRate!) / 2;
      const updated = await this.prisma.negotiation.update({
        where: { id: negotiateId },
        data: {
          currentRound: newRound,
          carrierLastProposed: proposedRate,
          serverLastProposed: counter,
        },
      });
      const roundsLeft = 3 - newRound;
      return {
        status: true,
        message: 'Counter offer made successfully',
        data: {
          negotiationId: negotiateId,
          status: updated.status as NegotiateStatus,
          carrierLastProposed: updated.carrierLastProposed!,
          serverLastProposed: updated.serverLastProposed!,
          agreedRate: updated.agreedRate ?? undefined,
          round: newRound,
          roundsLeft,
        },
      };
    } catch (error) {
      return {
        status: false,
        error: error.message,
        message: 'Counter offer closed',
        data: undefined,
      };
    }
  }
}
