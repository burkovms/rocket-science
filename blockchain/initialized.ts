import { Contract } from 'web3-eth-contract';

export type TInitialized = {
  contract: Contract;
  address: string;
};

export const initialized = async (payload: TInitialized): Promise<boolean> => {
  const { contract, address } = payload;

  return await contract.methods.initialized(address).call();
};
