import { Contract } from 'web3-eth-contract';

export type TGetReferralRewards = {
  address: string;
  contract: Contract;
  contractAddress: string;
};

export const getReferralRewards = (payload: TGetReferralRewards) => {
  const { address, contractAddress, contract } = payload;
  const data = contract.methods.getReferralRewards().encodeABI();

  return contract.methods.getReferralRewards().send({
    from: address,
    to: contractAddress,
    data,
  });
};
