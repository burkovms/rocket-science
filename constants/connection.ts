import WalletConnectProvider from '@walletconnect/web3-provider';
import { IProviderOptions } from 'web3modal/dist/helpers/types';
import { AppModeEnum } from '~/types/enum/store';

const provider = {
  mainnet: 'https://bsc-dataseed.binance.org',
  testnet: 'https://data-seed-prebsc-1-s3.binance.org:8545',
};

const contractOwnerAddress = [
  '0x9b74FDe50F3FcD3A02FaFEA6A187092630D6EB8f',
  '0xe1c50D6B319D1AAE13FF8261FaEe8aA591AE23aD',
];

const metamaskInstallationLink = {
  ios: 'https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202',
  android: 'https://play.google.com/store/apps/details?id=io.metamask',
  desktop: 'https://metamask.io/download.html',
};

const binanceSmartChainInstallationLink = {
  ios: 'https://apps.apple.com/app/apple-store/id1288339409',
  android: 'https://trustwallet.com/dl/apk',
  desktop:
    'https://chrome.google.com/webstore/detail/binance-chain-wallet/fhbohimaelbohpjbbldcngcnapndodjp',
};

const installationLinks = {
  metamask: metamaskInstallationLink,
  bsc: binanceSmartChainInstallationLink,
};

const customWalletConnect = {
  walletconnect: 'walletconnect',
  metamask: 'custom-metamask-wallet',
  binanceSmartChain: 'custom-binanceSmartChain-wallet',
};

const providerOptions = (
  infuraId: string,
  networkId: number,
  appMode: string
): IProviderOptions => {
  return {
    [customWalletConnect.walletconnect]: {
      package: WalletConnectProvider,
      options: {
        infuraId,
        chainId: networkId,
        bridge: 'https://bridge.walletconnect.org',
        rpc: {
          [networkId]:
            appMode === AppModeEnum.development
              ? provider.testnet
              : provider.mainnet,
        },
      },
    },
    [customWalletConnect.metamask]: {
      display: {
        logo: '',
        name: 'MetaMask',
        description: 'Connect to your Metamask wallet',
      },
      package: null, // for metamask
      connector: async (_, _options) => {
        let provider = null;
        if (typeof window.ethereum !== 'undefined') {
          await window.ethereum.enable();
          provider = window.ethereum;
        } else if (window.web3) {
          provider = window.web3.currentProvider;
        } else {
          throw new Error('No Web3 Provider found');
        }
        return Promise.resolve(provider);
      },
    },
    [customWalletConnect.binanceSmartChain]: {
      display: {
        logo: '',
        name: 'Binance Chain Wallet',
        description: 'Connect to your Binance Chain Wallet',
      },
      package: true,
      connector: async () => {
        let provider = null;
        if (typeof window.BinanceChain !== 'undefined') {
          provider = window.BinanceChain;
          try {
            await provider.request({ method: 'eth_requestAccounts' });
          } catch (error) {
            throw new Error('User Rejected');
          }
        } else {
          throw new TypeError('No Binance Chain Wallet found');
        }
        return provider;
      },
    },
  };
};

export {
  provider,
  contractOwnerAddress,
  providerOptions,
  customWalletConnect,
  installationLinks,
};
