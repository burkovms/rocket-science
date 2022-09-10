import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

export type TInvest = {
  investProps: string;
  contract: Contract;
  contractAddress: string;
  web3: Web3;
  address: string;
  value: any;
};

export const invest = (payload: TInvest) => {
  const { investProps, contract, contractAddress, web3, address, value } =
    payload;
  const data = contract.methods.invest(investProps).encodeABI();
  return contract.methods.invest(investProps).send({
    from: address,
    to: contractAddress,
    value: web3.utils.toHex(value),
    data,
  });
};
