import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

export type TRefRewards = {
  contract: Contract;
  address: string;
};

export const refRewards = async (payload: TRefRewards): Promise<BigNumber> => {
  const { contract, address } = payload;
  return !address
    ? new BigNumber(0)
    : new BigNumber(await contract.methods.refRewards(address).call());
};
