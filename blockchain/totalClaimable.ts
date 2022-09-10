import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';
import { AbiEnum } from '~/types/enum/abi.enum';

export type TTotalClaimable = {
  contract: Contract;
  id: string;
  user: string;
};

export const totalClaimable = async (
  payload: TTotalClaimable
): Promise<BigNumber> => {
  const { contract, id, user } = payload;
  const totalClaimable = await contract.methods[AbiEnum.totalClaimable](
    id,
    user
  ).call();
  return new BigNumber(totalClaimable);
};
