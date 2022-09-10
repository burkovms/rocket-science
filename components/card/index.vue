<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  // onBeforeUnmount,
  onMounted,
  ref,
  useStore,
  watch,
} from '@nuxtjs/composition-api';
import { observableDiff } from 'deep-diff';
import { SwitchGettersEnum } from '@/types/enum/store/switch/getters.enum';
import { useDispatch } from '~/utils/useDispatch.helper';
import { CardActionsEnum } from '~/types/enum/store/card/actions.enum';
import { WalletGettersEnum } from '~/types/enum/store/wallet/getters.enum';
import { PackageStatusEnum } from '~/types/enum/package';
import { ActivePacketsLevelStringEnum } from '~/blockchain';
import { CardGettersEnum } from '~/types/enum/store';

export default defineComponent({
  setup(_props, context) {
    const store = useStore();
    const cardData = ref(null);
    const showEmptyCardCount = ref();
    // let intervalId = NaN;
    const isLoadingWithdraw = ref(false);
    const withdrawPacket = ref<string | null>(null);
    const resizeCards = {
      1199: {
        count: 3,
        resolution: 1199,
      },
      768: {
        count: 2,
        resolution: 768,
      },
      0: {
        count: 1,
        resolution: 0,
      },
    };
    // computed
    const walletAddress = computed(
      () => store.getters[WalletGettersEnum.walletAddress]
    );
    const cardList = computed(() => store.getters[CardGettersEnum.list]);
    const packageStatus = computed(
      () => store.getters[SwitchGettersEnum.packageStatus]
    );
    // eslint-disable-next-line require-await
    const withdrawHandler = async (packegeId: string): Promise<void> => {
      try {
        withdrawPacket.value = packegeId;
        isLoadingWithdraw.value = true;
        await store.dispatch(
          useDispatch('card', CardActionsEnum.withdrawHandler),
          packegeId
        );
        withdrawPacket.value = null;
        isLoadingWithdraw.value = false;
      } catch (error) {
        // @ts-ignore
        context.root.$toast.error(error);
        withdrawPacket.value = null;
        isLoadingWithdraw.value = false;
      }
    };
    const getCardListData = async () => {
      cardData.value = await store.dispatch(
        useDispatch('card', CardActionsEnum.getCardListData),
        packageStatus.value
      );
    };

    const getPacketsSpeedName = (
      level: number
    ): ActivePacketsLevelStringEnum | undefined => {
      switch (level) {
        case 10:
          return ActivePacketsLevelStringEnum.ten;
        case 15:
          return ActivePacketsLevelStringEnum.fifteen;
        case 20:
          return ActivePacketsLevelStringEnum.twenty;
        case 35:
          return ActivePacketsLevelStringEnum.thirtyFive;
      }
    };

    const onResize = () => {
      const width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      if (width > resizeCards[1199].resolution) {
        if (!cardData.value || !walletAddress.value) {
          showEmptyCardCount.value = resizeCards[1199].count;
        } else {
          const calc =
            resizeCards[1199].count -
            // @ts-ignore
            (cardData.value.length % resizeCards[1199].count);
          calc === resizeCards[1199].count
            ? (showEmptyCardCount.value = 0)
            : (showEmptyCardCount.value = calc);
        }
      } else if (
        width >= resizeCards[768].resolution &&
        width < resizeCards[1199].resolution
      ) {
        if (!cardData.value || !walletAddress.value) {
          showEmptyCardCount.value = resizeCards[768].count;
        } else {
          const calc =
            resizeCards[768].count -
            // @ts-ignore
            (cardData.value.length % resizeCards[768].count);
          calc === resizeCards[768].count
            ? (showEmptyCardCount.value = 0)
            : (showEmptyCardCount.value = calc);
        }
      } else if (width < resizeCards[768].resolution) {
        showEmptyCardCount.value = resizeCards[0].count;
      }
    };
    onMounted(async () => {
      await nextTick();
      onResize();
      if (process.browser) {
        window.addEventListener('resize', onResize);

        // intervalId = window.setInterval(async () => {
        // await getCardListData();
        // }, 15000);
      }
    });

    // onBeforeUnmount(() => {
    //   window.clearInterval(intervalId);
    // });

    watch(
      () => walletAddress.value,
      async (_state, _prevState) => {
        await getCardListData();
        await nextTick();
        onResize();
      }
    );

    watch(
      () => packageStatus.value,
      async (_state, _prevState) => {
        await getCardListData();
      }
    );

    watch(
      () => cardList.value,
      async (state, prevState) => {
        const lhs = { ...state };
        const rhs = { ...prevState };

        const diffState = observableDiff(lhs, rhs);

        if (diffState.length > 0) {
          await getCardListData();
        }

        await nextTick();
        onResize();
      }
    );

    return {
      cardData,
      packageStatus,
      withdrawHandler,
      withdrawPacket,
      isLoadingWithdraw,
      PackageStatusEnum,
      showEmptyCardCount,
      getPacketsSpeedName,
    };
  },
});
</script>

<template>
  <ul class="card-list">
    <template v-if="cardData">
      <li v-for="card in cardData" :key="card.id" class="card-list__item">
        <template v-if="card.status === PackageStatusEnum.active">
          <div class="card" :class="`card--${card.status}`">
            <div class="card__header fw-500">
              {{ card.status }}
              <span v-show="card.level">{{
                getPacketsSpeedName(card.level)
              }}</span>
            </div>
            <div class="card__content">
              <ul class="card-data-list card__list">
                <li
                  v-for="(item, index) in card.data"
                  :key="index"
                  class="card-data-list__item"
                >
                  <CardListItem :data="item" />
                </li>
              </ul>
            </div>
            <div class="card__footer">
              <ul class="card-data-list card__list">
                <li
                  v-for="(item, index) in card.result"
                  :key="index"
                  class="card-data-list__item"
                >
                  <CardListItem :data="item" :status="packageStatus" />
                </li>
              </ul>
              <template v-if="withdrawPacket === card.id">
                <SharedButton
                  :is-loading="isLoadingWithdraw"
                  :is-disabled="isLoadingWithdraw"
                  class="btn btn-white card__button"
                  @buttonHandler="withdrawHandler(card.id)"
                >
                  Withdraw
                </SharedButton>
              </template>
              <template v-else>
                <SharedButton
                  :is-disabled="isLoadingWithdraw"
                  class="btn btn-white card__button"
                  @buttonHandler="withdrawHandler(card.id)"
                >
                  Withdraw
                </SharedButton>
              </template>
            </div>
          </div>
        </template>
        <template v-if="card.status === PackageStatusEnum.complete">
          <div class="card" :class="`card--${card.status}`">
            <div class="card__header">{{ card.status }}</div>
            <div class="card__content">
              <ul class="card-data-list card__list">
                <li
                  v-for="(item, index) in card.data"
                  :key="index"
                  class="card-data-list__item"
                >
                  <CardListItem :data="item" />
                </li>
              </ul>
            </div>
            <div class="card__footer">
              <ul class="card-data-list card__list">
                <li
                  v-for="(item, index) in card.result"
                  :key="index"
                  class="card-data-list__item"
                >
                  <CardListItem :data="item" />
                </li>
              </ul>
            </div>
          </div>
        </template>
      </li>
    </template>
    <li
      v-for="(cardEmpty, index) in Array(showEmptyCardCount)"
      :key="index + 8888"
      class="card-list__item"
    >
      <div class="card" :class="`card--empty`">
        <div class="fw-500">Join the <span>Rocket&nbsp;Science</span></div>
        <div>Get <span>15%</span> daily</div>
      </div>
    </li>
  </ul>
</template>

<style lang="scss" src="./index.scss" scoped />
