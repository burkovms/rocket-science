import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

export const dailyWithdrawed = async (contract: Contract): Promise<BigNumber> =>
  new BigNumber(await contract.methods.dailyWithdrawed().call());
