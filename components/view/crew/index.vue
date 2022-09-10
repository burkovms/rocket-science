<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  ref,
  useStore,
} from '@nuxtjs/composition-api';
import { CardActionsEnum } from '~/types/enum/store/card/actions.enum';
import { CardGettersEnum } from '~/types/enum/store/card/getters.enum';
import { WalletGettersEnum } from '~/types/enum/store/wallet/getters.enum';
import { publicKeyShortenerHelper } from '~/utils/publicKeyShortener.helper';
import { getFormatDate } from '~/utils/dateTime.helper';
import { useDispatch } from '~/utils/useDispatch.helper';
import { WalletActionsEnum } from '~/types/enum/store/wallet/actions.enum';
import { updateTReferrals, TReferrals } from '~/blockchain';
import { getFullDisplayBalance } from '~/utils';

export default defineComponent({
  setup(_props, context) {
    const store = useStore();
    const isDialogOpen = ref<boolean>(false);
    const isLoadingClaim = ref<boolean>(false);
    const modalData = ref<ReturnType<typeof updateTReferrals>[] | null>(null);

    let intervalId = NaN;

    const walletAddress = computed(
      () => store.getters[WalletGettersEnum.walletAddress]
    );

    const getReferals = computed(() => store.getters[CardGettersEnum.referals]);
    const myInvestments = computed(() => {
      const data = { ...store.getters[CardGettersEnum.myInvestments] };

      return data;
    });

    const isVisibleBlock = computed(() => {
      return walletAddress.value.length !== 0;
    });

    const showDialog = () => {
      isDialogOpen.value = true;
      document.body.classList.add('no-scroll');
    };

    const copyHandler = (): void => {
      if (process.browser && window) {
        const value = `${location.protocol}//${location.host}/?ref=${walletAddress.value}`;
        const textarea = context.refs.copyData;
        // @ts-ignore
        textarea?.value = value;
        // @ts-ignore
        textarea?.select();
        try {
          const successful = document.execCommand('copy');
          const msg = successful ? 'successful' : 'unsuccessful';
          // @ts-ignore
          context.root.$toast.success(
            `Link ${value} copied ${msg} to clipboard`
          );
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Unable to copy link into clipboard!');
        }
        window.getSelection()?.removeAllRanges();
      }
    };

    const claimHandler = async (): Promise<void> => {
      try {
        isLoadingClaim.value = true;
        await store.dispatch(
          useDispatch('card', CardActionsEnum.claimdHandler)
        );
        isLoadingClaim.value = false;
      } catch (error) {
        // @ts-ignore
        context.root.$toast.error(error);
        isLoadingClaim.value = false;
      }
    };

    const openModalReferralsHandler = async (): Promise<void> => {
      if (!walletAddress.value) return;

      const data: TReferrals[] = await store.dispatch(
        useDispatch('card', CardActionsEnum.getReferrals)
      );

      const _data: any[] = [];

      data.forEach((item) => {
        _data.push(updateTReferrals(item, item.amount, getFullDisplayBalance));
      });

      modalData.value = _data;

      showDialog();
    };

    onBeforeMount(() => {
      if (process.browser) {
        intervalId = window.setInterval(async () => {
          await store.dispatch(
            useDispatch('card', CardActionsEnum.myInvestments)
          );
          await store.dispatch(
            useDispatch('wallet', WalletActionsEnum.checkBalance)
          );
        }, 60000);
      }
    });
    onBeforeUnmount(() => {
      window.clearInterval(intervalId);
    });

    return {
      walletAddress,
      getReferals,
      myInvestments,
      isVisibleBlock,
      isDialogOpen,
      isLoadingClaim,
      showDialog,
      modalData,

      copyHandler,
      claimHandler,
      openModalReferralsHandler,

      publicKeyShortenerHelper,
      getFormatDate,
    };
  },
});
</script>

<template>
  <section class="crew">
    <img
      class="crew__gradient-left"
      src="@/static/crew-gradient-1.svg"
      alt="gradient"
    />
    <img
      class="crew__gradient-right"
      src="@/static/crew-gradient-2.svg"
      alt="gradient"
    />
    <div class="container">
      <div class="crew__row">
        <div class="crew__left">
          <h2>My <span class="text-accent">Crew</span></h2>
          <div class="crew__text">
            <p>
              No successful space mission is complete without a cohesive team
              and a loyal crew. Invite new users to join your Rocket Science
              team and receive referral rewards.
            </p>
            <p>
              Promote your referral link and receive
              <span class="text-accent">10%</span> BNB from investments of your
              invited users.
            </p>
          </div>
          <div class="crew__referral">
            <div class="crew__referral-label">Your referral link:</div>

            <div class="crew__referral-item">
              <div class="crew__referral-link">
                <span>{{ publicKeyShortenerHelper(walletAddress, 9, 8) }}</span>
              </div>
              <button
                class="btn"
                :disabled="!isVisibleBlock"
                @click.stop.prevent="copyHandler"
              >
                Copy Link
              </button>
              <textarea
                ref="copyData"
                v-model="walletAddress"
                style="position: absolute; width: 0; height: 0; opacity: 0"
              ></textarea>
            </div>

            <ul class="calculation-list">
              <li class="calculation-list__item">
                <div class="calculation-list__key">You invited:</div>
                <div class="calculation-list__value">
                  <span class="calculation-list__value-amount">{{
                    getReferals[0].referalCount
                  }}</span>
                  <div class="calculation-list__value-coin">
                    <span>Referrals</span>
                  </div>
                </div>
              </li>
              <li class="calculation-list__item">
                <div class="calculation-list__key">Total rewards:</div>
                <div class="calculation-list__value">
                  <span class="calculation-list__value-amount">{{
                    myInvestments.refReward || 0
                  }}</span>
                  <div class="calculation-list__value-coin">
                    <span>BNB</span>
                    <div class="calculation-list__coin-logo">
                      <SvgIcon name="bnb-logo" />
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            <div class="crew__referral-bottom">
              <div class="crew__referral-bottom-item">
                <ul class="investments-balance-list">
                  <li class="investments-balance-list__item">
                    available reward:
                    {{ myInvestments.availableRefRewards || 0 }} BNB
                    <div class="investments-balance-list__logo">
                      <SvgIcon name="bnb-logo" />
                    </div>
                  </li>
                </ul>
                <SharedButton
                  class="btn btn-turquoise"
                  :is-loading="isLoadingClaim"
                  :is-disabled="!isVisibleBlock"
                  @buttonHandler="claimHandler"
                >
                  Claim
                </SharedButton>
              </div>
              <a
                href="#"
                class="btn-link"
                @click.prevent="openModalReferralsHandler"
              >
                <span>Referral statistics</span>
                <SvgIcon name="arrow-up" />
              </a>
            </div>
          </div>
        </div>
        <div class="crew__right">
          <img class="crew__img-top" src="@/static/ufo.png" alt="ufo" />
          <picture class="crew__img-bottom">
            <source
              srcset="@/static/city-tablet.png"
              media="(max-width: 1024px)"
            />
            <source srcset="@/static/city.png" />
            <img srcset="@/static/city.png" alt="city" />
          </picture>
        </div>
      </div>
    </div>
    <!-- DIALOG -->
    <ViewDialog v-if="modalData" v-model="isDialogOpen" class="popup-referral">
      <template #title>Referral rewards statistics</template>
      <div class="popup-list__cover">
        <div class="popup-list">
          <div
            v-for="(item, index) in modalData"
            :key="index"
            class="popup-list__item"
          >
            <div class="popup-list__item-name-cover">
              <div class="popup-list__item-name">Referral</div>
              <div class="popup-list__item-wallet">
                {{ publicKeyShortenerHelper(item.user, 4, 4) }}
              </div>
            </div>

            <div class="popup-list__item-total">
              <div class="name">Reward:</div>
              <div class="popup-list__item-total-cover">
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
                  getFormatDate(new Date(item.timestamp), `dd.LL.yyyy`)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ViewDialog>
  </section>
</template>

<style lang="scss" src="./index.scss" scoped />
