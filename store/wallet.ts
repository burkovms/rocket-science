/* eslint-disable no-console */
// eslint-disable-next-line import/named
import { GetterTree, MutationTree, ActionTree } from 'vuex';
import Web3 from 'web3';
import Web3Modal from 'web3modal';
import { Device } from '@nuxtjs/device';
import { Contract } from 'web3-eth-contract';
import { RootState } from '.';
import {
  abi,
  abiNew,
  provider,
  providerOptions,
  contractOwnerAddress,
  installationLinks,
  customWalletConnect,
} from '~/constants';
import {
  ConnectWalletOptions,
  ContractInfo,
  initialWalletState,
  WalletData,
} from '~/types/store';
import { WalletMutationsEnum } from '~/types/enum/store/wallet/mutations.enum';
import { WalletActionsEnum } from '~/types/enum/store/wallet/actions.enum';
import { ProviderListenerEnum } from '~/types/enum/store/wallet/providerListener.enum';
import { WalletGettersEnum } from '~/types/enum/store/wallet/getters.enum';
import { AppModeEnum } from '~/types/enum/store';
import { userLevel } from '~/blockchain';

declare let window: any;
// @ts-ignore
const initialState: initialWalletState = {
  appMode: null,
  defaultProvider: '',
  provider: () => null,
  contractAddress: '',
  contractAddressNew: '',
  contractOwnerAddress,
  contracts: {
    marketInstance: () => undefined,
    marketInstanceNew: () => undefined,
  },
  contracInfo: {
    totalInvested: '0',
    investors: 0,
    contractDays: 0,
  },
  web3: () => undefined,
  providerName: '',
  walletData: {
    BNB: 0,
    address: '',
  },
  refWalletAddress: '',
  networkId: null,
  isMetamaskAvailable: false,
  isWalletConnectAvailable: false,
  isBinanceSmartChainWalletAvailable: false,
  metamaskInstallationLink: '',
  binanceSmartChainInstallationLink: '',
};

export const state = () => initialState;

export type WalletState = ReturnType<typeof state>;

export const getters: GetterTree<WalletState, RootState> = {
  appMode(state): string {
    return state.appMode!;
  },
  defaultProvider(state): string {
    return state.defaultProvider;
  },
  provider(state): () => any {
    return state.provider;
  },
  ballance(state): number | string {
    return state.walletData.BNB;
  },
  contracts(state) {
    return state.contracts;
  },
  contractInstance(state): () => any | null {
    return state.contracts?.marketInstance;
  },
  contractInstanceNew(state): () => any | null {
    return state.contracts?.marketInstanceNew;
  },
  contractAddress(state): string {
    return state.contractAddress;
  },
  contractAddressNew(state): string {
    return state.contractAddressNew;
  },
  contractOwnerAddress(state): string[] {
    return state.contractOwnerAddress;
  },
  contracInfo(state): ContractInfo {
    return state.contracInfo;
  },
  web3(state): () => Web3 | undefined {
    return state.web3;
  },
  walletAddress(state): string {
    return (state.walletData.address || '').toLowerCase();
  },
  walletAddressSlice(state): string {
    return state.walletData.address?.slice(2) || '';
  },
  refWalletAddress(state): string {
    return state.refWalletAddress;
  },
  metamaskInstallationLink(state): string {
    return state.metamaskInstallationLink;
  },
  binanceSmartChainInstallationLink(state): string {
    return state.binanceSmartChainInstallationLink;
  },
  isMetamaskInstalled(_state): boolean {
    return Boolean(
      process.browser && window?.ethereum && window.ethereum.isMetaMask
    );
  },
  isBinanceSmartChainInstalled(_state): boolean {
    const isConnected = async () => {
      await window.BinanceChain.isConnected();
    };

    return Boolean(process.browser && window?.BinanceChain && isConnected());
  },
  isMetamaskAvailable(state): boolean {
    return state.isMetamaskAvailable;
  },
  isBinanceSmartChainWalletAvailable(state): boolean {
    return state.isBinanceSmartChainWalletAvailable;
  },
  isWalletConnectAvailable(state): boolean {
    return state.isWalletConnectAvailable;
  },
};

export const mutations: MutationTree<WalletState> = {
  SET_WALLET_STATE(state, data: Partial<initialWalletState>) {
    Object.assign(state, data);
  },
  SET_APP_MODE(state, appMode) {
    state.appMode = appMode;
  },
  SET_CONTRACT_ADDRESS(state, addressContract: string) {
    state.contractAddress = addressContract;
  },
  SET_CONTRACT_ADDRESS_NEW(state, addressContract: string) {
    state.contractAddressNew = addressContract;
  },
  SET_CONTRACT_INFO(state, data: Partial<ContractInfo>) {
    Object.assign(state.contracInfo, data);
  },
  SET_WEB3(state, web3: () => Web3 | undefined) {
    Object.assign(state, { web3 });

    const Contract = web3()?.eth.Contract;

    if (Contract) {
      const marketContract = new Contract(
        abi,
        (this.$config as any).marketContract
      );
      const marketContractNew = new Contract(
        abiNew,
        (this.$config as any).marketContractNew
      );
      Object.assign(state.contracts, {
        marketInstance: () => marketContract,
        marketInstanceNew: () => marketContractNew,
      });
    }
  },
  SET_WEB3_MODAL(state) {
    state.web3Modal = new Web3Modal({
      cacheProvider: false,
      disableInjectedProvider: false,
      providerOptions: providerOptions(
        (this.$config as any).infuraId,
        (this.$config as any).networkId,
        state.appMode!
      ),
    });
  },
  SET_NETWORK_ID(state, networkId: number) {
    state.networkId = networkId;
  },
  SET_WALLET_DATA(state, data: Partial<WalletData>) {
    Object.assign(state.walletData, { ...data });
  },
  SET_REF_WALLET_DATA(state, refWalletAddress: string) {
    state.refWalletAddress = refWalletAddress;
  },
  SET_PROVIDER_NAME(state, providerName: string) {
    state.providerName = providerName;
  },
  SET_METAMASK_INSTALLATION_LINK(state, device: Device) {
    state.metamaskInstallationLink = '';
    if (device.isAndroid) {
      state.metamaskInstallationLink = installationLinks.metamask.android;
    }
    if (device.isIos) {
      state.metamaskInstallationLink = installationLinks.metamask.ios;
    }
    if (device.isDesktop) {
      state.metamaskInstallationLink = installationLinks.metamask.desktop;
    }
  },
  SET_BINANCE_SMART_CHAIN_INSTALLATION_LINK(state, device: Device) {
    state.binanceSmartChainInstallationLink = '';
    if (device.isAndroid) {
      state.binanceSmartChainInstallationLink = installationLinks.bsc.android;
    }
    if (device.isIos) {
      state.metamaskInstallationLink = installationLinks.bsc.ios;
    }
    if (device.isDesktop) {
      state.metamaskInstallationLink = installationLinks.bsc.desktop;
    }
  },
  RESET_WALLET_STATE(state) {
    state.provider = () => null;
    state.contractAddress = '';
    state.contractAddressNew = '';
    state.contracts = {
      marketInstance: () => undefined,
      marketInstanceNew: () => undefined,
    };
    state.web3 = () => undefined;
    state.providerName = '';
    state.walletData = {
      BNB: 0,
      address: '',
    };
    state.refWalletAddress = '';
  },
};

export const actions: ActionTree<WalletState, RootState> = {
  initWeb3Modal({ commit }) {
    commit(WalletMutationsEnum.SET_WEB3_MODAL);
  },
  async initConnect({ commit, getters }) {
    commit(WalletMutationsEnum.SET_APP_MODE, window.$nuxt.context.$config.mode);
    commit(
      WalletMutationsEnum.SET_CONTRACT_ADDRESS,
      // @ts-ignore
      (this.$config as any).marketContract
    );
    commit(
      WalletMutationsEnum.SET_CONTRACT_ADDRESS_NEW,
      // @ts-ignore
      (this.$config as any).marketContractNew
    );
    const defaultProvider =
      getters.appMode === AppModeEnum.development
        ? provider.testnet
        : provider.mainnet;

    commit(WalletMutationsEnum.SET_WALLET_STATE, {
      defaultProvider,
    });

    const web3 = new Web3(defaultProvider);

    commit(WalletMutationsEnum.SET_WEB3, () => web3);

    const networkId = await web3.eth.getChainId();

    commit(WalletMutationsEnum.SET_NETWORK_ID, networkId);
  },

  async connectWallet(
    { state, commit, dispatch, getters },
    data: ConnectWalletOptions
  ) {
    const { toggleModal, idConnect } = data;
    const httpProvider: string = getters.defaultProvider;

    if (!state.web3Modal) {
      await dispatch(WalletActionsEnum.initWeb3Modal);
    }
    if (!state.web3Modal) return;

    let provider: any;

    try {
      provider = await state.web3Modal.connectTo(idConnect);

      if (toggleModal) {
        await state.web3Modal.toggleModal();
      }
      if (provider.enable) {
        await provider.enable();
      }
    } catch (error) {
      console.error('Could not get a wallet connection', error);
      return;
    }

    if (provider.wc) {
      const connector = provider.wc;
      if (!connector.connected) {
        try {
          await connector.createSession();
        } catch (error) {
          console.log('Create new session', error);
        }
      }
    }

    commit(WalletMutationsEnum.SET_PROVIDER_NAME, idConnect);
    commit(WalletMutationsEnum.SET_WALLET_STATE, {
      provider: () => provider,
    });
    await dispatch(WalletActionsEnum.subscribeProvider);

    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();

    const address = accounts[0].toLowerCase();
    const networkId = await web3.eth.getChainId();
    const value = await web3.eth.getBalance(address);
    const ballance = web3.utils.fromWei(value, 'ether');

    if (parseInt(window.$nuxt.context.$config.networkId) !== networkId) {
      if (provider.wc) {
        window.$nuxt.context.$toast.error('Change your network');
        setTimeout(() => {
          localStorage.removeItem('walletconnect');
          provider._events.changeNetwork(
            web3.utils.toHex(window.$nuxt.context.$config.networkId)
          );
        }, 4000);
      } else {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [
              {
                chainId: web3.utils.toHex(
                  window.$nuxt.context.$config.networkId
                ),
              },
            ],
          });
        } catch (error) {
          try {
            const params = [
              {
                chainId: web3.utils.toHex(
                  window.$nuxt.context.$config.networkId
                ),
                chainName:
                  getters.appMode === AppModeEnum.development
                    ? 'Smart Chain Testnet'
                    : 'Smart Chain',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: [httpProvider],
                blockExplorerUrls:
                  getters.appMode === AppModeEnum.development
                    ? ['https://testnet.bscscan.com/']
                    : ['https://bscscan.com/'],
              },
            ];

            await provider.request({
              method: 'wallet_addEthereumChain',
              params,
            });
          } catch (error: any) {
            window.$nuxt.context.$toast.error(error?.message);
          }
        }
      }
    } else {
      commit(WalletMutationsEnum.SET_WEB3, () => web3);
      commit(WalletMutationsEnum.SET_WALLET_DATA, { BNB: ballance, address });

      dispatch(WalletActionsEnum.setNetworkId, networkId);
    }
  },

  async disconnectWallet(
    { commit, dispatch, rootGetters, state },
    onEvent = false
  ) {
    if (!state?.web3 || !state?.web3Modal) {
      return false;
    }
    if (!onEvent) {
      try {
        const web3 = rootGetters[WalletGettersEnum.web3]() as Web3;

        if (web3 && web3?.currentProvider && state.provider()?.wc) {
          await state.provider().close();
        }

        if (state.provider() && state.provider()?.disconnect) {
          state.provider().disconnect();
        }
      } catch (err) {
        console.log('disconnect error', err);
      }
    }

    if (state.web3Modal) {
      state.web3Modal.clearCachedProvider();
    }

    commit(WalletMutationsEnum.RESET_WALLET_STATE);

    localStorage.clear();

    await dispatch(WalletActionsEnum.initConnect);
  },

  async metamaskConnect({ dispatch }) {
    if (!getters.isMetamaskInstalled && getters.metamaskInstallationLink) {
      window.open(getters.metamaskInstallationLink, '_blank');
    } else {
      try {
        await dispatch(WalletActionsEnum.connectWallet, {
          idConnect: customWalletConnect.metamask,
        });
      } catch (error) {
        console.error(error);
      }
    }
  },

  async bscConnect({ dispatch }) {
    if (
      !getters.isBinanceSmartChainInstalled &&
      getters.binanceSmartChainInstallationLink
    ) {
      window.open(getters.binanceSmartChainInstallationLink, '_blank');
    } else {
      try {
        await dispatch(WalletActionsEnum.connectWallet, {
          idConnect: customWalletConnect.binanceSmartChain,
        });
      } catch (error) {
        console.error(error);
      }
    }
  },

  async walletConnect({ dispatch }) {
    await dispatch(WalletActionsEnum.connectWallet, {
      idConnect: customWalletConnect.walletconnect,
    });
  },

  async updateAccount({ state, commit }): Promise<void> {
    if (!state.web3 || typeof state.web3 !== 'function') return;

    const address = state.walletData.address;
    if (address) {
      const value = await state.web3()?.eth.getBalance(address);
      const ballance = value ? state.web3()?.utils.fromWei(value, 'ether') : 0;
      commit(WalletMutationsEnum.SET_WALLET_DATA, { BNB: ballance, address });
    }
  },

  subscribeProvider({ state, dispatch }) {
    const provider = state.provider;
    if (!provider()?.on) return;

    provider().on(ProviderListenerEnum.connect, async (_payload: any) => {
      console.log('-------');
      console.log('provider connect event!');
      await dispatch(WalletActionsEnum.updateAccount);
    });

    provider().on(ProviderListenerEnum.disconnect, (_error: Error) => {
      console.log('-------');
      console.log('provider disconnect event!');
      dispatch(WalletActionsEnum.disconnectWallet, true);
    });

    provider().on(ProviderListenerEnum.close, () => {
      console.log('-------');
      console.log('provider close event!');
      dispatch(WalletActionsEnum.disconnectWallet, true);
    });

    provider().on(ProviderListenerEnum.accountsChanged, (_accounts: any) => {
      console.log('-------');
      console.log('provider accountsChanged event!');

      dispatch(WalletActionsEnum.disconnectWallet);
    });

    provider().on(
      ProviderListenerEnum.changeNetwork,
      async (networkId: number) => {
        console.log('-------');
        console.log('provider changeNetwork event!');

        dispatch(WalletActionsEnum.setNetworkId, networkId);
        await dispatch(WalletActionsEnum.disconnectWallet);
        window.location.reload();
      }
    );

    provider().on(
      ProviderListenerEnum.chainChanged,
      async (chainId: number) => {
        console.log('-------');
        console.log('provider chainChanged event!');

        dispatch(
          WalletActionsEnum.setNetworkId,
          Web3.utils.hexToNumber(chainId)
        );
        await dispatch(WalletActionsEnum.disconnectWallet);
        window.location.reload();
      }
    );
  },

  setRefWalletAddress({ commit }, refWalletAddress) {
    commit(WalletMutationsEnum.SET_REF_WALLET_DATA, refWalletAddress);
  },

  setNetworkId({ commit }, networkId) {
    commit(WalletMutationsEnum.SET_NETWORK_ID, networkId);
  },

  checkWallets({ commit }, device: Device) {
    commit(WalletMutationsEnum.SET_METAMASK_INSTALLATION_LINK, device);
    commit(
      WalletMutationsEnum.SET_BINANCE_SMART_CHAIN_INSTALLATION_LINK,
      device
    );

    if (device.isDesktop) {
      commit(WalletMutationsEnum.SET_WALLET_STATE, {
        isMetamaskAvailable: true,
        isWalletConnectAvailable: true,
        isBinanceSmartChainWalletAvailable: true,
      });
    } else {
      commit(WalletMutationsEnum.SET_WALLET_STATE, {
        isMetamaskAvailable: true,
        isWalletConnectAvailable: true,
      });
    }
  },

  async checkBalance(ctx) {
    const Web3 = ctx.rootGetters[WalletGettersEnum.web3]();
    const address = ctx.rootGetters[WalletGettersEnum.walletAddress];

    if (!address) return;

    const value = await Web3.eth.getBalance(address);
    const ballance = Web3.utils.fromWei(value, 'ether');

    ctx.commit(WalletMutationsEnum.SET_WALLET_DATA, { BNB: ballance, address });
  },

  async contractDays({ commit, getters, rootGetters }) {
    const Web3 = rootGetters[WalletGettersEnum.web3]();
    const contractCreationBlockHash =
      getters.appMode === AppModeEnum.development
        ? '0x25ae5f6bd230adb68504fc008d278dc0a3a759c769cb8fc2cd5f5029ddb8a6be'
        : '';
    const { timestamp } = await Web3.eth.getBlock(contractCreationBlockHash);
    const seconds = Math.floor(Date.now() / 1000) - timestamp;
    const contractDays = Math.floor(seconds / (3600 * 24));
    commit(WalletMutationsEnum.SET_CONTRACT_INFO, { contractDays });
  },

  async investors({ commit, rootGetters }) {
    const contract = rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;
    const investors = await contract.methods.totalInvestors().call();

    commit(WalletMutationsEnum.SET_CONTRACT_INFO, { investors });
  },

  async totalInvested({ commit, rootGetters }) {
    const contract = rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;
    const Web3 = rootGetters[WalletGettersEnum.web3]();

    const totalInvested = await contract.methods.totalInvest().call();

    commit(WalletMutationsEnum.SET_CONTRACT_INFO, {
      totalInvested: parseFloat(
        Web3.utils.fromWei(totalInvested, 'ether')
      ).toFixed(0),
    });
  },

  async getUserLevel({ rootGetters }) {
    const contract = rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;
    const address = rootGetters[WalletGettersEnum.walletAddress];
    return await userLevel({ contract, address });
  },
};
