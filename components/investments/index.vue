<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
  watch,
} from '@nuxtjs/composition-api';

import { PackageInvestmentEnum, PackageStatusEnum } from '@/types/enum/package';
import { TPackagesStatus, TPackageInvestments } from '@/types/package';
import {
  CardActionsEnum,
  CardGettersEnum,
  SwitchActionsEnum,
  WalletGettersEnum,
} from '~/types/enum/store';
import { getFormatDate, getFullDisplayBalance, useDispatch } from '~/utils';
import { updateTWitdrawals, TWitdrawals } from '~/blockchain';

export default defineComponent({
  setup() {
    const store = useStore();
    const isSwitchChecked = ref<boolean>(false);
    const activePackets = ref<number>(0);
    const isDialogOpen = ref<boolean>(false);
    const modalData = ref<ReturnType<typeof updateTWitdrawals>[] | null>(null);

    // computed
    const walletAddress = computed(
      () => store.getters[WalletGettersEnum.walletAddress]
    );
    const activePacketsCount = computed(
      () => store.getters[CardGettersEnum.activePackets]
    );
    const completePacketsCount = computed(
      () => store.getters[CardGettersEnum.completePackets]
    );
    const getMyInvestments = computed(() => {
      if (!walletAddress.value)
        return {
          totalInvested: '0',
          earned: '0',
        };
      return store.getters[CardGettersEnum.myInvestments];
    });

    const showDialog = () => {
      isDialogOpen.value = true;
      document.body.classList.add('no-scroll');
    };

    const packagesRenderStatus = (status: PackageStatusEnum): String =>
      `${status.charAt(0).toUpperCase()}${status.slice(1)}`;

    const toggleSwitch = (e: InputEvent): void => {
      const target = e.target as HTMLInputElement;
      isSwitchChecked.value = target?.checked;
      store.dispatch(
        useDispatch('switch', SwitchActionsEnum.changePackageStatus),
        isSwitchChecked.value
          ? PackageStatusEnum.complete
          : PackageStatusEnum.active
      );
    };

    const openModalWithdrawalsHandler = async (): Promise<void> => {
      if (!walletAddress.value) return;

      const data: TWitdrawals[] = await store.dispatch(
        useDispatch('card', CardActionsEnum.getWithdrawals)
      );

      const _data: any[] = [];

      data.forEach((item) => {
        _data.push(updateTWitdrawals(item, item.amount, getFullDisplayBalance));
      });

      modalData.value = _data;

      showDialog();
    };

    const myInvestments = ref<Array<TPackageInvestments>>([
      {
        key: PackageInvestmentEnum.invested,
        text: 'MY TOTAL INVESTMENTS',
        value: 0,
      },
      {
        key: PackageInvestmentEnum.received,
        text: 'TOTAL DIVIDENDS RECEIVED',
        value: 0,
      },
    ]);

    const packagesStatus = ref<Array<TPackagesStatus>>([
      {
        status: PackageStatusEnum.active,
        text: packagesRenderStatus(PackageStatusEnum.active),
        count: activePacketsCount.value,
      },
      {
        status: PackageStatusEnum.complete,
        text: packagesRenderStatus(PackageStatusEnum.complete),
        count: completePacketsCount.value,
      },
    ]);

    watch(
      () => walletAddress.value,
      async (state, _prevState) => {
        if (!state) {
          store.dispatch(useDispatch('card', CardActionsEnum.resetCardState));
        } else {
          await store.dispatch(
            useDispatch('card', CardActionsEnum.myInvestments)
          );
        }
      }
    );

    watch(
      () => getMyInvestments.value,
      (state, _prevState) => {
        if (state) {
          myInvestments.value[0].value = parseFloat(
            state.totalInvested
          ).toFixed(6);
          myInvestments.value[1].value = parseFloat(state.earned).toFixed(6);
        }
      }
    );

    watch(
      () => activePacketsCount.value,
      (state, _prevState) => {
        packagesStatus.value[0].count = state;
      }
    );

    watch(
      () => completePacketsCount.value,
      (state, _prevState) => {
        packagesStatus.value[1].count = state;
      }
    );

    return {
      isSwitchChecked,
      packagesStatus,
      myInvestments,
      activePackets,
      toggleSwitch,
      isDialogOpen,
      modalData,
      showDialog,
      getFormatDate,
      openModalWithdrawalsHandler,
    };
  },
});
</script>

<template>
  <div class="investments">
    <div class="investments-statuses">
      <ul class="investments-statuses-list">
        <li
          v-for="(item, index) in packagesStatus"
          :key="index"
          class="investments-statuses-list__item"
        >
          {{ item.text }}:&nbsp;<span>{{ item.count }}</span>
        </li>
      </ul>
      <div class="investments-statuses-link">
        <a
          href="#"
          class="btn-link btn-link__white"
          @click.prevent="openModalWithdrawalsHandler"
        >
          <span>Statistics</span>
          <SvgIcon name="arrow-up" />
        </a>
      </div>
    </div>
    <div class="investments-swither">
      <ul>
        <li :class="{ active: !isSwitchChecked }">Active</li>
        <li :class="{ active: isSwitchChecked }">Complete</li>
      </ul>
      <div class="switch">
        <input type="checkbox" @change="toggleSwitch" />
        <span></span>
      </div>
    </div>
    <div class="investments-balance">
      <ul class="investments-balance-list">
        <li
          v-for="item in myInvestments"
          :key="item.key"
          class="investments-balance-list__item"
        >
          {{ item.text }}:
          <span>
            {{ item.value }} BNB
            <div class="investments-balance-list__logo">
              <SvgIcon name="bnb-logo" />
            </div>
          </span>
        </li>
      </ul>
    </div>

    <!-- DIALOG -->
    <ViewDialog v-if="modalData" v-model="isDialogOpen">
      <template #title>My Withdrawals</template>
      <div class="popup-list__cover">
        <div class="popup-list">
          <div
            v-for="(item, index) in modalData"
            :key="index"
            class="popup-list__item"
          >
            <div class="popup-list__item-name-cover">
              <div class="popup-list__item-name">BNB {{ item.name }}:</div>
              <div class="popup-list__item-total">
                <span class="text-accent">{{ item.amount }} BNB</span>
                <div class="investments-balance-list__logo">
                  <svg-icon name="bnb-logo" class="icon--bnb-logo" />
                </div>
              </div>
            </div>

            <div class="popup-list__item-date">
              <div>Date:</div>
              <div class="popup-list__item-date-cover">
                <span>{{
                  getFormatDate(new Date(item.timestamp), `dd.LL.yyyy HH:mm:ss`)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ViewDialog>
  </div>
</template>
<style lang="scss" src="./index.scss" />
