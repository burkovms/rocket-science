<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  useStore,
} from '@nuxtjs/composition-api';
import { WalletActionsEnum } from '~/types/enum/store/wallet/actions.enum';
import { WalletGettersEnum } from '~/types/enum/store/wallet/getters.enum';
import { useDispatch } from '~/utils/useDispatch.helper';
import { AppModeEnum } from '~/types/enum/store';
export default defineComponent({
  setup() {
    const store = useStore();
    let intervalId = NaN;

    const currentWallet = computed(
      () => store.getters[WalletGettersEnum.walletAddress]
    );

    const contracInfo = computed(
      () => store.getters[WalletGettersEnum.contracInfo]
    );

    const contractLinkAddress = computed(() => {
      // @ts-ignore
      const { mode, marketContractNew } = store.$config;
      return mode === AppModeEnum.production
        ? `https://bscscan.com/address/${marketContractNew}`
        : `https://testnet.bscscan.com/address/${marketContractNew}`;
    });

    onMounted(async () => {
      await store.dispatch(useDispatch('wallet', WalletActionsEnum.investors));
      await store.dispatch(
        useDispatch('wallet', WalletActionsEnum.contractDays)
      );
      await store.dispatch(
        useDispatch('wallet', WalletActionsEnum.totalInvested)
      );
      if (process.browser) {
        intervalId = window.setInterval(async () => {
          await store.dispatch(
            useDispatch('wallet', WalletActionsEnum.investors)
          );
          await store.dispatch(
            useDispatch('wallet', WalletActionsEnum.contractDays)
          );
          await store.dispatch(
            useDispatch('wallet', WalletActionsEnum.totalInvested)
          );
        }, 60000);
      }
    });
    onBeforeUnmount(() => {
      window.clearInterval(intervalId);
    });

    return {
      contractLinkAddress,
      currentWallet,
      contracInfo,
    };
  },
});
</script>

<template>
  <section class="main">
    <div class="container">
      <div class="main__row">
        <div class="main__left">
          <h1>
            <span class="text-accent">Rocket Science</span> <br />New Horizon
          </h1>
          <div class="main__slogan">
            Revived constract offers up to
            <span class="text-accent">35%</span> daily,
            <span class="text-accent">700%</span> in total. Only 15 days to
            reach the stars. <span class="text-accent">10%</span> referral
            reward.
          </div>
          <p>Your safe mission in binance smart chain</p>
          <div class="main__btn-wrap">
            <a :href="contractLinkAddress" target="_blank" class="btn">
              Contract
            </a>
            <a
              href="https://www.certik.com/projects/rocket-science"
              target="_blank"
              class="btn btn-white"
            >
              <img src="@/static/certik.svg" alt="icon" />
            </a>
          </div>
          <div class="main__counter">
            <div class="main__counter-row">
              <div class="main__counter-col">
                <h3 class="number fw-500">{{ contracInfo.contractDays }}</h3>
                <div class="main__counter-text">Days In Orbit</div>
              </div>
              <div class="main__counter-col">
                <h3 class="number fw-500">{{ contracInfo.investors }}</h3>
                <div class="main__counter-text">Astronauts Aboard</div>
              </div>
              <div class="main__counter-col">
                <h3 class="number fw-500">
                  {{ contracInfo.totalInvested }} <span>BNB</span>
                </h3>
                <div class="main__counter-text">Loaded With</div>
              </div>
            </div>
          </div>
        </div>
        <img
          class="main__rocket-tablet"
          src="@/static/rocket-tablet.png"
          alt="rocket"
        />
        <img
          class="main__rocket-mobile"
          src="@/static/main-rocket-mobile.png"
          alt="rocket"
        />
        <div class="main__right white">
          <div class="main__right-title">How do you like it, Elon Musk?</div>
          <div class="main__right-slogan font-sm">
            The most sustainable plan. Verified and audited smartcontract
          </div>
        </div>
      </div>
    </div>
    <img
      class="main__planet-mobile"
      src="@/static/main-planet-mobile.png"
      alt="rocket"
    />
  </section>
</template>

<style lang="scss" src="./index.scss"></style>
