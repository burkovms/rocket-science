import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

export type TCompletedPackets = {
  contract: Contract;
  address: string;
};

export type TCompletedPacketsResponse = {
  startTime: number;
  finishTime: number;
  id: string;
  invested: BigNumber;
  paid: BigNumber;
  level?: number;
  pType?: number;
  packetLifetime?: number;
};

export const getCompletedPackets = async (
  payload: TCompletedPackets
): Promise<Array<any>> => {
  const { contract, address } = payload;
  const _packets = await contract.methods.getCompletedPackets(address).call();
  const completedPackets: TCompletedPacketsResponse[] = _packets.map(
    (packet: any) => {
      return {
        startTime: new BigNumber(packet.startTime)
          .multipliedBy(1000)
          .toNumber(),
        finishTime: new BigNumber(packet.finishTime)
          .multipliedBy(1000)
          .toNumber(),
        id: packet.id,
        invested: new BigNumber(packet.invested),
        paid: new BigNumber(packet.paid),
        level: parseInt(packet.level),
        pType: parseInt(packet.pType),
        packetLifetime: parseInt(packet.packetLifetime),
      };
    }
  );
  return completedPackets;
};
