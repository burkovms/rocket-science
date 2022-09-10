import { Contract } from 'web3-eth-contract';

export type TTakeInvestment = {
  id: string;
  address: string;
  contract: Contract;
  contractAddress: string;
};

export const takeInvestment = (payload: TTakeInvestment) => {
  const { id, address, contractAddress, contract } = payload;
  const data = contract.methods.takeInvestment(id).encodeABI();

  return contract.methods.takeInvestment(id).send({
    from: address,
    to: contractAddress,
    data,
  });
};
