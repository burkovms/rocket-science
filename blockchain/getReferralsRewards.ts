import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';

export type TGetReferralsRewards = {
  address: string;
  contract: Contract;
};

export type TReferrals = {
  user: string;
  amount: BigNumber;
  timestamp: number;
};

export const getReferralsRewards = async (
  payload: TGetReferralsRewards
): Promise<TReferrals[]> => {
  const { address, contract } = payload;

  const referrals = await contract.methods.getWithdrawals(address).call();

  const result: TReferrals[] = referrals.map((item: any) => ({
    user: item.user,
    amount: new BigNumber(item.amount),
    timestamp: new BigNumber(item.timestamp).multipliedBy(1000).toNumber(),
  }));

  return result.sort((a: any, b: any) => b.timestamp - a.timestamp);
};

export const updateTReferrals = (
  tWitdrawals: Omit<TReferrals, 'amount'>,
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
