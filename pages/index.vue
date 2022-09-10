<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  useStore,
} from '@nuxtjs/composition-api';
import { WalletActionsEnum } from '~/types/enum/store/wallet/actions.enum';
import { WalletGettersEnum } from '~/types/enum/store/wallet/getters.enum';
import { useDispatch } from '~/utils/useDispatch.helper';

export default defineComponent({
  setup() {
    const store = useStore();

    const currentWallet = computed(
      () => store.getters[WalletGettersEnum.walletAddress]
    );

    onBeforeMount(async () => {
      const refWalletAddress = location.search.match(/\?ref=/)
        ? location.search.replace('?ref=', '')
        : '';
      if (refWalletAddress !== '' && refWalletAddress !== '?ref') {
        store.dispatch(
          useDispatch('wallet', WalletActionsEnum.setRefWalletAddress),
          refWalletAddress
        );
      }

      await store.dispatch(
        useDispatch('wallet', WalletActionsEnum.initConnect)
      );
    });
    return { currentWallet };
  },
});
</script>

<template>
  <div class="page">
    <Header />

    <div class="section-top">
      <picture class="main-bg-img">
        <source
          srcset="@/static/main-img-tablet.png"
          media="(max-width: 1024px) and (min-width: 768px)"
        />
        <source
          srcset="@/static/main-img-mobile.svg"
          media="(max-width: 767px)"
        />
        <source srcset="@/static/main-img-desktop.png" />
        <img srcset="@/static/main-img-desktop.png" alt="My default image" />
      </picture>
      <img
        class="img-tablet-planets"
        src="@/static/main-img-tablet-planets.svg"
        alt="rocket"
      />
      <ViewMain />
      <ViewPackages id="packages" />
      <svg
        width="1920"
        height="207"
        viewBox="0 0 1920 207"
        fill="none"
        class="curve"
      >
        <mask
          id="mask0_410_939"
          style="mask-type: alpha"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1920"
          height="207"
        >
          <path
            d="M1920 207V0L1920 68.6663C1766.24 3.10722 1493.73 55.3601 1196.84 112.287L1196.84 112.288C741.993 199.504 229.925 297.692 0 0V207H1920Z"
            fill="#C4C4C4"
          />
        </mask>
        <g mask="url(#mask0_410_939)">
          <rect
            y="-2906"
            width="1920"
            height="7817.33"
            fill="url(#paint0_linear_410_939)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_410_939"
            x1="1920"
            y1="-2906"
            x2="-562.075"
            y2="-2712.59"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="white" />
            <stop offset="1" stop-color="#F3F2F9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="section-light">
      <ViewCrew id="crew" />

      <ViewStrongPoints id="strong-points" />
      <div class="section-light__content">
        <div class="question-title__wrap">
          <div class="container">
            <h2>Common <span class="text-accent">Questions</span></h2>
          </div>
        </div>
      </div>
    </div>
    <div class="section-bottom">
      <svg
        width="1920"
        height="201"
        viewBox="0 0 1920 201"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="curve"
      >
        <mask
          id="mask0_410_946"
          style="mask-type: alpha"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1920"
          height="201"
        >
          <path
            d="M1920 0H0V201C229.925 -96.6921 741.993 1.49576 1196.84 88.7122L1196.84 88.7125C1493.73 145.64 1766.24 197.893 1920 132.334L1920 201V0Z"
            fill="#C4C4C4"
          />
        </mask>
        <g mask="url(#mask0_410_946)">
          <rect
            y="-6059"
            width="1920"
            height="7817.33"
            fill="url(#paint0_linear_410_946)"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_410_946"
            x1="1920"
            y1="-6059"
            x2="-562.075"
            y2="-5865.59"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="white" />
            <stop offset="1" stop-color="#F3F2F9" />
          </linearGradient>
        </defs>
      </svg>
      <div class="section-bottom__content">
        <div class="container">
          <ViewQuestions id="common-questions" />
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

<style lang="scss" src="./index.scss"></style>
