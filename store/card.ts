/* eslint-disable no-console */
// eslint-disable-next-line import/named
import { GetterTree, MutationTree, ActionTree } from 'vuex';
import { Contract } from 'web3-eth-contract';
import { BigNumber } from 'bignumber.js';
import Web3 from 'web3';
import { RootState } from '.';

import {
  dailyLimit,
  dailyWithdrawed,
  getActivePackets,
  getCompletedPackets,
  getReferralRewards,
  getReferralsRewards,
  getWithdrawals,
  initialized,
  invest,
  investors,
  refRewards,
  takeInvestment,
  totalClaimable,
  TActivePacketsResponse,
  TCompletedPacketsResponse,
  TTotalClaimable,
} from '~/blockchain';

import {
  AppModeEnum,
  CardActionsEnum,
  CardMutationsEnum,
  SwitchGettersEnum,
  WalletActionsEnum,
  WalletGettersEnum,
} from '~/types/enum/store';
import { PackageStatusEnum } from '~/types/enum/package';
import { CardListNameEnum } from '~/types/enum';
import {
  getFullDisplayBalance,
  profitCalculation,
  profitCalculationName,
  publicKeyShortenerHelper,
} from '~/utils';

declare let window: any;

interface MyInvestmentsInterface {
  totalInvested: string;
  earned: string;
  refReward: string;
  availableRefRewards?: string | number;
  refs?: string;
}
interface ReferalsInterface {
  level: number;
  referalCount: number;
  amount: any;
  persent: number;
}
interface initialCardState {
  list: Array<any>;
  activePackets: Number;
  completePackets: Number;
  myInvestments: MyInvestmentsInterface;
  referals: Array<ReferalsInterface>;
}

const initialState: initialCardState = {
  list: [],
  activePackets: 0,
  completePackets: 0,
  myInvestments: {} as MyInvestmentsInterface,
  referals: [
    {
      level: 1,
      referalCount: 0,
      amount: '0',
      persent: 10,
    },
  ],
};

export const state = () => initialState;

export type CardState = ReturnType<typeof state>;

export const getters: GetterTree<CardState, RootState> = {
  list(state) {
    return state.list;
  },
  listItem(state, itemId: number) {
    return state.list.find((item) => item?.id === itemId);
  },
  activePackets(state) {
    return state.activePackets;
  },
  completePackets(state) {
    return state.completePackets;
  },
  myInvestments(state) {
    return state.myInvestments;
  },
  referals(state) {
    return state.referals;
  },
};

export const mutations: MutationTree<CardState> = {
  SET_CARD_LIST_DATA(state, data) {
    state.list = data;
  },
  SET_ACTIVE_PACKETS(state, count: number) {
    state.activePackets = count;
  },
  SET_COMPLETE_PACKETS(state, count: number) {
    state.completePackets = count;
  },
  SET_MY_INVESTMENTS(state, investments) {
    state.myInvestments = investments;
  },
  SET_MY_REFERALS_BY_LEVEL(state, referalsCountByLevel: number) {
    [...state.referals].map((item) => {
      switch (item.level) {
        case 1:
          item.referalCount = referalsCountByLevel;
          break;
      }
      return item;
    });
  },
  RESET_CARD_STATE(state) {
    state.list = [];
    state.activePackets = 0;
    state.completePackets = 0;
    state.myInvestments = {
      totalInvested: '0',
      earned: '0',
      refReward: '0',
    };
  },
};

export const actions: ActionTree<CardState, RootState> = {
  resetCardState({ commit }) {
    commit(CardMutationsEnum.RESET_CARD_STATE);
  },
  async getClaimable(_ctx, payload: TTotalClaimable): Promise<BigNumber> {
    return await totalClaimable(payload);
  },

  async initialized(ctx, address: string): Promise<boolean> {
    const contract = ctx.rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;

    return await initialized({ contract, address });
  },

  async getCardListData(
    { commit, dispatch, rootGetters },
    status = PackageStatusEnum.active
  ) {
    const address: string = rootGetters[WalletGettersEnum.walletAddress];

    if (!address) return [];

    const response = await new Promise<any[]>((resolve) => {
      setTimeout(async () => {
        try {
          const selectedPackets = await dispatch(
            CardActionsEnum.getPackets,
            status
          );
          const result = [...selectedPackets];
          resolve(result);
        } catch (error) {
          console.log(error);
        }
      }, 0);
    });

    if (response) {
      commit(CardMutationsEnum.SET_CARD_LIST_DATA, response);
      return response;
    }
  },

  async getPackets(ctx, status: PackageStatusEnum) {
    const address: string = ctx.rootGetters[WalletGettersEnum.walletAddress];
    const appMode: AppModeEnum = ctx.rootGetters[WalletGettersEnum.appMode];

    const isInitialized = await ctx.dispatch(
      CardActionsEnum.initialized,
      address
    );

    let activePackets: TActivePacketsResponse[];
    let completedPackets: TCompletedPacketsResponse[];
    let contract: Contract | null = null;
    let limit: BigNumber = new BigNumber(0);
    let withdrawed: BigNumber = new BigNumber(0);

    if (isInitialized) {
      contract = ctx.rootGetters[
        WalletGettersEnum.contractInstanceNew
      ]() as Contract;
      limit = await dailyLimit(contract);
      withdrawed = await dailyWithdrawed(contract);
    } else {
      contract = ctx.rootGetters[
        WalletGettersEnum.contractInstance
      ]() as Contract;
    }

    if (address.length === 0) {
      activePackets = [];
      completedPackets = [];
      return [];
    } else {
      activePackets = await getActivePackets({
        contract,
        address,
      });
      completedPackets = await getCompletedPackets({
        contract,
        address,
      });
    }
    ctx.commit(CardMutationsEnum.SET_ACTIVE_PACKETS, activePackets?.length);
    ctx.commit(
      CardMutationsEnum.SET_COMPLETE_PACKETS,
      completedPackets?.length
    );
    switch (status) {
      case PackageStatusEnum.active:
        const result = [];

        for (let index = 0; index < activePackets.length; index++) {
          const item = activePackets[index];

          const availableValue: BigNumber =
            address.length === 0
              ? new BigNumber(0)
              : await ctx.dispatch(CardActionsEnum.getClaimable, {
                  contract,
                  id: item.id,
                  user: address,
                });

          const dataResult = isInitialized
            ? [
                {
                  name: CardListNameEnum.available,
                  value: getFullDisplayBalance(availableValue),
                  сoin: 'BNB',
                },
                {
                  name: CardListNameEnum.withdrawed,
                  value: `${getFullDisplayBalance(
                    withdrawed,
                    4
                  )} / ${getFullDisplayBalance(limit, 0)}`,
                  сoin: 'BNB',
                },
              ]
            : [
                {
                  name: CardListNameEnum.available,
                  value: getFullDisplayBalance(availableValue),
                  сoin: 'BNB',
                },
              ];

          result.push({
            id: item.id,
            status,
            level: item?.level,
            pType: item?.pType,
            packetLifetime: item?.packetLifetime,
            data: [
              {
                name: CardListNameEnum.start,
                value: item.startTime,
                key: 'timestamp',
              },
              {
                name: CardListNameEnum.invested,
                value: getFullDisplayBalance(item.invested),
                сoin: 'BNB',
              },
              {
                name: profitCalculationName(item.packetLifetime, appMode),
                value: profitCalculation(item.level, item.invested),
                сoin: 'BNB',
              },
              {
                name: CardListNameEnum.paid,
                value: getFullDisplayBalance(item.paid),
                сoin: 'BNB',
              },
            ],
            result: dataResult,
          });
        }
        // @ts-ignore
        return result.sort((a, b) => b.data[0].value - a.data[0].value);
      case PackageStatusEnum.complete:
        return (
          completedPackets
            .map((item: any) => {
              return {
                id: item.id,
                status,
                data: [
                  {
                    name: CardListNameEnum.end,
                    value: item.finishTime,
                    key: 'timestamp',
                  },
                  {
                    name: CardListNameEnum.invested,
                    value: getFullDisplayBalance(item.invested),
                    сoin: 'BNB',
                  },
                  {
                    name: profitCalculationName(item.packetLifetime, appMode),
                    value: profitCalculation(item.level, item.invested),
                    сoin: 'BNB',
                  },
                  {
                    name: CardListNameEnum.paid,
                    value: getFullDisplayBalance(item.paid),
                    сoin: 'BNB',
                  },
                ],
                result: [
                  {
                    name: CardListNameEnum.paidOut,
                    value:
                      ((item.paid * 225) / (item.invested * 2.25))
                        .toFixed(2)
                        .toString() + '%',
                  },
                ],
              };
            })
            .sort((a: any, b: any) => b.data[0].value - a.data[0].value) || []
        );
    }
  },

  async withdrawals(ctx) {
    const address = ctx.rootGetters[WalletGettersEnum.walletAddress];
    const contract = ctx.rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;

    if (!address) return;

    return await getWithdrawals({ address, contract });
  },

  async referrals(ctx) {
    // TODO:
    const contract = ctx.rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;
    const address = ctx.rootGetters[WalletGettersEnum.walletAddress];

    return await getReferralsRewards({ address, contract });
  },

  async myInvestments(ctx) {
    const contract = ctx.rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;
    const address = ctx.rootGetters[WalletGettersEnum.walletAddress];

    if (!address) return;
    const investments = await investors({ contract, address });
    const availableRefRewards = await refRewards({ contract, address });

    ctx.commit(CardMutationsEnum.SET_MY_INVESTMENTS, {
      totalInvested: getFullDisplayBalance(investments.totalInvested),
      earned: getFullDisplayBalance(investments.earned),
      refReward: getFullDisplayBalance(investments.refReward),
      availableRefRewards: getFullDisplayBalance(availableRefRewards, 4),
    });

    ctx.commit(CardMutationsEnum.SET_MY_REFERALS_BY_LEVEL, investments.refs);
  },

  // buttons Handlers
  investHandler(ctx, inputValue) {
    const contract = ctx.rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;
    const Web3 = ctx.rootGetters[WalletGettersEnum.web3]() as Web3;
    const address: string = ctx.rootGetters[WalletGettersEnum.walletAddress];
    const contractAddress: string =
      ctx.rootGetters[WalletGettersEnum.contractAddressNew];
    const refWalletAddress: string =
      ctx.rootGetters[WalletGettersEnum.refWalletAddress];

    if (inputValue === '') {
      return Promise.reject(new Error('Incorrect value'));
    }

    return new Promise((resolve, reject) => {
      if (!contract) {
        return reject(new Error('no connection to wallet'));
      }

      const value = new BigNumber(
        Web3.utils.toWei(inputValue.toString(), 'ether') as any
      );

      const investProps =
        refWalletAddress !== '' && refWalletAddress !== address
          ? refWalletAddress
          : '0x0000000000000000000000000000000000000000';

      invest({
        investProps,
        contract,
        contractAddress,
        web3: Web3,
        address,
        value,
      })
        .on('transactionHash', (txHash: string) => {
          window.$nuxt.context.$toast.info(
            `Invest: ${publicKeyShortenerHelper(txHash)} started`
          );
        })
        .on('receipt', async (_receipt: any) => {
          await ctx.dispatch(
            CardActionsEnum.getCardListData,
            ctx.getters[SwitchGettersEnum.packageStatus]
          );
          // !TODO
          // await ctx.dispatch(CardActionsEnum.myInvestments);
          // await ctx.dispatch(
          //   `wallet/${WalletActionsEnum.totalInvested}`,
          //   null,
          //   { root: true }
          // );
          await ctx.dispatch(`wallet/${WalletActionsEnum.checkBalance}`, null, {
            root: true,
          });

          _receipt && _receipt.status
            ? window.$nuxt.context.$toast.success('View your transaction: ', {
                action: {
                  text: `${publicKeyShortenerHelper(_receipt.transactionHash)}`,
                  onClick: (_e: any, toastObject: any) => {
                    toastObject.goAway(0);
                    window.open(
                      `https://bscscan.com/tx/${_receipt.transactionHash}`,
                      '_blank'
                    );
                  },
                },
              })
            : window.$nuxt.context.$toast.error(`Invest failed: `, {
                action: {
                  text: `${publicKeyShortenerHelper(_receipt.transactionHash)}`,
                  onClick: (_e: any, toastObject: any) => {
                    toastObject.goAway(0);
                    window.open(
                      `https://bscscan.com/tx/${_receipt.transactionHash}`,
                      '_blank'
                    );
                  },
                },
              });
          return resolve(_receipt);
        })
        .on('error', (error: any) => {
          return error.code === 4001
            ? reject(new Error(error.message.split(':')[1].trim()))
            : reject(new Error(error));
        });
    });
  },

  claimdHandler(ctx) {
    const address = ctx.rootGetters[WalletGettersEnum.walletAddress];
    const contract = ctx.rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;
    const contractAddress =
      ctx.rootGetters[WalletGettersEnum.contractAddressNew];

    return new Promise((resolve, reject) => {
      if (!contract) {
        return reject(new Error('no connection to wallet'));
      }

      getReferralRewards({ address, contract, contractAddress })
        .on('transactionHash', (txHash: string) => {
          window.$nuxt.context.$toast.info(
            `Claim process started: ${publicKeyShortenerHelper(txHash)} `
          );
        })
        .on('receipt', async (_receipt: any) => {
          // !TODO
          // await ctx.dispatch(CardActionsEnum.myInvestments);
          await ctx.dispatch(`wallet/${WalletActionsEnum.checkBalance}`, null, {
            root: true,
          });

          _receipt && _receipt.status
            ? window.$nuxt.context.$toast.success('View your transaction: ', {
                action: {
                  text: `${publicKeyShortenerHelper(_receipt.transactionHash)}`,
                  onClick: (_e: any, toastObject: any) => {
                    toastObject.goAway(0);
                    window.open(
                      `https://bscscan.com/tx/${_receipt.transactionHash}`,
                      '_blank'
                    );
                  },
                },
              })
            : window.$nuxt.context.$toast.error(`Invest failed: `, {
                action: {
                  text: `${publicKeyShortenerHelper(_receipt.transactionHash)}`,
                  onClick: (_e: any, toastObject: any) => {
                    toastObject.goAway(0);
                    window.open(
                      `https://bscscan.com/tx/${_receipt.transactionHash}`,
                      '_blank'
                    );
                  },
                },
              });
          return resolve(_receipt);
        })
        .on('error', (error: any) => {
          return error.code === 4001
            ? reject(new Error(error.message.split(':')[1].trim()))
            : reject(new Error(error));
        });
    });
  },

  withdrawHandler(ctx, packetId: string) {
    const address = ctx.rootGetters[WalletGettersEnum.walletAddress];
    const contract = ctx.rootGetters[
      WalletGettersEnum.contractInstanceNew
    ]() as Contract;
    const contractAddress =
      ctx.rootGetters[WalletGettersEnum.contractAddressNew];

    return new Promise((resolve, reject) => {
      if (!contract) {
        return reject(new Error('no connection to wallet'));
      }

      takeInvestment({ id: packetId, address, contract, contractAddress })
        .on('transactionHash', (txHash: string) => {
          window.$nuxt.context.$toast.info(
            `Withdraw process started: ${publicKeyShortenerHelper(txHash)} `
          );
        })
        .on('receipt', async (_receipt: any) => {
          await ctx.dispatch(
            CardActionsEnum.getCardListData,
            ctx.getters[SwitchGettersEnum.packageStatus]
          );
          // !TODO
          // await ctx.dispatch(CardActionsEnum.myInvestments);
          await ctx.dispatch(`wallet/${WalletActionsEnum.checkBalance}`, null, {
            root: true,
          });

          _receipt && _receipt.status
            ? window.$nuxt.context.$toast.success('View your transaction: ', {
                action: {
                  text: `${publicKeyShortenerHelper(_receipt.transactionHash)}`,
                  onClick: (_e: any, toastObject: any) => {
                    toastObject.goAway(0);
                    window.open(
                      `https://bscscan.com/tx/${_receipt.transactionHash}`,
                      '_blank'
                    );
                  },
                },
              })
            : window.$nuxt.context.$toast.error(`Invest failed: `, {
                action: {
                  text: `${publicKeyShortenerHelper(_receipt.transactionHash)}`,
                  onClick: (_e: any, toastObject: any) => {
                    toastObject.goAway(0);
                    window.open(
                      `https://bscscan.com/tx/${_receipt.transactionHash}`,
                      '_blank'
                    );
                  },
                },
              });
          return resolve(_receipt);
        })
        .on('error', (error: any) => {
          return error.code === 4001
            ? reject(new Error(error.message.split(':')[1].trim()))
            : reject(new Error(error));
        });
    });
  },
};
