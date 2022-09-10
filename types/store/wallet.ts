import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { Contract } from 'web3-eth-contract';

export type WalletProvider = () => any;
export type MarketContractInstance = () => Contract | undefined;
export interface WalletContractsInterface {
  marketInstance: MarketContractInstance;
  marketInstanceNew: MarketContractInstance;
}
export interface WalletData {
  BNB: number | string;
  address: string;
}
export interface ConnectWalletOptions {
  toggleModal: boolean;
  idConnect: string;
}
export interface ContractInfo {
  totalInvested?: string;
  investors?: number | string;
  contractDays?: number | string;
}

export type initialWalletState = {
  appMode: string | null;
  defaultProvider: string;
  provider: WalletProvider;
  contractAddress: string;
  contractAddressNew: string;
  contractOwnerAddress: string[];
  contracts: WalletContractsInterface;
  contracInfo: ContractInfo;
  web3: () => Web3 | undefined;
  web3Modal?: Web3Modal;
  providerName: string;
  walletData: WalletData;
  refWalletAddress: string;
  networkId: number | null;
  isMetamaskAvailable: boolean;
  isWalletConnectAvailable: boolean;
  isBinanceSmartChainWalletAvailable: boolean;
  metamaskInstallationLink: string;
  binanceSmartChainInstallationLink: string;
};
