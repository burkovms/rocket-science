import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

export enum ActivePacketsLevelStringEnum {
  ten = '1 cosmic speed',
  fifteen = '2 cosmic speed',
  twenty = '3 cosmic speed',
  thirtyFive = 'light speed',
}

export enum ActivePacketsLevelValueEnum {
  ten = 10,
  fifteen = 15,
  twenty = 20,
  thirtyFive = 35,
}

export type TActivePackets = {
  contract: Contract;
  address: string;
};

export type TActivePacketsResponse = {
  startTime: number;
  finishTime: number;
  id: string;
  invested: BigNumber;
  paid: BigNumber;
  level?: number;
  pType?: number;
  packetLifetime?: number;
};

export const getActivePackets = async (
  payload: TActivePackets
): Promise<Array<any>> => {
  const { contract, address } = payload;

  const _packets = await contract.methods.getActivePackets(address).call();
  const activePackets: TActivePacketsResponse[] = _packets.map(
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
  return activePackets;
};
