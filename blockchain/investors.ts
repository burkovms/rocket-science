import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

export type TInvestors = {
  contract: Contract;
  address: string;
};

export type TInvestorsResponse = {
  earned: BigNumber;
  refReward: BigNumber;
  referrer: string;
  refs: number;
  totalInvested: BigNumber;
};

export const investors = async (
  payload: TInvestors
): Promise<TInvestorsResponse> => {
  const { contract, address } = payload;

  if (!address) {
    return {
      earned: new BigNumber(0),
      refReward: new BigNumber(0),
      referrer: '',
      refs: 0,
      totalInvested: new BigNumber(0),
    };
  } else {
    const { earned, refReward, referrer, refs, totalInvested } =
      await contract.methods.investors(address).call();
    const result: TInvestorsResponse = {
      earned: new BigNumber(earned),
      refReward: new BigNumber(refReward),
      referrer,
      refs: parseInt(refs),
      totalInvested: new BigNumber(totalInvested),
    };
    return result;
  }
};
