import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';
import { ModalDataEnum, ModalDataValueEnum } from '~/types/enum';

export type TGetWithdrawals = {
  address: string;
  contract: Contract;
};

export type TWitdrawals = {
  name: string;
  amount: BigNumber;
  timestamp: number;
};

export const getWithdrawals = async (
  payload: TGetWithdrawals
): Promise<TWitdrawals[]> => {
  const { address, contract } = payload;

  const witdrawals = await contract.methods.getWithdrawals(address).call();

  const result: TWitdrawals[] = witdrawals.map((item: any) => ({
    name:
      item.t === ModalDataEnum.referral
        ? ModalDataValueEnum.referral
        : item.t === ModalDataEnum.profit
        ? ModalDataValueEnum.profit
        : '',
    amount: new BigNumber(item.amount),
    timestamp: new BigNumber(item.timestamp).multipliedBy(1000).toNumber(),
  }));

  return result.sort((a: any, b: any) => b.timestamp - a.timestamp);
};

export const updateTWitdrawals = (
  tWitdrawals: Omit<TWitdrawals, 'amount'>,
  amount: BigNumber,
  getBalance: (
    balance: BigNumber,
    displayDecimals: number,
    decimals: number
  ) => string
) => {
  const _amount = getBalance(amount, 6, 18);

  return { ...tWitdrawals, amount: _amount };
};
