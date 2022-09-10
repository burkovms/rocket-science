<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  ref,
  useStore,
  watch,
} from '@nuxtjs/composition-api';
import { CardActionsEnum } from '~/types/enum/store/card/actions.enum';
import { WalletGettersEnum } from '~/types/enum/store/wallet/getters.enum';
import { useDispatch } from '~/utils/useDispatch.helper';
import {
  decimalAdjust,
  TypeDecimalAdjustEnum,
} from '~/utils/decimalAdjust.helper';

type NumberOrString = number | string;

interface CalculateDataInterface {
  amount: NumberOrString;
  pDay: NumberOrString;
  in10Day: NumberOrString;
  in15Day: NumberOrString;
}

export default defineComponent({
  setup(_props, context) {
    const store = useStore();
    const calculateData = reactive<CalculateDataInterface>({
      amount: '',
      pDay: 0.0,
      in10Day: 0.0,
      in15Day: 0.0,
    });
    const isLoadingInvest = ref(false);
    const isInvestBntDisabled = ref(true);

    // computed
    const walletAddress = computed(
      () => store.getters[WalletGettersEnum.walletAddress]
    );

    const ballance = computed(() => {
      if (!walletAddress.value) return '0.0';

      return decimalAdjust(
        TypeDecimalAdjustEnum.floor,
        parseFloat(store.getters[WalletGettersEnum.ballance]),
        -2
      );
    });

    const calculate = (_event: InputEvent, value: any) => {
      const _value = parseFloat(value);

      if (value === '') {
        isInvestBntDisabled.value = true;
        for (const prop in calculateData) {
          if (Object.prototype.hasOwnProperty.call(calculateData, prop)) {
            // @ts-ignore
            calculateData[prop] = 0;
          }
        }
      } else {
        !walletAddress.value
          ? (isInvestBntDisabled.value = true)
          : (isInvestBntDisabled.value = false);
        calculateData.amount = _value;
        calculateData.pDay = (_value * 0.15).toFixed(4);
        calculateData.in10Day = (_value * 0.15 * 10).toFixed(4);
        calculateData.in15Day = (_value * 0.15 * 15).toFixed(4);
      }
    };

    const investHandler = async () => {
      try {
        isLoadingInvest.value = true;
        isInvestBntDisabled.value = true;
        await store.dispatch(
          useDispatch('card', CardActionsEnum.investHandler),
          calculateData.amount
        );
        calculateData.amount = 0;
        isLoadingInvest.value = false;
      } catch (error) {
        // @ts-ignore
        context.root.$toast.error(error);
        isLoadingInvest.value = false;
        isInvestBntDisabled.value = false;
      }
    };

    watch(
      () => walletAddress.value,
      (state, _prevState) => {
        !state
          ? (isInvestBntDisabled.value = true)
          : (isInvestBntDisabled.value = false);
      }
    );

    return {
      ballance,
      calculateData,
      isLoadingInvest,
      isInvestBntDisabled,
      calculate,
      investHandler,
    };
  },
});
</script>
<template>
  <div class="calc-invest">
    <div class="invest-action">
      <div class="invest-action__element">
        <div class="invest-action__desc invest-action__desc--top">
          Enter the investment amount
        </div>
        <input
          v-model="calculateData.amount"
          type="number"
          class="invest-action__input"
          placeholder="0"
          autocomplete="off"
          @change="(e) => calculate(e, calculateData.amount)"
        />
        <div class="invest-action__desc invest-action__desc--bottom">
          <span>min. 0.01 BNB</span>
          <span>max. 999 BNB</span>
          <span
            >You balance: <b class="fw-500">{{ ballance }} BNB</b></span
          >
        </div>
        <div class="invest-action__input-сoin">
          <div class="invest-action__input-logo">
            <SvgIcon name="bnb-logo" />
          </div>
          <span>BNB</span>
        </div>
      </div>
      <SharedButton
        :is-loading="isLoadingInvest"
        :is-disabled="isInvestBntDisabled"
        class="btn-turquoise invest-action__bnt"
        @buttonHandler="investHandler"
      >
        Invest
      </SharedButton>
    </div>
    <ul class="calculation-list">
      <li class="calculation-list__item">
        <div class="calculation-list__key">In 24 hours:</div>
        <div class="calculation-list__value">
          <span class="calculation-list__value-amount">{{
            calculateData.pDay
          }}</span>
          <div class="calculation-list__value-coin">
            <span>BNB</span>
            <div class="calculation-list__coin-logo">
              <SvgIcon name="bnb-logo" />
            </div>
          </div>
        </div>
      </li>
      <li class="calculation-list__item">
        <div class="calculation-list__key">In 10 days:</div>
        <div class="calculation-list__value">
          <span class="calculation-list__value-amount">{{
            calculateData.in10Day
          }}</span>
          <div class="calculation-list__value-coin">
            <span>BNB</span>
            <div class="calculation-list__coin-logo">
              <SvgIcon name="bnb-logo" />
            </div>
          </div>
        </div>
      </li>
      <li class="calculation-list__item">
        <div class="calculation-list__key">In 15 days:</div>
        <div class="calculation-list__value">
          <span class="calculation-list__value-amount">{{
            calculateData.in15Day
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
  </div>
</template>
<style lang="scss" src="./index.scss" scoped />
