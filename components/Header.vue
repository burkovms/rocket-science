<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  reactive,
  ref,
  useContext,
  useStore,
  watch,
} from '@nuxtjs/composition-api';
import { Device } from '@nuxtjs/device';
import { WalletActionsEnum } from '~/types/enum/store/wallet/actions.enum';
import { WalletGettersEnum } from '~/types/enum/store/wallet/getters.enum';
import { publicKeyShortenerHelper } from '~/utils/publicKeyShortener.helper';
import { useDispatch } from '~/utils/useDispatch.helper';

export default defineComponent({
  setup() {
    const { $device } = useContext();
    const store = useStore();
    const dropdownWallet = ref(false);
    const userLevel = ref<string | null>(null);
    const menu = ref(false);
    const view = reactive({
      topOfPage: true,
    });

    const menuList = [
      {
        name: 'My Packages',
        anchor: 'packages',
      },
      {
        name: 'My Crew',
        anchor: 'crew',
      },
      {
        name: 'Strong Points',
        anchor: 'strong-points',
      },
      {
        name: 'Common Questions',
        anchor: 'common-questions',
      },
    ];

    // computed
    const walletAddress = computed(
      () => store.getters[WalletGettersEnum.walletAddress]
    );
    const isBinanceSmartChainInstalled = computed(
      () => store.getters[WalletGettersEnum.isBinanceSmartChainInstalled]
    );
    const isMetamaskInstalled = computed(
      () => store.getters[WalletGettersEnum.isMetamaskInstalled]
    );
    const isMetamaskAvailable = computed(() => {
      return isMetamaskInstalled.value
        ? store.getters[WalletGettersEnum.isMetamaskAvailable]
        : false;
    });
    const isBinanceSmartChainWalletAvailable = computed(() => {
      return isBinanceSmartChainInstalled.value
        ? store.getters[WalletGettersEnum.isBinanceSmartChainWalletAvailable]
        : false;
    });
    const isWalletConnectAvailable = computed(() => {
      return $device.isMobileOrTablet && isMetamaskInstalled.value
        ? false
        : store.getters[WalletGettersEnum.isWalletConnectAvailable];
    });
    const isContractOwnerAddress = computed(() => {
      const address = walletAddress.value.toLowerCase();
      const contractOwnerAddress: Array<string> = store.getters[
        WalletGettersEnum.contractOwnerAddress
      ].map((item: string) => item.toLowerCase());

      return contractOwnerAddress.some(
        (item, _index, _array) => item === address
      );
    });
    // methods
    const hideMenu = () => {
      menu.value = false;
    };

    const scrollAnchor = (item: any) => {
      const element = document.getElementById(item.anchor);
      const y = element!.getBoundingClientRect().top + window.pageYOffset - 150;
      window.scrollTo({ top: y, behavior: 'smooth' });
      if (menu.value) {
        menu.value = false;
      }
    };

    const toggleMenu = () => {
      menu.value = !menu.value;
    };

    const handleScroll = () => {
      if (window.pageYOffset > 0) {
        if (view.topOfPage) view.topOfPage = false;
      } else if (!view.topOfPage) view.topOfPage = true;
    };
    const hideDropdownWallet = () => {
      if (dropdownWallet.value) {
        dropdownWallet.value = false;
      }
    };
    const toggleDropdownWallet = () => {
      dropdownWallet.value = !dropdownWallet.value;
      if (menu.value) {
        menu.value = false;
      }
    };

    const metamaskConnectHandler = async (): Promise<void> => {
      hideDropdownWallet();
      await store.dispatch(
        useDispatch('wallet', WalletActionsEnum.metamaskConnect)
      );
    };
    const binanceChainConnectHandler = async (): Promise<void> => {
      hideDropdownWallet();
      await store.dispatch(useDispatch('wallet', WalletActionsEnum.bscConnect));
    };
    const walletConnectHandler = async (): Promise<void> => {
      hideDropdownWallet();
      await store.dispatch(
        useDispatch('wallet', WalletActionsEnum.walletConnect)
      );
    };
    const walletDiscountHahdler = async (): Promise<void> => {
      hideDropdownWallet();
      await store.dispatch(
        useDispatch('wallet', WalletActionsEnum.disconnectWallet)
      );
    };

    onBeforeMount(async () => {
      await store.dispatch(
        useDispatch('wallet', WalletActionsEnum.checkWallets),
        $device as Device
      );
      window.addEventListener('load', handleScroll, true);
      window.addEventListener('scroll', handleScroll, true);
    });

    onBeforeUnmount(() => {
      if (process.browser && window) {
        window.removeEventListener('load', handleScroll, true);
        window.removeEventListener('scroll', handleScroll, true);
      }
    });

    watch(
      () => walletAddress.value,
      async (_state, _prevState) => {
        userLevel.value = await store.dispatch(
          useDispatch('wallet', WalletActionsEnum.getUserLevel),
          $device as Device
        );
      }
    );

    return {
      menu,
      view,
      menuList,
      userLevel,
      dropdownWallet,
      walletAddress,
      isMetamaskAvailable,
      isBinanceSmartChainWalletAvailable,
      isWalletConnectAvailable,
      isContractOwnerAddress,
      hideMenu,
      toggleMenu,
      scrollAnchor,
      hideDropdownWallet,
      toggleDropdownWallet,
      publicKeyShortenerHelper,
      metamaskConnectHandler,
      binanceChainConnectHandler,
      walletConnectHandler,
      walletDiscountHahdler,
    };
  },
});
</script>

<template>
  <header :class="{ onScroll: !view.topOfPage }" class="header">
    <div class="overlay" :class="{ active: menu }" @click="hideMenu"></div>
    <div class="container">
      <div class="header__left">
        <a href="#" class="logo" :class="{ active: menu }">
          <svg
            width="139"
            height="54"
            viewBox="0 0 139 54"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_249_3008)">
              <path
                d="M58.6401 23.2896V17.9859H60.4312C62.1293 17.9859 62.5946 18.3115 63.1529 19.4746L65.0138 23.2896H70.0617L68.1309 19.3816C67.5494 18.1952 67.0376 17.4276 65.4325 17.0089V16.7763C68.4101 16.4041 69.6429 14.9386 69.6429 12.4728C69.6429 9.42548 67.4796 7.7041 63.3622 7.7041H54.2668V23.2896H58.6401ZM58.6401 11.6354H63.3157C64.5951 11.6354 65.0603 11.9378 65.0603 13.1707C65.0603 14.4966 64.5951 14.7292 63.3157 14.7292H58.6401V11.6354Z"
                fill="#171719"
              />
              <path
                d="M58.6401 23.2896V17.9859H60.4312C62.1293 17.9859 62.5946 18.3115 63.1529 19.4746L65.0138 23.2896H70.0617L68.1309 19.3816C67.5494 18.1952 67.0376 17.4276 65.4325 17.0089V16.7763C68.4101 16.4041 69.6429 14.9386 69.6429 12.4728C69.6429 9.42548 67.4796 7.7041 63.3622 7.7041H54.2668V23.2896H58.6401ZM58.6401 11.6354H63.3157C64.5951 11.6354 65.0603 11.9378 65.0603 13.1707C65.0603 14.4966 64.5951 14.7292 63.3157 14.7292H58.6401V11.6354Z"
                fill="url(#paint0_linear_249_3008)"
              />
              <path
                d="M77.4818 23.5222C81.5527 23.5222 84.3209 21.2193 84.3209 17.4276C84.3209 13.6126 81.5527 11.333 77.4818 11.333C73.411 11.333 70.6428 13.6126 70.6428 17.4276C70.6428 21.2193 73.411 23.5222 77.4818 23.5222ZM77.4818 19.6607C75.5046 19.6607 74.9696 19.1257 74.9696 17.4276C74.9696 15.7295 75.5046 15.1712 77.4818 15.1712C79.4591 15.1712 79.9941 15.7295 79.9941 17.4276C79.9941 19.1257 79.4591 19.6607 77.4818 19.6607Z"
                fill="#171719"
              />
              <path
                d="M77.4818 23.5222C81.5527 23.5222 84.3209 21.2193 84.3209 17.4276C84.3209 13.6126 81.5527 11.333 77.4818 11.333C73.411 11.333 70.6428 13.6126 70.6428 17.4276C70.6428 21.2193 73.411 23.5222 77.4818 23.5222ZM77.4818 19.6607C75.5046 19.6607 74.9696 19.1257 74.9696 17.4276C74.9696 15.7295 75.5046 15.1712 77.4818 15.1712C79.4591 15.1712 79.9941 15.7295 79.9941 17.4276C79.9941 19.1257 79.4591 19.6607 77.4818 19.6607Z"
                fill="url(#paint1_linear_249_3008)"
              />
              <path
                d="M92.1872 23.5222C96.1882 23.5222 98.7471 21.4519 98.7471 18.3348V17.9393H94.3971V18.1487C94.3971 19.3583 93.5131 19.5909 92.0942 19.5909C90.4891 19.5909 89.7214 19.242 89.7214 17.4276C89.7214 15.5899 90.4891 15.241 92.0942 15.241C93.5131 15.241 94.3971 15.4968 94.3971 16.7065V16.8926H98.7471V16.5204C98.7471 13.38 96.1882 11.333 92.1872 11.333C88.0233 11.333 85.3715 13.6126 85.3715 17.4276C85.3715 21.2193 88.0233 23.5222 92.1872 23.5222Z"
                fill="#171719"
              />
              <path
                d="M92.1872 23.5222C96.1882 23.5222 98.7471 21.4519 98.7471 18.3348V17.9393H94.3971V18.1487C94.3971 19.3583 93.5131 19.5909 92.0942 19.5909C90.4891 19.5909 89.7214 19.242 89.7214 17.4276C89.7214 15.5899 90.4891 15.241 92.0942 15.241C93.5131 15.241 94.3971 15.4968 94.3971 16.7065V16.8926H98.7471V16.5204C98.7471 13.38 96.1882 11.333 92.1872 11.333C88.0233 11.333 85.3715 13.6126 85.3715 17.4276C85.3715 21.2193 88.0233 23.5222 92.1872 23.5222Z"
                fill="url(#paint2_linear_249_3008)"
              />
              <path
                d="M104.521 23.2896V19.5444H106.638L109.104 23.2896H114.268L110.174 17.2648L114.338 11.5656H109.174L106.592 15.6364H104.521V7.7041H100.148V23.2896H104.521Z"
                fill="#171719"
              />
              <path
                d="M104.521 23.2896V19.5444H106.638L109.104 23.2896H114.268L110.174 17.2648L114.338 11.5656H109.174L106.592 15.6364H104.521V7.7041H100.148V23.2896H104.521Z"
                fill="url(#paint3_linear_249_3008)"
              />
              <path
                d="M121.57 23.5222C125.524 23.5222 128.013 21.6845 128.013 19.0792V18.8H123.64V19.0559C123.64 19.7538 123.175 20.0562 121.407 20.0562C119.546 20.0562 118.918 19.6607 118.848 18.2418H128.037C128.083 17.823 128.106 17.5206 128.106 17.1252C128.106 13.3567 125.524 11.333 121.477 11.333C117.569 11.333 114.801 13.6126 114.801 17.4276C114.801 21.8241 117.592 23.5222 121.57 23.5222ZM121.384 14.6827C123.012 14.6827 123.71 15.0316 123.873 16.0319H118.918C119.104 15.0316 119.779 14.6827 121.384 14.6827Z"
                fill="#171719"
              />
              <path
                d="M121.57 23.5222C125.524 23.5222 128.013 21.6845 128.013 19.0792V18.8H123.64V19.0559C123.64 19.7538 123.175 20.0562 121.407 20.0562C119.546 20.0562 118.918 19.6607 118.848 18.2418H128.037C128.083 17.823 128.106 17.5206 128.106 17.1252C128.106 13.3567 125.524 11.333 121.477 11.333C117.569 11.333 114.801 13.6126 114.801 17.4276C114.801 21.8241 117.592 23.5222 121.57 23.5222ZM121.384 14.6827C123.012 14.6827 123.71 15.0316 123.873 16.0319H118.918C119.104 15.0316 119.779 14.6827 121.384 14.6827Z"
                fill="url(#paint4_linear_249_3008)"
              />
              <path
                d="M138.279 23.2896V19.3583H136.185C135.185 19.3583 134.906 19.1257 134.906 18.1952V15.1479H138.279V11.5656H134.906V9.54179H130.533V11.5656H128.811V15.1479H130.533V18.8233C130.533 21.8706 132.277 23.2896 135.208 23.2896H138.279Z"
                fill="#171719"
              />
              <path
                d="M138.279 23.2896V19.3583H136.185C135.185 19.3583 134.906 19.1257 134.906 18.1952V15.1479H138.279V11.5656H134.906V9.54179H130.533V11.5656H128.811V15.1479H130.533V18.8233C130.533 21.8706 132.277 23.2896 135.208 23.2896H138.279Z"
                fill="url(#paint5_linear_249_3008)"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M83.8645 29.3122L83.0833 27.8867L82.3021 29.3122L80.8766 30.0934L82.3021 30.8746L83.0833 32.3L83.8645 30.8746L85.2899 30.0934L83.8645 29.3122ZM60.7775 44.57C64.9675 44.57 66.7921 42.5426 66.7921 40.3801C66.7921 38.0374 65.0576 36.8885 62.3544 36.3704L59.1782 35.7397C56.9481 35.2666 55.9569 34.7485 55.9569 33.0365C55.9569 31.3921 57.3085 30.5361 60.3045 30.5361C63.5933 30.5361 64.9449 31.7075 64.9449 33.8925V34.1628H66.5668V34.0277C66.5668 31.2795 64.6746 29.0268 60.4171 29.0268C56.0921 29.0268 54.335 31.0993 54.335 33.1492C54.335 35.6496 56.2948 36.6858 58.7502 37.1588L61.9489 37.7671C64.1565 38.2176 65.1702 38.8258 65.1702 40.5153C65.1702 42.2273 63.7961 43.0608 60.7775 43.0608C57.2409 43.0608 55.8893 41.8894 55.8893 39.7269V39.434H54.2674V39.5692C54.2674 42.4525 56.3399 44.57 60.7775 44.57ZM74.4092 44.57C77.5178 44.57 79.9507 42.7229 79.9507 40.0422V39.862H78.3738V39.9972C78.3738 41.9795 76.9321 43.1058 74.3866 43.1058C71.4132 43.1058 70.1292 41.5064 70.1292 38.7807C70.1292 36.0551 71.4132 34.4557 74.3866 34.4557C76.9321 34.4557 78.3738 35.582 78.3738 37.5643V37.6995H79.9507V37.5193C79.9507 34.8386 77.5178 32.9915 74.4092 32.9915C70.85 32.9915 68.5298 35.4018 68.5298 38.7807C68.5298 42.1597 70.85 44.57 74.4092 44.57ZM82.3193 33.2167H83.9186V44.3448H82.3193V33.2167ZM92.1279 44.57C95.2365 44.57 97.5342 42.9707 97.5342 40.6504V40.4928H95.9349V40.6504C95.9349 42.2723 94.7184 43.241 92.1054 43.241C89.1544 43.241 87.8704 41.7317 87.7803 39.2313H97.5793C97.6469 38.9384 97.6919 38.6005 97.6919 38.1951C97.6919 34.8837 95.3717 32.9915 92.1054 32.9915C88.5237 32.9915 86.2711 35.4018 86.2711 38.7807C86.2711 42.3174 88.5462 44.57 92.1279 44.57ZM92.0829 34.3205C94.6959 34.3205 96.1827 35.5595 96.1827 37.9022V38.2401H87.7803C87.893 35.8073 89.1995 34.3205 92.0829 34.3205ZM101.638 38.961V44.3448H100.039V33.2167H101.48V36.7083H101.593C101.976 34.8161 103.553 32.9915 106.323 32.9915C109.455 32.9915 111.009 35.2216 111.009 37.8572V44.3448H109.41V38.0824C109.41 35.7847 108.306 34.4557 105.76 34.4557C103.057 34.4557 101.638 36.1001 101.638 38.961ZM119.153 44.57C122.262 44.57 124.695 42.7229 124.695 40.0422V39.862H123.118V39.9972C123.118 41.9795 121.676 43.1058 119.131 43.1058C116.157 43.1058 114.873 41.5064 114.873 38.7807C114.873 36.0551 116.157 34.4557 119.131 34.4557C121.676 34.4557 123.118 35.582 123.118 37.5643V37.6995H124.695V37.5193C124.695 34.8386 122.262 32.9915 119.153 32.9915C115.594 32.9915 113.274 35.4018 113.274 38.7807C113.274 42.1597 115.594 44.57 119.153 44.57ZM137.763 40.6504C137.763 42.9707 135.465 44.57 132.357 44.57C128.775 44.57 126.5 42.3174 126.5 38.7807C126.5 35.4018 128.753 32.9915 132.334 32.9915C135.601 32.9915 137.921 34.8837 137.921 38.1951C137.921 38.6005 137.876 38.9384 137.808 39.2313H128.009C128.099 41.7317 129.383 43.241 132.334 43.241C134.947 43.241 136.164 42.2723 136.164 40.6504V40.4928H137.763V40.6504ZM136.412 37.9022C136.412 35.5595 134.925 34.3205 132.312 34.3205C129.428 34.3205 128.122 35.8073 128.009 38.2401H136.412V37.9022Z"
                fill="#171719"
              />
              <path
                d="M35.272 23.2896C39.7492 27.7667 40.6048 34.6902 40.6048 40.5751C40.6048 40.5751 34.9752 35.0125 34.4445 34.4818C34.9502 32.2082 35.5019 26.4157 35.272 23.2896Z"
                fill="url(#paint6_linear_249_3008)"
              />
              <path
                d="M11.3664 23.2896C6.88925 27.7667 6.03361 34.6902 6.03361 40.5751C6.03361 40.5751 11.6632 35.0125 12.1939 34.4818C11.6882 32.2082 11.1365 26.4157 11.3664 23.2896Z"
                fill="url(#paint7_linear_249_3008)"
              />
              <path
                d="M28.3763 43.9112C28.3763 47.6563 23.3194 50.4867 23.3194 53.907C23.3194 50.4868 18.2624 47.6568 18.2624 43.9112C18.277 41.9809 18.978 40.1746 20.1507 39.0462C20.2936 38.8997 20.4431 38.7653 20.5988 38.6443C20.5831 38.7088 20.5702 38.7744 20.5605 38.8409C20.4837 39.1852 20.4428 39.5421 20.4388 39.9013C20.4388 42.2611 23.3193 46.2115 23.3193 46.2115C23.3193 46.2115 26.1999 42.2611 26.1999 39.9013C26.2001 39.5429 26.1636 39.186 26.091 38.8409C26.0813 38.7745 26.0684 38.7088 26.0527 38.6443C26.2081 38.7653 26.3579 38.8997 26.5008 39.0462C27.6687 40.178 28.3648 41.9839 28.3763 43.9112H28.3763Z"
                fill="url(#paint8_linear_249_3008)"
              />
              <path
                d="M38.6742 0.303467L39.6507 2.08532L41.4326 3.0618L39.6507 4.03828L38.6742 5.82013L37.6977 4.03828L35.9159 3.0618L37.6977 2.08532L38.6742 0.303467Z"
                fill="url(#paint9_linear_249_3008)"
              />
              <path
                d="M4.97635 12.624L6.0342 14.5544L7.96454 15.6122L6.0342 16.6701L4.97635 18.6004L3.9185 16.6701L1.98816 15.6122L3.9185 14.5544L4.97635 12.624Z"
                fill="url(#paint10_linear_249_3008)"
              />
              <path
                d="M45.4281 7.93506H45.5274C45.957 7.93506 46.3053 8.404 46.3053 8.78423V22.4406C46.3053 22.9095 45.957 23.2898 45.5274 23.2898H45.4281C44.9985 23.2898 44.6503 22.8208 44.6503 22.4406V8.78423C44.6503 8.31529 44.9985 7.93506 45.4281 7.93506Z"
                fill="url(#paint11_linear_249_3008)"
              />
              <path
                d="M38.5995 9.77368H38.7484C39.1644 9.77368 39.5014 10.2029 39.5014 10.5505V14.9732C39.5014 15.4024 39.164 15.7501 38.7484 15.7501H38.5995C38.1834 15.7501 37.8464 15.3209 37.8464 14.9732V10.5505C37.8464 10.1213 38.1838 9.77368 38.5995 9.77368Z"
                fill="url(#paint12_linear_249_3008)"
              />
              <path
                d="M1.16072 18.6003C1.61769 18.6003 1.98822 19.1656 1.98822 19.624V32.9314C1.98822 33.4967 1.61769 33.955 1.16072 33.955C0.703751 33.955 0.333221 33.3898 0.333221 32.9314V19.624C0.333221 19.0587 0.703751 18.6003 1.16072 18.6003Z"
                fill="url(#paint13_linear_249_3008)"
              />
              <path
                d="M5.02235 22.4619C5.47932 22.4619 5.84985 22.9189 5.84985 23.2894C5.84985 23.7464 5.47932 24.1169 5.02235 24.1169C4.56539 24.1169 4.19485 23.6599 4.19485 23.2894C4.19485 22.8324 4.56539 22.4619 5.02235 22.4619Z"
                fill="url(#paint14_linear_249_3008)"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M24.5413 0.875223C26.8816 3.73922 32.1665 11.1411 33.3621 20.8966L33.3617 20.8965C33.5313 22.2111 33.6166 23.5396 33.6169 24.8705C33.6244 27.6781 33.4317 30.481 33.0409 33.2475C32.7938 35.0654 32.443 36.8598 31.9913 38.6175C31.9913 38.6175 27.3842 34.787 23.4113 34.787C19.4383 34.787 14.8312 38.6443 14.8312 38.6443C14.3795 36.8866 14.0287 35.0922 13.7817 33.2743C13.3908 30.5079 13.1982 27.7049 13.2057 24.8973C13.2047 23.5577 13.2899 22.22 13.4608 20.8966C14.6569 11.1498 19.9418 3.74842 22.2816 0.875223C22.582 0.509235 22.9881 0.303467 23.4115 0.303467C23.8348 0.303467 24.2409 0.509235 24.5413 0.875223ZM18.3617 22.1499C18.4323 20.7003 19.7943 19.5408 21.4895 19.4871L23.3631 19.4278L25.2368 19.4871C26.932 19.5408 28.2939 20.7003 28.3646 22.1499L28.4201 23.2894L28.3646 24.429C28.2939 25.8786 26.932 27.038 25.2368 27.0917L23.3631 27.1511L21.4895 27.0917C19.7943 27.038 18.4323 25.8786 18.3617 24.429L18.3062 23.2894L18.3617 22.1499Z"
                fill="url(#paint15_linear_249_3008)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_249_3008"
                x1="65.411"
                y1="5.49864"
                x2="78.5089"
                y2="55.2588"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_249_3008"
                x1="65.411"
                y1="5.49864"
                x2="78.5089"
                y2="55.2588"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_249_3008"
                x1="65.411"
                y1="5.49864"
                x2="78.5089"
                y2="55.2588"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_249_3008"
                x1="65.411"
                y1="5.49864"
                x2="78.5089"
                y2="55.2588"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint4_linear_249_3008"
                x1="65.411"
                y1="5.49864"
                x2="78.5089"
                y2="55.2588"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint5_linear_249_3008"
                x1="65.411"
                y1="5.49864"
                x2="78.5089"
                y2="55.2588"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint6_linear_249_3008"
                x1="35.3014"
                y1="25.6519"
                x2="49.0652"
                y2="31.3377"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint7_linear_249_3008"
                x1="11.3371"
                y1="25.6519"
                x2="-4.41708"
                y2="31.4839"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint8_linear_249_3008"
                x1="18.2624"
                y1="38.6443"
                x2="26.6966"
                y2="50.7907"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint9_linear_249_3008"
                x1="32.6978"
                y1="-0.47806"
                x2="41.4298"
                y2="7.86481"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint10_linear_249_3008"
                x1="-0.0346166"
                y1="11.9344"
                x2="4.16502"
                y2="19.1027"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint11_linear_249_3008"
                x1="44.8805"
                y1="10.0335"
                x2="48.7368"
                y2="10.5639"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint12_linear_249_3008"
                x1="38.0766"
                y1="10.5905"
                x2="41.5698"
                y2="11.8247"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint13_linear_249_3008"
                x1="0.563413"
                y1="20.6988"
                x2="4.4198"
                y2="21.2292"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint14_linear_249_3008"
                x1="4.42505"
                y1="22.6881"
                x2="5.92021"
                y2="24.5958"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <linearGradient
                id="paint15_linear_249_3008"
                x1="16.0445"
                y1="5.54338"
                x2="49.2052"
                y2="28.0687"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#46008C" />
                <stop offset="1" stop-color="#49D4F2" />
              </linearGradient>
              <clipPath id="clip0_249_3008">
                <rect
                  width="137.917"
                  height="53.6036"
                  fill="white"
                  transform="translate(0.333252 0.303467)"
                />
              </clipPath>
            </defs>
          </svg>
        </a>
      </div>
      <div class="header__right">
        <button
          class="burger-menu"
          :class="{ active: menu }"
          @click="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav class="nav-menu" :class="{ active: menu }">
          <ul class="nav-list">
            <li v-for="(item, index) in menuList" :key="index">
              <a
                :href="'#' + item.anchor"
                @click.prevent="scrollAnchor(item)"
                >{{ item.name }}</a
              >
            </li>
          </ul>
          <ul class="socials">
            <li>
              <span>Join our telegram</span>
              <a href="#" target="_blank">
                <span>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M5.95881 16.7826C7.82921 15.7523 9.91708 14.8924 11.8679 14.0282C15.224 12.6126 18.5935 11.2215 21.9969 9.92642C22.6591 9.70577 23.8489 9.49001 23.9656 10.4713C23.9017 11.8604 23.6389 13.2413 23.4587 14.6222C23.0012 17.659 22.4723 20.6854 21.9567 23.7122C21.779 24.7205 20.516 25.2424 19.7079 24.5972C17.7657 23.2853 15.8087 21.9862 13.8913 20.644C13.2633 20.0058 13.8457 19.0893 14.4066 18.6336C16.0062 17.0572 17.7026 15.7178 19.2186 14.06C19.6275 13.0725 18.4193 13.9047 18.0207 14.1597C15.8308 15.6688 13.6946 17.27 11.3858 18.5962C10.2064 19.2454 8.83191 18.6907 7.65311 18.3284C6.59619 17.8908 5.04737 17.4499 5.95871 16.7827L5.95881 16.7826Z"
                      fill="#2B2B42"
                    />
                  </svg>
                </span>
              </a>
            </li>
          </ul>
        </nav>
        <ul class="socials">
          <li>
            <a href="#" target="_blank">
              <span>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M5.95881 16.7826C7.82921 15.7523 9.91708 14.8924 11.8679 14.0282C15.224 12.6126 18.5935 11.2215 21.9969 9.92642C22.6591 9.70577 23.8489 9.49001 23.9656 10.4713C23.9017 11.8604 23.6389 13.2413 23.4587 14.6222C23.0012 17.659 22.4723 20.6854 21.9567 23.7122C21.779 24.7205 20.516 25.2424 19.7079 24.5972C17.7657 23.2853 15.8087 21.9862 13.8913 20.644C13.2633 20.0058 13.8457 19.0893 14.4066 18.6336C16.0062 17.0572 17.7026 15.7178 19.2186 14.06C19.6275 13.0725 18.4193 13.9047 18.0207 14.1597C15.8308 15.6688 13.6946 17.27 11.3858 18.5962C10.2064 19.2454 8.83191 18.6907 7.65311 18.3284C6.59619 17.8908 5.04737 17.4499 5.95871 16.7827L5.95881 16.7826Z"
                    fill="#2B2B42"
                  />
                </svg>
              </span>
            </a>
          </li>
        </ul>
        <div v-click-outside="hideDropdownWallet" class="btn-cover">
          <template v-if="walletAddress">
            <button class="btn btn-white" @click="toggleDropdownWallet">
              <span>{{ publicKeyShortenerHelper(walletAddress) }}</span>
              <span class="level">User Level: {{ userLevel }}</span>
            </button>
          </template>
          <template v-else>
            <button class="btn btn-white" @click="toggleDropdownWallet">
              <span>Wallet Connect</span>
            </button>
          </template>
          <transition name="dropdown-wallet">
            <div v-if="dropdownWallet" class="dropdown">
              <div class="dropdown__top">
                <h6>Connect Wallet</h6>
                <div class="btn-close" @click="toggleDropdownWallet">
                  <SvgIcon name="close" class="icon--close" />
                </div>
              </div>
              <div class="dropdown__content">
                <template v-if="walletAddress">
                  <button
                    class="btn btn--disconnect"
                    @click="walletDiscountHahdler"
                  >
                    <span class="text">Disconnect</span>
                  </button>
                </template>
                <template v-else>
                  <button
                    v-if="isMetamaskAvailable"
                    class="btn"
                    @click="metamaskConnectHandler"
                  >
                    <span class="icon">
                      <img src="@/static/metamask.png" alt="icon" />
                    </span>
                    <span class="text">MetaMask</span>
                  </button>
                  <button
                    v-if="isBinanceSmartChainWalletAvailable"
                    class="btn"
                    @click="binanceChainConnectHandler"
                  >
                    <span class="icon">
                      <img src="@/static/binance-chain-wallet.png" alt="icon" />
                    </span>
                    <span class="text">Binance Chain</span>
                  </button>
                  <button
                    v-if="isWalletConnectAvailable"
                    class="btn"
                    @click="walletConnectHandler"
                  >
                    <span class="icon">
                      <img src="@/static/wallet-connect.png" alt="icon" />
                    </span>
                    <span class="text">WalletConnect</span>
                  </button>
                </template>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@import '~/assets/styles/variables.scss';

header {
  background-color: transparent;
  border-bottom: 1px solid transparent;
  position: fixed;
  z-index: 5;
  width: 100%;
  top: 0;
  left: 0;
  padding: 35px 0;
  transition: 0.3s ease;
  @media (max-width: $media_xxl) {
    padding: 25px 0;
  }
  @media (max-width: $media_lg) {
    padding: 20px 0;
  }
  .logo {
    position: relative;
    z-index: 1;
  }
  &.onScroll {
    background-color: rgba(map-get($colors, 'black-300'), 0.7);
    border-color: rgba(255, 255, 255, 0.4);
    padding: 20px 0;
    .logo {
      display: flex;
      &:not(.active) {
        svg {
          path {
            fill: map-get($colors, 'white');
          }
        }
      }
    }
  }
  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.header {
  &__right {
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .btn-cover {
      position: relative;
      z-index: 1;
      margin-left: 42px;
      @media (max-width: $media_xxl) {
        margin-left: 32px;
      }
      @media (max-width: $media_xl) {
        margin-left: 24px;
      }
      @media (max-width: $media_sm) {
        margin-left: 0;
      }
      > .btn {
        width: 276px;
        flex: 0 0 auto;
        flex-direction: column;
        @media (max-width: $media_xxl) {
          width: 220px;
        }
        @media (max-width: $media_xl) {
          width: 172px;
        }
        @media (max-width: $media_sm) {
          width: 135px;
          height: 48px;
          font-size: 12px;
          padding: 0 10px;
        }
        @media (max-width: $media_xs) {
          width: 120px;
        }
        .level {
          color: map-get($colors, 'black');
          font-size: 18px;
          @media (max-width: $media_xxl) {
            font-size: 14px;
          }
          @media (max-width: $media_sm) {
            font-size: 12px;
          }
        }
      }
    }
    > .socials {
      flex: 0 0 auto;
      margin-left: 72px;
      position: relative;
      z-index: 1;
      @media (max-width: $media_xxl) {
        margin-left: 54px;
      }
      @media (max-width: $media_xl) {
        margin-left: 40px;
      }
      @media (max-width: $media_sm) {
        display: none;
      }
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(map-get($colors, 'black-300'), 0.7);
  opacity: 0;
  pointer-events: none;
  transition: 0.3s ease;
  &.active {
    opacity: 1;
    pointer-events: auto;
  }
}

.burger-menu {
  position: fixed;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border: none;
  outline: 0;
  cursor: pointer;
  z-index: 1;
  border-radius: 50%;
  background-color: map-get($colors, 'turquoise');
  box-shadow: 0 0 0 10px rgba(map-get($colors, 'turquoise'), 0.4);
  transition: 0.3s ease;
  display: none;
  @media (max-width: $media_lg) {
    display: inline-block;
  }
  @media (max-width: $media_sm) {
    top: 25px;
  }
  &:active {
    box-shadow: 0 0 0 0 rgba(map-get($colors, 'turquoise'), 0.4);
  }
  span {
    position: absolute;
    left: 50%;
    width: 20px;
    height: 2px;
    background: #2b2b42;
    border-radius: 8px;
    &:nth-child(1) {
      top: 13px;
      transform: translateX(-50%) translateY(0);
      transition: top 0.3s cubic-bezier(0.21, 0.83, 0.26, 0.87) 0.3s,
        transform 0.3s cubic-bezier(0.21, 0.83, 0.26, 0.87);
    }
    &:nth-child(2) {
      top: 19px;
      opacity: 1;
      width: 12px;
      transform: translateX(-50%);
    }
    &:last-child {
      top: 25px;
      transform: translateX(-50%) translateY(0);
      transition: top 0.3s cubic-bezier(0.21, 0.83, 0.26, 0.87) 0.3s,
        transform 0.3s cubic-bezier(0.21, 0.83, 0.26, 0.87);
    }
  }
  &.active {
    background-color: map-get($colors, 'violet');
    box-shadow: 0 0 0 10px rgba(map-get($colors, 'violet'), 0.4);
    &:active {
      box-shadow: 0 0 0 0 rgba(map-get($colors, 'violet'), 0.4);
    }
    span {
      background-color: map-get($colors, 'white');
      &:nth-child(1) {
        top: 50%;
        transform: translateX(-50%) translateY(0) rotate(45deg);
        transition: top 0.3s cubic-bezier(0.21, 0.83, 0.26, 0.87),
          transform 0.3s cubic-bezier(0.21, 0.83, 0.26, 0.87) 0.3s;
      }
      &:nth-child(2) {
        opacity: 0;
      }
      &:last-child {
        top: 50%;
        transform: translateX(-50%) translateY(0) rotate(-45deg);
        transition: bottom 0.3s cubic-bezier(0.21, 0.83, 0.26, 0.87),
          transform 0.3s cubic-bezier(0.21, 0.83, 0.26, 0.87) 0.3s;
      }
    }
  }
}

.nav-menu {
  @media (max-width: $media_lg) {
    top: -35px;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    left: 0;
    width: 100vw;
    padding: 115px 32px 42px;
    border-radius: 0 0 32px 32px;
    background-color: map-get($colors, 'white-400');
    box-shadow: inset 0px 0.798571px 10px rgba(227, 222, 255, 0.2);
    backdrop-filter: blur(15px);
    background-image: url('~static/menu-gradient.png');
    background-position: bottom right;
    background-repeat: no-repeat;
    background-size: cover;
    transition: 0.3s ease;
    @media (max-width: $media_sm) {
      padding: 115px 30px 30px;
      border-radius: 0px 0px 28px 28px;
    }
    &.active {
      top: 0;
      opacity: 1;
      pointer-events: auto;
    }
  }
  .socials {
    display: none;
    margin-top: 60px;
    @media (max-width: $media_sm) {
      display: block;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      color: map-get($colors, 'turquoise');
      font-size: $font_size_md;
      font-size: 16px;
      font-weight: 500;
      a {
        margin-left: 20px;
        flex: 0 0 auto;
      }
    }
  }
}

.nav-list {
  display: flex;
  align-items: center;
  font-size: $font_size_md;
  @media (max-width: $media_xxl) {
    font-size: 16px;
  }
  @media (max-width: $media_xl) {
    font-size: 14px;
  }
  @media (max-width: $media_lg) {
    display: block;
    font-size: 20px;
  }
  li {
    + li {
      margin-left: 53px;
      @media (max-width: $media_xxl) {
        margin-left: 43px;
      }
      @media (max-width: $media_xl) {
        margin-left: 32px;
      }
      @media (max-width: $media_lg) {
        margin-left: 0;
        margin-top: 10px;
      }
    }
    a {
      text-transform: capitalize;
      display: block;
      color: rgba(map-get($colors, 'white'), 0.8);
      position: relative;
      @media (max-width: $media_lg) {
        color: rgba(map-get($colors, 'black'), 0.8);
        display: inline-block;
      }
      &:hover {
        color: rgba(map-get($colors, 'white'), 1);
        @media (max-width: $media_lg) {
          color: rgba(map-get($colors, 'black-300'), 1);
        }
        &:before {
          transform: translateX(-50%) scale(1);
          @media (max-width: $media_lg) {
            transform: translate(0, -50%) scale(1);
          }
        }
      }
      &:before {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-top: 8px;
        background-color: map-get($colors, 'turquoise');
        transition: 0.3s ease;
        transform: translateX(-50%) scale(0);
        @media (max-width: $media_xxl) {
          width: 8px;
          height: 8px;
          margin-top: 5px;
        }
        @media (max-width: $media_lg) {
          left: 100%;
          top: 50%;
          margin-left: 12px;
          margin-top: 0;
          transform: translate(0, -50%) scale(0);
        }
      }
    }
  }
}

.dropdown {
  background-color: map-get($colors, 'white-400');
  box-shadow: 0px 1px 13px rgba(0, 0, 0, 0.1);
  padding: 45px 32px 32px 32px;
  border-radius: 0 0 32px 32px;
  position: absolute;
  top: -35px;
  right: 0;
  width: 438px;
  z-index: 1;
  transition: 0.25s ease;
  @media (max-width: $media_xxl) {
    width: 380px;
  }
  @media (max-width: $media_sm) {
    border-radius: 0 0 28px 28px;
    padding: 40px 30px 30px;
    width: 100vw;
    right: -30px;
  }
  @media (max-width: $media_xs) {
    right: -15px;
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__content {
    margin-top: 30px;
    text-align: center;
    .btn {
      width: 100%;
      max-width: 280px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-left: auto;
      margin-right: auto;
      &--disconnect {
        justify-content: center;
      }
      @media (max-width: $media_xxl) {
        max-width: 250px;
      }
      @media (max-width: $media_xl) {
        max-width: 240px;
      }
      .icon {
        flex: 0 0 auto;
        border-radius: 4px;
        overflow: hidden;
        margin-right: 12px;
        img {
          display: block;
          width: 34px;
          @media (max-width: $media_sm) {
            width: 30px;
          }
        }
      }
      + * {
        margin-top: 10px;
      }
    }
  }
  &__btn-group {
    margin-top: 16px;
    .btn {
      width: 192px;
    }
    * + .btn {
      margin-top: 8px;
    }
  }

  &__logo {
    width: 24px;
    height: 23px;
  }

  &__list {
    li {
      a {
        font-weight: 500;
        font-size: 24px;
        line-height: 30px;
      }
      + li {
        margin-top: 24px;
      }
    }
  }
}

.dropdown-wallet-enter-active,
.dropdown-wallet-leave-active,
.dropdown-enter-active,
.dropdown-leave-active {
  transform: translateY(0);
}
.dropdown-wallet-enter,
.dropdown-wallet-leave-to,
.dropdown-enter,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
