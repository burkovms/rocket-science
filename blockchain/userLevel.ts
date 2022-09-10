import { Contract } from 'web3-eth-contract';

export type TUserLevel = {
  contract: Contract;
  address: string;
};

export const userLevel = async (
  payload: TUserLevel
): Promise<string | null> => {
  const { contract, address } = payload;
  return !address ? null : await contract.methods.userLevel(address).call();
};
